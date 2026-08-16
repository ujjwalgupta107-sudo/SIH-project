import { useState, useRef, useEffect } from 'react';
import { Camera, Image as ImageIcon } from 'lucide-react';
import { predictImage, PredictResponse } from '../../services/ml';

export interface CapturedMedia {
  file: File;
  previewUrl: string;
}

export function MediaCapture({ onCapture }: { onCapture: (media: CapturedMedia) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isInferring, setIsInferring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<PredictResponse | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      setPredictions(null);
      setError(null);
      onCapture({ file, previewUrl: url });

      // Run ML prediction
      setIsInferring(true);
      try {
        const results = await predictImage(file);
        setPredictions(results);
      } catch (err: any) {
        setError(err.message || "Failed to run model");
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

      // Make canvas match image displayed size
      canvas.width = img.clientWidth;
      canvas.height = img.clientHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Scale factors from natural size to displayed size
      const scaleX = img.clientWidth / img.naturalWidth;
      const scaleY = img.clientHeight / img.naturalHeight;

      predictions.detections.forEach(det => {
        const { bbox, class_name, confidence } = det;
        const x = bbox.x1 * scaleX;
        const y = bbox.y1 * scaleY;
        const w = (bbox.x2 - bbox.x1) * scaleX;
        const h = (bbox.y2 - bbox.y1) * scaleY;

        ctx.strokeStyle = class_name === 'pothole' ? '#ff3333' : '#33cc33';
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, w, h);

        ctx.fillStyle = class_name === 'pothole' ? '#ff3333' : '#33cc33';
        ctx.font = '16px Arial';
        const label = `${class_name} (${(confidence * 100).toFixed(0)}%)`;
        ctx.fillText(label, x, y > 20 ? y - 5 : y + 20);
      });
    }
  }, [predictions, preview]);

  return (
    <div className="media-capture">
      {preview ? (
        <div className="preview-container" style={{ position: 'relative', display: 'inline-block' }}>
          <img 
            ref={imgRef}
            src={preview} 
            alt="Preview" 
            style={{ maxWidth: '100%', maxHeight: '400px', display: 'block' }} 
            onLoad={() => {
              // trigger a re-render or effect to draw boxes if predictions arrived before image loaded
              setPredictions(prev => prev ? {...prev} : null);
            }}
          />
          <canvas 
            ref={canvasRef} 
            style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }} 
          />
          {isInferring && <p>Analyzing image...</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {predictions && predictions.detections.length === 0 && <p>No issues detected.</p>}
          <button type="button" onClick={() => { setPreview(null); setPredictions(null); }} className="secondary" style={{ marginTop: '10px' }}>
            Retake
          </button>
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
          <button type="button" onClick={() => fileInputRef.current?.click()}>
            <Camera /> Camera
          </button>
          <button type="button" onClick={() => {
            if (fileInputRef.current) {
              fileInputRef.current.removeAttribute('capture');
              fileInputRef.current.click();
            }
          }}>
            <ImageIcon /> Gallery
          </button>
        </div>
      )}
      <div className="detection-status" style={{ marginTop: '12px', fontSize: '13px', color: '#666', padding: '8px', borderRadius: '4px', backgroundColor: '#f8f9fa', border: '1px solid #e9ecef', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <span>Active Detections: <b>Pothole</b>, <b>Waterlogging</b></span>
        <span style={{ color: '#856404', fontWeight: '500' }}>• Garbage Detection — Coming Soon</span>
      </div>
    </div>
  );
}
