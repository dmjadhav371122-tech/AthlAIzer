import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function uploadVideoToStorage(file: File): Promise<string> {
  const fileName = `${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage
    .from('videos')
    .upload(fileName, file);

  if (error) {
    throw new Error(`Failed to upload video: ${error.message}`);
  }

  const { data: urlData } = supabase.storage
    .from('videos')
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}

export async function processVideo(config: {
  videoUrl: string;
  puckConfThreshold: number;
  duplicateIouThreshold: number;
  homeRoster: string[];
  awayRoster: string[];
  manualMapYaml?: string;
  trackerConfigYaml?: string;
}): Promise<{ jobId: string }> {
  const apiUrl = `${supabaseUrl}/functions/v1/process-hockey-video`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(config),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to start processing: ${error}`);
  }

  const result = await response.json();
  return result;
}

export async function checkJobStatus(jobId: string): Promise<any> {
  const apiUrl = `${supabaseUrl}/functions/v1/check-job-status?jobId=${jobId}`;

  const response = await fetch(apiUrl, {
    headers: {
      'Authorization': `Bearer ${supabaseAnonKey}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to check job status: ${error}`);
  }

  const result = await response.json();
  return result;
}
