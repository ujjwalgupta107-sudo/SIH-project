const api = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export interface BBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface Detection {
  class_id: number;
  class_name: string;
  confidence: number;
  bbox: BBox;
}

export interface PredictResponse {
  detections: Detection[];
}

export async function predictImage(file: File): Promise<PredictResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const token = localStorage.getItem('token') || 'mock_token';

  const response = await fetch(`${api}/media/predict`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to run ML inference.');
  }

  return response.json();
}

export async function predictVideo(file: File): Promise<PredictResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const token = localStorage.getItem('token') || 'mock_token';

  const response = await fetch(`${api}/media/predict-video`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to run ML video inference.');
  }

  return response.json();
}