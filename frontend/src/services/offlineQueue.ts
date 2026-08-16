import * as idb from 'idb-keyval';

export interface OfflineIncident {
  id: string;
  type: string;
  description: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  media: { storage_key: string; type: string }[];
  timestamp: number;
  ml_detections?: { class_id: number; class_name: string; confidence: number; bbox: { x1: number; y1: number; x2: number; y2: number } }[];
}

export async function saveDraft(incident: OfflineIncident) {
  const drafts = await getDrafts();
  drafts.push(incident);
  await idb.set('offline_drafts', drafts);
}

export async function getDrafts(): Promise<OfflineIncident[]> {
  const drafts = await idb.get<OfflineIncident[]>('offline_drafts');
  return drafts || [];
}

export async function clearDrafts() {
  await idb.del('offline_drafts');
}

export async function removeDraft(id: string) {
  const drafts = await getDrafts();
  await idb.set('offline_drafts', drafts.filter(d => d.id !== id));
}

export function setupOfflineSync(syncFn: (drafts: OfflineIncident[]) => Promise<void>) {
  window.addEventListener('online', async () => {
    const drafts = await getDrafts();
    if (drafts.length > 0) {
      await syncFn(drafts);
    }
  });
}