
export interface ProcessInfo {
  name: string;
  cpu: number;
  mem: number;
}

export interface TranscriptEntry {
  role: 'user' | 'flash';
  text: string;
  timestamp: Date;
  links?: { title: string; uri: string }[];
}

export enum SystemStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  PROCESSING = 'PROCESSING'
}
