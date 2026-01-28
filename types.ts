
export enum ModuleType {
  LOGOS = 'Logos',
  INFOGRAPHICS = 'Infographics',
  FLYERS = 'Flyers',
  SETTINGS = 'Settings'
}

export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';

export interface Project {
  id: string;
  name: string;
  type: ModuleType;
  updatedAt: string;
  icon: string;
  data: any; // Stores module-specific configuration
  assets?: string[]; // Stores generated base64 strings or URLs
}

export interface DataPoint {
  id: string;
  label: string;
  value: string;
}

export interface LogoStyle {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface FlyerConfig {
  type: string;
  size: AspectRatio;
  headline: string;
  body: string;
  cta: string;
}
