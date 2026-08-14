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

// Optional listener setup to sync drafts when back online
export function setupOfflineSync(syncFn: (drafts: OfflineIncident[]) => Promise<void>) {
  window.addEventListener('online', async () => {
    const drafts = await getDrafts();
    if (drafts.length > 0) {
      await syncFn(drafts);
    }
  });
}
