import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send } from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { MediaCapture, CapturedMedia } from '../features/report/MediaCapture';
import { LocationPicker, LocationData } from '../features/report/LocationPicker';
import { saveDraft } from '../services/offlineQueue';

export function ReportPage() {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [media, setMedia] = useState<CapturedMedia | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const nav = useNavigate();

  async function submit() {
    if (!location) {
      setError('Please allow location access to submit a report.');
      return;
    }
    setLoading(true);
    setError('');
    
    try {
      // Create draft for offline queue
      const draft = {
        id: crypto.randomUUID(),
        type: 'General',
        description: text,
        latitude: location.lat,
        longitude: location.lng,
        accuracy: location.accuracy || undefined,
        media: media ? [{ storage_key: media.file.name, type: 'BEFORE' }] : [], // mock storage key for now since upload logic needs signed URL integration
        timestamp: Date.now()
      };
      
      await saveDraft(draft);
      
      // In a real app, the offline queue would handle sync and upload.
      // For now, we simulate success for the demo.
      sessionStorage.setItem('incidentId', draft.id);
      
      // Attempt to sync immediately if online (mocked for Phase 2)
      if (navigator.onLine) {
        // Typically we would fetch upload URL, upload file to S3 emulator, then POST to /api/v1/incidents
        console.log("Mock syncing draft: ", draft);
      }
      
      nav('/analysis');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to submit report.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <h1>Report an issue</h1>
      <p className="muted">Add evidence and we’ll route it to the right city team.</p>
      
      <MediaCapture onCapture={setMedia} />
      
      <label htmlFor="description">Description</label>
      <textarea 
        id="description" 
        value={text} 
        onChange={e => setText(e.target.value)} 
        placeholder="What needs attention?"
      />
      
      <LocationPicker onLocationSelected={setLocation} />
      
      {error && <p className="state error" role="alert">{error}</p>}
      
      <button 
        className="primary submit" 
        disabled={loading || text.length < 3 || !location} 
        onClick={submit}
      >
        <Send /> {loading ? 'Saving report...' : 'Submit'}
      </button>
    </AppShell>
  );
}
