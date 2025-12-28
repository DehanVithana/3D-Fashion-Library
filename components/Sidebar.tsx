import React, { useRef } from 'react';
import { Upload, Box, Shirt, Info, X } from 'lucide-react';
import { UploadedModel } from '../types';

interface SidebarProps {
  onUpload: (file: File) => void;
  currentModel: UploadedModel | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ onUpload, currentModel }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  return (
    <aside className="absolute left-0 top-1/2 -translate-y-1/2 h-auto max-h-[80vh] z-30 ml-6 hidden lg:flex flex-col gap-4">
      
      {/* Tools Panel */}
      <div className="bg-white/90 backdrop-blur-md border border-slate-200 shadow-xl rounded-2xl p-4 w-64 flex flex-col gap-6 transition-all duration-300 hover:bg-white">
        
        <div>
          <h2 className="font-serif text-lg font-semibold text-slate-800 mb-1">Library</h2>
          <div className="h-0.5 w-8 bg-red-600 mb-4"></div>
          
          <div className="space-y-3">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full group flex items-center gap-3 p-3 rounded-lg border border-dashed border-slate-300 hover:border-red-500 hover:bg-red-50 transition-colors"
            >
              <div className="bg-slate-100 p-2 rounded-md group-hover:bg-white transition-colors">
                <Upload size={18} className="text-slate-600 group-hover:text-red-600" />
              </div>
              <div className="text-left">
                <span className="block text-sm font-medium text-slate-700">Upload Asset</span>
                <span className="block text-[10px] text-slate-400">.GLB (Binary GLTF) Only</span>
              </div>
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept=".glb" 
              className="hidden" 
            />
          </div>
        </div>

        {currentModel && (
          <div className="animate-fade-in">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Active Model</h3>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center gap-3">
              <Box size={20} className="text-slate-600" />
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-slate-800 truncate">{currentModel.name}</p>
                <p className="text-xs text-slate-500">{currentModel.size}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Instructions Panel */}
      <div className="bg-slate-900/95 backdrop-blur-md text-white shadow-2xl rounded-2xl p-5 w-64">
        <div className="flex items-center gap-2 mb-3">
          <Info size={16} className="text-red-500" />
          <h3 className="font-medium text-sm">Gesture Control</h3>
        </div>
        <ul className="space-y-3 text-xs text-slate-300">
          <li className="flex items-start gap-2">
            <span className="bg-slate-700 rounded w-5 h-5 flex items-center justify-center shrink-0">1</span>
            <span><strong className="text-white">One Hand:</strong> Move hand horizontally or vertically to rotate the model 360°.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="bg-slate-700 rounded w-5 h-5 flex items-center justify-center shrink-0">2</span>
            <span><strong className="text-white">Two Hands:</strong> Pinch in/out with both hands to zoom the camera.</span>
          </li>
        </ul>
      </div>

    </aside>
  );
};