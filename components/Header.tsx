import React from 'react';
import { Upload, Package } from 'lucide-react';

interface HeaderProps {
  onUploadClick: () => void;
  assetCount: number;
}

export const Header: React.FC<HeaderProps> = ({ onUploadClick, assetCount }) => {
  return (
    <header className="absolute top-0 left-0 w-full z-40 px-8 py-6 flex items-center justify-between">
      <div className="flex items-center gap-4 pointer-events-auto">
        {/* MAS Logo Container */}
        <div className="flex items-center">
          <img 
            src="https://vectorseek.com/wp-content/uploads/2023/09/Mas-Logo-Vector.svg-.png" 
            alt="MAS Holdings" 
            className="h-12 w-auto object-contain"
          />
        </div>
        <div className="hidden md:block">
          <h1 className="font-serif text-2xl font-bold text-slate-900 tracking-tight">Fashion Library</h1>
          <p className="font-sans text-xs text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Package size={12} />
            {assetCount} Assets
          </p>
        </div>
      </div>

      <button
        onClick={onUploadClick}
        className="pointer-events-auto flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-xl transition-all active:scale-95"
      >
        <Upload size={18} />
        <span className="font-medium text-sm">Upload New</span>
      </button>
    </header>
  );
};
