
export enum ModuleType {
  LANDING = 'Landing',
  LOGOS = 'Logos',
  INFOGRAPHICS = 'Infographics',
  FLYERS = 'Flyers',
  SETTINGS = 'Settings'
}

export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
export type Resolution = '720p' | '1080p' | '4K';

export interface BrandIdentity {
  name: string;
  industry: string;
  address: string;
  contact: string;
  colors: string;
  products: string[];
  logo?: string; // Base64 or URL of the generated logo
}

export interface Project {
  id: string;
  name: string;
  type: ModuleType;
  updatedAt: string;
  icon: string;
  data: any; 
  assets?: string[]; 
}

export interface BlueprintNode {
  id: string;
  title: string;
  color: string;
  x: number;
  y: number;
  points: string[];
  icon?: string;
  tier?: 'input' | 'engine' | 'output';
}

export interface LogoStyle {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface FlyerConfig {
  companyUrl: string;
  topic: string;
  platform: string;
  resolution: Resolution;
  aspectRatio: AspectRatio;
  headline: string;
  body: string;
  cta: string;
}
