import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Camera, Image as ImageIcon, Loader2, AlertCircle, CheckCircle, MapPin } from 'lucide-react';
import { predictImage, predictVideo, PredictResponse, Detection } from '../../services/ml';
import { saveDraft } from '../../services/offlineQueue';

export interface CapturedMedia {
  file: File;
  previewUrl: string;
}

export interface LocationData {
  lat: number;
  lng: number;
  accuracy: number | null;
  address: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export function ReportPage() {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [media, setMedia] = useState<CapturedMedia | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [predictions, setPredictions] = useState<PredictResponse | null>(null);
  const [isInferring, setIsInferring] = useState(false);
  const [inferenceError, setInferenceError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const nav = useNavigate();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setMedia({ file, previewUrl: url });
      setShowPreview(true);
      setPredictions(null);
      setInferenceError(null);

      setIsInferring(true);
      try {
        let results;
        if (file.type.startsWith('video/')) {
          results = await predictVideo(file);
        } else {
          results = await predictImage(file);
        }
        setPredictions(results);
      } catch (err: any) {
        setInferenceError(err.message || 'Failed to run model');
      } finally {
        setIsInferring(false);
      }
    }
  };

  useEffect(() => {
    if (predictions && canvasRef.current && imgRef.current) {
      const canvas = canvasRef.current;
      const img = imgRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = img.clientWidth;
      canvas.height = img.clientHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const scaleX = img.clientWidth / img.naturalWidth;
      const scaleY = img.clientHeight / img.naturalHeight;

      predictions.detections.forEach(det => {
        const { bbox, class_name, confidence } = det;
        const x = bbox.x1 * scaleX;
        const y = bbox.y1 * scaleY;
        const w = (bbox.x2 - bbox.x1) * scaleX;
        const h = (bbox.y2 - bbox.y1) * scaleY;

        const colors: Record<string, string> = {
          pothole: '#ef4444',
          waterlogging: '#3b82f6',
        };
        const color = colors[class_name] || '#22c55e';

        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, w, h);

        ctx.fillStyle = color;
        ctx.font = '14px Inter, sans-serif';
        const label = `${class_name.replace('_', ' ')} (${(confidence * 100).toFixed(0)}%)`;
        ctx.fillText(label, x, y > 20 ? y - 5 : y + 20);
      });
    }
  }, [predictions, media?.previewUrl]);

  const handleLocationSelected = (loc: LocationData) => {
    setLocation(loc);
  };

  async function submit() {
    if (!location) {
      setError('Please allow location access to submit a report.');
      return;
    }
    if (!text.trim() || text.length < 3) {
      setError('Please provide a description (minimum 3 characters).');
      return;
    }
    setLoading(true);
    setError('');

    const token = localStorage.getItem('token');

    try {
      // Step 1: Upload image to backend if we have one
      let storageKey: string | null = null;
      if (media?.file) {
        const formData = new FormData();
        formData.append('file', media.file);
        try {
          const uploadRes = await fetch(`${API_URL}/media/upload-image`, {
            method: 'POST',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: formData,
          });
          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            storageKey = uploadData.storage_key;
          }
        } catch {
          // Image upload failure is non-fatal — proceed without image
          console.warn('Image upload failed, continuing without media');
        }
      }

      // Step 2: Create incident in backend
      const incidentBody = {
        type: predictions?.detections[0]?.class_name || 'general',
        description: text,
        location: {
          latitude: location.lat,
          longitude: location.lng,
          address: location.address,
          accuracy: location.accuracy ?? undefined,
        },
        media: storageKey ? [{ storage_key: storageKey, type: 'BEFORE' }] : [],
        ml_detections: predictions?.detections || [],
      };

      const res = await fetch(`${API_URL}/incidents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(incidentBody),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ detail: 'Submit failed' }));
        throw new Error(errData.detail || errData.error?.message || 'Failed to submit report');
      }

      const created = await res.json();
      sessionStorage.setItem('lastIncidentId', created.id);
      setSubmitSuccess(true);
      setTimeout(() => nav('/history'), 1500);

    } catch (e: any) {
      // Network failure — fall back to offline draft
      if (!navigator.onLine || e.message?.includes('fetch')) {
        try {
          const draft = {
            id: crypto.randomUUID(),
            type: predictions?.detections[0]?.class_name || 'general',
            description: text,
            latitude: location.lat,
            longitude: location.lng,
            accuracy: location.accuracy || undefined,
            media: media ? [{ storage_key: media.file.name, type: 'BEFORE' }] : [],
            timestamp: Date.now(),
            ml_detections: predictions?.detections || [],
          };
          await saveDraft(draft);
          setSubmitSuccess(true);
          setTimeout(() => nav('/history'), 1500);
          return;
        } catch {
          // ignore draft save error
        }
      }
      setError(e instanceof Error ? e.message : 'Unable to submit report.');
    } finally {
      setLoading(false);
    }
  }

  const retake = () => {
    setMedia(null);
    setShowPreview(false);
    setPredictions(null);
    setInferenceError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const detectionClasses = predictions?.detections.map(d => d.class_name) || [];
  const hasPothole = detectionClasses.includes('pothole');
  const hasWaterlogging = detectionClasses.includes('waterlogging');

  return (
    <div className="page report-page">
      <header className="page-header">
        <h1>Report an Issue</h1>
        <p className="muted">Add evidence and we'll route it to the right city team.</p>
      </header>

      <div className="report-form">
        <section className="form-section media-section">
          <h2>Media Evidence</h2>
          <div className="media-capture">
            {showPreview && media ? (
              <div className="preview-container" style={{ position: 'relative', display: 'inline-block' }}>
                <img
                  ref={imgRef}
                  src={media.previewUrl}
                  alt="Preview"
                  style={{ maxWidth: '100%', maxHeight: '400px', display: 'block', borderRadius: 'var(--radius-lg)' }}
                  onLoad={() => setPredictions(prev => prev ? { ...prev } : null)}
                />
                <canvas
                  ref={canvasRef}
                  style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', borderRadius: 'var(--radius-lg)' }}
                />
                {isInferring && (
                  <div className="inference-overlay">
                    <Loader2 className="spin" size={24} />
                    <span>Analyzing image...</span>
                  </div>
                )}
                {inferenceError && <p className="inference-error"><AlertCircle size={16} /> {inferenceError}</p>}
                {predictions && predictions.detections.length === 0 && <p className="no-detections">No issues detected.</p>}
                <div className="preview-actions">
                  <button type="button" onClick={retake} className="btn btn-secondary">
                    <Camera size={16} /> Retake
                  </button>
                </div>
              </div>
            ) : (
              <div className="capture-grid">
                <input
                  type="file"
                  accept="image/*,video/*"
                  capture="environment"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="btn btn-outline">
                  <Camera size={20} /> Camera
                </button>
                <button type="button" onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.removeAttribute('capture');
                    fileInputRef.current.click();
                  }
                }} className="btn btn-outline">
                  <ImageIcon size={20} /> Gallery
                </button>
              </div>
            )}
            <div className="detection-status">
              <span>Active Detections:</span>
              <div className="detection-badges">
                <span className={`detection-badge ${hasPothole ? 'detected' : ''}`}>Pothole</span>
                <span className={`detection-badge ${hasWaterlogging ? 'detected' : ''}`}>Waterlogging</span>
              </div>
            </div>
          </div>
        </section>

        <section className="form-section">
          <label htmlFor="description" className="input-label">Description</label>
          <textarea
            id="description"
            className="textarea"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Describe the issue in detail..."
            rows={4}
          />
          <p className="input-helper">{text.length}/4000 characters</p>
        </section>

        <section className="form-section location-section">
          <h2>Location</h2>
          <LocationPicker onLocationSelected={handleLocationSelected} />
        </section>

        {error && <div className="alert alert-error" role="alert"><AlertCircle size={18} /> {error}</div>}

        <div className="form-actions">
          <button
            className="btn btn-primary btn-full btn-lg"
            disabled={loading || text.length < 3 || !location}
            onClick={submit}
          >
            {loading ? (
              <>
                <Loader2 className="spin" size={20} />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <Send size={20} />
                <span>Submit Report</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function LocationPicker({ onLocationSelected }: { onLocationSelected: (loc: LocationData) => void }) {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [permissionState, setPermissionState] = useState<PermissionState | 'unknown'>('unknown');

  useEffect(() => {
    checkPermission();
    getLocation();
  }, []);

  const checkPermission = async () => {
    if ('permissions' in navigator) {
      try {
        const perm = await navigator.permissions.query({ name: 'geolocation' });
        setPermissionState(perm.state);
        perm.onchange = () => setPermissionState(perm.state);
      } catch {
        setPermissionState('unknown');
      }
    }
  };

  const getLocation = () => {
    setLoading(true);
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          address: `Lat: ${position.coords.latitude.toFixed(6)}, Lng: ${position.coords.longitude.toFixed(6)} (Accuracy: ${position.coords.accuracy.toFixed(0)}m)`
        };
        setLocation(loc);
        onLocationSelected(loc);
        setLoading(false);
      },
      (err) => {
        setError(getLocationErrorMessage(err));
        setLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setPermissionState('denied');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const getLocationErrorMessage = (err: GeolocationPositionError) => {
    switch (err.code) {
      case err.PERMISSION_DENIED:
        return 'Location permission denied. Please enable location access in browser settings.';
      case err.POSITION_UNAVAILABLE:
        return 'Location information is unavailable.';
      case err.TIMEOUT:
        return 'Location request timed out. Please try again.';
      default:
        return 'An unknown error occurred while getting location.';
    }
  };

  if (loading) {
    return (
      <div className="location-box loading">
        <Loader2 className="spin" size={18} />
        <span>Detecting location...</span>
      </div>
    );
  }

  return (
    <div className="location-picker">
      {permissionState === 'denied' && (
        <div className="permission-denied">
          <AlertCircle size={20} />
          <div>
            <strong>Location Access Required</strong>
            <p>Please enable location permissions in your browser settings to auto-detect your location.</p>
            <button className="btn btn-sm btn-outline" onClick={getLocation}>Retry</button>
          </div>
        </div>
      )}
      <div className="location-box">
        <MapPin size={18} aria-hidden="true" />
        <span>{location?.address || error || 'Location unknown'}</span>
        {location && <span className="location-accuracy">±{location.accuracy?.toFixed(0)}m</span>}
      </div>
      {error && !location && (
        <p className="input-error-text">
          <AlertCircle size={14} /> {error}
        </p>
      )}
    </div>
  );
}