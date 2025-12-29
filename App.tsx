import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Header } from './components/Header';
import { LibrarySidebar } from './components/LibrarySidebar';
import { Viewer3D } from './components/Viewer3D';
import { HandController } from './components/HandController';
import { UploadModal } from './components/UploadModal';
import { LibraryAsset, HandControllerHandle } from './types';
import { storage } from './utils/storage';
import { Move3d, ZoomIn, RefreshCw } from 'lucide-react';

const App: React.FC = () => {
  const [assets, setAssets] = useState<LibraryAsset[]>([]);
  const [currentAsset, setCurrentAsset] = useState<LibraryAsset | null>(null);
  const [gesture, setGesture] = useState<string>('IDLE');
  const [isReady, setIsReady] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  
  const sceneRef = useRef<THREE.Group>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const handControllerRef = useRef<HandControllerHandle>(null);

  // Load assets from storage on mount
  useEffect(() => {
    loadAssets();
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const loadAssets = async () => {
    try {
      const result = await storage.list('asset:');
      if (result && result.keys) {
        const loadedAssets: LibraryAsset[] = [];
        for (const key of result.keys) {
          try {
            const data = await storage.get(key);
            if (data && data.value) {
              loadedAssets.push(JSON.parse(data.value));
            }
          } catch (err) {
            console.error(`Failed to load asset ${key}:`, err);
          }
        }
        setAssets(loadedAssets.sort((a, b) => 
          new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
        ));
      }
    } catch (err) {
      console.error('Error loading assets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAsset = async (asset: LibraryAsset) => {
    try {
      const result = await storage.set(`asset:${asset.id}`, JSON.stringify(asset));
      if (result) {
        setAssets(prev => [asset, ...prev]);
        setCurrentAsset(asset);
        setShowUploadModal(false);
      } else {
        throw new Error('Storage returned null');
      }
    } catch (err) {
      console.error('Error saving asset:', err);
      alert('Failed to save asset. Your browser may have storage disabled or full. Try enabling cookies/storage or freeing up space.');
    }
  };

  const handleDeleteAsset = async (id: string) => {
    if (!confirm('Are you sure you want to delete this asset?')) return;
    
    try {
      await storage.delete(`asset:${id}`);
      setAssets(prev => prev.filter(a => a.id !== id));
      if (currentAsset?.id === id) {
        setCurrentAsset(null);
      }
    } catch (err) {
      console.error('Error deleting asset:', err);
    }
  };

  const handleSelectAsset = (asset: LibraryAsset) => {
    setCurrentAsset(asset);
    if (handControllerRef.current) {
      handControllerRef.current.resetCamera();
    }
  };

  const handleResetView = () => {
    if (handControllerRef.current) {
      handControllerRef.current.resetCamera();
    }
  };

  // Filter assets based on search and category
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         asset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || asset.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#F3F4F6] text-slate-900 font-sans selection:bg-red-100">
      
      <Header 
        onUploadClick={() => setShowUploadModal(true)}
        assetCount={assets.length}
      />
      
      {/* 3D Canvas Layer */}
      <main className="absolute inset-0 z-0">
        {isReady && (
          <Viewer3D 
            sceneRef={sceneRef} 
            cameraRef={cameraRef} 
            modelUrl={currentAsset?.dataUrl || null} 
          />
        )}
      </main>

      {/* Library Sidebar */}
      <LibrarySidebar 
        assets={filteredAssets}
        currentAsset={currentAsset}
        onSelectAsset={handleSelectAsset}
        onDeleteAsset={handleDeleteAsset}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        loading={loading}
      />
      
      {isReady && (
        <HandController 
          ref={handControllerRef}
          sceneRef={sceneRef} 
          cameraRef={cameraRef} 
          onGestureChange={setGesture} 
        />
      )}

      {/* Gesture Feedback */}
      <div className="absolute top-24 right-0 left-0 flex flex-col items-center gap-4 pointer-events-none z-20">
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

      {/* Reset Button */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
        <button 
          onClick={handleResetView}
          className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 text-slate-800 rounded-full shadow-xl border border-slate-200 transition-all active:scale-95"
        >
          <RefreshCw size={18} />
          <span className="font-medium text-sm">Reset View</span>
        </button>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal 
          onClose={() => setShowUploadModal(false)}
          onSave={handleSaveAsset}
        />
      )}

    </div>
  );
};

export default App;
