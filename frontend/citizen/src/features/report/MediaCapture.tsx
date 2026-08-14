import { useState, useRef } from 'react';
import { Camera, Image as ImageIcon } from 'lucide-react';

export interface CapturedMedia {
  file: File;
  previewUrl: string;
}

export function MediaCapture({ onCapture }: { onCapture: (media: CapturedMedia) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      onCapture({ file, previewUrl: url });
    }
  };

  return (
    <div className="media-capture">
      {preview ? (
        <div className="preview-container">
          <img src={preview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px' }} />
          <button type="button" onClick={() => setPreview(null)} className="secondary">Retake</button>
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
    </div>
  );
}
