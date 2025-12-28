import { MutableRefObject } from 'react';
import { Group, PerspectiveCamera } from 'three';

export interface ViewerState {
  targetRotationX: number;
  targetRotationY: number;
  targetZoom: number;
  isTracking: boolean;
  gesture: 'IDLE' | 'ROTATE' | 'ZOOM';
}

export interface HandControllerProps {
  sceneRef: MutableRefObject<Group | null>;
  cameraRef: MutableRefObject<PerspectiveCamera | null>;
  onGestureChange: (gesture: string) => void;
}

export interface HandControllerHandle {
  resetCamera: () => void;
}

export interface UploadedModel {
  name: string;
  url: string;
  size: string;
}

export interface LibraryAsset {
  id: string;
  name: string;
  category: string;
  tags: string[];
  dataUrl: string; // Base64 encoded model data
  thumbnail?: string;
  uploadDate: string;
  fileSize: string;
  description?: string;
}

export type AssetCategory = 'Tops' | 'Bottoms' | 'Dresses' | 'Outerwear' | 'Accessories' | 'Footwear' | 'Other';
