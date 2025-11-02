export interface ProcessingJob {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  videoUrl?: string;
  excelUrl?: string;
  manualMapTemplate?: Record<number, string>;
  eventCount?: number;
  framesProcessed?: number;
  error?: string;
}

export interface ProcessingConfig {
  videoFile: File;
  puckConfThreshold: number;
  duplicateIouThreshold: number;
  homeRoster: string[];
  awayRoster: string[];
  manualMapYaml?: string;
  trackerConfigYaml?: string;
}
