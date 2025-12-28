import React, { useState, useRef } from 'react';
import * as THREE from 'three';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Viewer3D } from './components/Viewer3D';
import { HandController } from './components/HandController';
import { UploadedModel, HandControllerHandle } from './types';
import { Move3d, ZoomIn, RefreshCw } from 'lucide-react';

const App: React.FC = () => {
  const [model, setModel] = useState<UploadedModel | null>(null);
  const [gesture, setGesture] = useState<string>('IDLE');
  
  // These refs are passed down to be mutated by HandController (Logic) 
  // and rendered by Viewer3D (Visuals) without triggering React re-renders for performance
  const sceneRef = useRef<THREE.Group>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  
  // Ref to call reset on HandController
  const handControllerRef = useRef<HandControllerHandle>(null);

  const handleUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    setModel({
      name: file.name,
      url: url,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB'
    });
  };

  const handleResetView = () => {
    if (handControllerRef.current) {
      handControllerRef.current.resetCamera();
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#F3F4F6] text-slate-900 font-sans selection:bg-red-100">
      
      <Header />
      
      {/* 3D Canvas Layer */}
      <main className="absolute inset-0 z-0">
        <Viewer3D 
          sceneRef={sceneRef} 
          cameraRef={cameraRef} 
          modelUrl={model?.url || null} 
        />
      </main>

      {/* UI Layers */}
      <Sidebar onUpload={handleUpload} currentModel={model} />
      
      <HandController 
        ref={handControllerRef}
        sceneRef={sceneRef} 
        cameraRef={cameraRef} 
        onGestureChange={setGesture} 
      />

      {/* Dynamic Gesture Feedback Overlay */}
      <div className="absolute top-24 right-0 left-0 flex flex-col items-center gap-4 pointer-events-none z-20">
        
        {/* Status Pill */}
        <div className={`
          flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md shadow-lg transition-all duration-300 transform
          ${gesture !== 'IDLE' ? 'bg-slate-900/80 text-white translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
        `}>
          {gesture === 'ROTATE' && <Move3d size={18} />}
          {gesture === 'ZOOM' && <ZoomIn size={18} />}
          <span className="text-sm font-medium tracking-wide">
            {gesture === 'ROTATE' ? 'Rotating' : 'Zooming'}
          </span>
        </div>

      </div>

      {/* Reset Button (Bottom Center) */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
        <button 
          onClick={handleResetView}
          className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 text-slate-800 rounded-full shadow-xl border border-slate-200 transition-all active:scale-95"
        >
          <RefreshCw size={18} />
          <span className="font-medium text-sm">Reset View</span>
        </button>
      </div>

    </div>
  );
};

export default App;