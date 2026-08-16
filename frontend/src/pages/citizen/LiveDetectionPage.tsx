import { useState, useRef, useEffect, useCallback } from 'react';
import { Video, StopCircle, PlayCircle, Camera, Loader2, AlertCircle, CheckCircle, XCircle, Settings, Download } from 'lucide-react';
import { predictImage, PredictResponse } from '../../services/ml';

export function LiveDetectionPage() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<PredictResponse | null>(null);
  const [isInferring, setIsInferring] = useState(false);
  const [inferenceError, setInferenceError] = useState<string | null>(null);
  const [frameCount, setFrameCount] = useState(0);
  const [detectionHistory, setDetectionHistory] = useState<PredictResponse[]>([]);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [throttleMs, setThrottleMs] = useState(1000);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inferenceIntervalRef = useRef<number | null>(null);
  const lastInferenceTime = useRef(0);

  const startCamera = useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }

      setStream(mediaStream);
      setIsActive(true);
      startInferenceLoop();
    } catch (err: any) {
      let message = 'Failed to access camera';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        message = 'Camera permission denied. Please allow camera access in browser settings.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        message = 'No camera found. Please connect a camera and try again.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        message = 'Camera is already in use by another application.';
      } else if (err.name === 'OverconstrainedError') {
        message = 'Camera does not support the requested configuration.';
      } else if (err.message) {
        message = err.message;
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (inferenceIntervalRef.current) {
      clearInterval(inferenceIntervalRef.current);
      inferenceIntervalRef.current = null;
    }

    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setStream(null);
    setIsActive(false);
    setPredictions(null);
    setDetectionHistory([]);
    setFrameCount(0);
  }, [stream]);

  const startInferenceLoop = useCallback(() => {
    if (inferenceIntervalRef.current) {
      clearInterval(inferenceIntervalRef.current);
    }

    inferenceIntervalRef.current = window.setInterval(async () => {
      if (!videoRef.current || !canvasRef.current || isInferring) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video.readyState !== video.HAVE_ENOUGH_DATA) return;

      const now = Date.now();
      if (now - lastInferenceTime.current < throttleMs) return;
      lastInferenceTime.current = now;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.8));
      if (!blob) return;

      setIsInferring(true);
      setInferenceError(null);

      try {
        const file = new File([blob], 'frame.jpg', { type: 'image/jpeg' });
        const results = await predictImage(file);
        setPredictions(results);
        setDetectionHistory(prev => [...prev.slice(-9), results]);
        setFrameCount(c => c + 1);
      } catch (err: any) {
        setInferenceError(err.message || 'Inference failed');
      } finally {
        setIsInferring(false);
      }
    }, Math.max(100, throttleMs));
  }, [isInferring, throttleMs]);

  useEffect(() => {
    return () => {
      if (inferenceIntervalRef.current) {
        clearInterval(inferenceIntervalRef.current);
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const captureFrame = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `civicshield-frame-${Date.now()}.jpg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const switchCamera = () => {
    if (!isActive) {
      setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
      return;
    }
    const newFacingMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newFacingMode);
    stopCamera();
    setTimeout(() => startCamera(), 500);
  };

  const aggregatedDetections = detectionHistory.flatMap(d => d.detections);
  const classCounts: Record<string, { count: number; maxConf: number }> = {};
  aggregatedDetections.forEach(d => {
    if (!classCounts[d.class_name] || d.confidence > classCounts[d.class_name].maxConf) {
      classCounts[d.class_name] = { count: (classCounts[d.class_name]?.count || 0) + 1, maxConf: d.confidence };
    }
  });

  return (
    <div className="page live-detection-page">
      <header className="page-header">
        <div>
          <h1>Live Detection</h1>
          <p className="muted">Real-time AI detection from camera feed</p>
        </div>
        <div className="status-indicator-container">
          <span className={`status-indicator ${isActive ? 'active' : 'idle'}`} />
          <span>{isActive ? 'LIVE' : 'STANDBY'}</span>
        </div>
      </header>

      {error && (
        <div className="alert alert-error" role="alert">
          <AlertCircle size={18} />
          <span>{error}</span>
          {error.includes('permission') && (
            <button className="btn btn-sm btn-outline" onClick={startCamera}>Retry</button>
          )}
        </div>
      )}

      <div className="live-layout">
        <section className="camera-section">
          <div className="camera-container">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="camera-video"
              style={{ display: isActive ? 'block' : 'none' }}
            />
            <canvas ref={canvasRef} className="camera-canvas" style={{ display: 'none' }} />

            {!isActive && (
              <div className="camera-placeholder">
                <Camera size={64} className="placeholder-icon" />
                <h3>Camera Inactive</h3>
                <p>Click "Start Camera" to begin live AI detection</p>
                <div className="placeholder-features">
                  <span className="feature-tag">Pothole Detection</span>
                  <span className="feature-tag">Waterlogging Detection</span>
                </div>
              </div>
            )}

            {isLoading && (
              <div className="camera-overlay loading">
                <Loader2 className="spin" size={32} />
                <p>Starting camera...</p>
              </div>
            )}

            {isInferring && isActive && (
              <div className="scanline" aria-hidden="true" />
            )}
          </div>

          <div className="camera-controls">
            {!isActive ? (
              <button
                className="btn btn-primary btn-lg"
                onClick={startCamera}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="spin" size={20} />
                    <span>Starting...</span>
                  </>
                ) : (
                  <>
                    <PlayCircle size={20} />
                    <span>Start Camera</span>
                  </>
                )}
              </button>
            ) : (
              <div className="control-group">
                <button
                  className="btn btn-danger btn-lg"
                  onClick={stopCamera}
                >
                  <StopCircle size={20} />
                  <span>Stop Camera</span>
                </button>
                <button
                  className="btn btn-outline"
                  onClick={switchCamera}
                  title="Switch camera"
                >
                  <Camera size={20} />
                </button>
                <button
                  className="btn btn-outline"
                  onClick={captureFrame}
                  title="Capture frame"
                >
                  <Download size={20} />
                </button>
              </div>
            )}
          </div>

          <div className="camera-meta">
            <div className="meta-item">
              <span className="meta-label">Frames Processed</span>
              <span className="meta-value">{frameCount}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Inference Rate</span>
              <span className="meta-value">{throttleMs}ms</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Camera</span>
              <span className="meta-value">{facingMode === 'environment' ? 'Rear' : 'Front'}</span>
            </div>
          </div>
        </section>

        <aside className="detection-panel">
          <div className="panel-header">
            <h2>AI Detections</h2>
            <div className="panel-controls">
              <label className="throttle-control">
                <Settings size={16} />
                <input
                  type="range"
                  min="100"
                  max="5000"
                  step="100"
                  value={throttleMs}
                  onChange={e => setThrottleMs(Number(e.target.value))}
                  aria-label="Inference throttle (ms)"
                />
                <span>{throttleMs}ms</span>
              </label>
            </div>
          </div>

          {inferenceError && (
            <div className="alert alert-warning">
              <AlertCircle size={16} />
              <span>{inferenceError}</span>
            </div>
          )}

          {predictions && predictions.detections.length > 0 ? (
            <div className="current-detections">
              <h3>Current Frame</h3>
              <div className="detection-list">
                {predictions.detections.map((det, i) => (
                  <div key={i} className={`detection-item ${det.class_name}`}>
                    <div className="detection-info">
                      <span className="detection-class">
                        {det.class_name.replace('_', ' ')}
                        <span className="confidence">{(det.confidence * 100).toFixed(0)}%</span>
                      </span>
                      <div className="confidence-bar">
                        <div className="confidence-fill" style={{ width: `${det.confidence * 100}%` }} />
                      </div>
                    </div>
                    <span className="severity-badge">{getSeverity(det.confidence)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : isActive && !isInferring && !inferenceError ? (
            <div className="no-detections-state">
              <CheckCircle size={48} className="empty-icon" />
              <h3>No Issues Detected</h3>
              <p>Camera is scanning. Point at civic infrastructure to detect issues.</p>
            </div>
          ) : (
            <div className="waiting-state">
              <Video size={48} className="empty-icon" />
              <h3>Waiting for Camera</h3>
              <p>Start the camera to begin real-time detection</p>
            </div>
          )}

          {Object.keys(classCounts).length > 0 && (
            <div className="aggregated-stats">
              <h3>Session Summary</h3>
              <div className="stats-grid">
                {Object.entries(classCounts).map(([className, data]) => (
                  <div key={className} className="stat-item">
                    <span className="stat-class">{className.replace('_', ' ')}</span>
                    <span className="stat-count">{data.count} detections</span>
                    <span className="stat-conf">Max: {(data.maxConf * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function getSeverity(confidence: number): string {
  if (confidence >= 0.8) return 'HIGH';
  if (confidence >= 0.6) return 'MEDIUM';
  return 'LOW';
}