import React from 'react';
import { Search, Filter, Box, Trash2, Calendar, Tag, Loader } from 'lucide-react';
import type { LibraryAsset, AssetCategory } from '../types';

interface LibrarySidebarProps {
  assets: LibraryAsset[];
  currentAsset: LibraryAsset | null;
  onSelectAsset: (asset: LibraryAsset) => void;
  onDeleteAsset: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  loading: boolean;
}

const categories: (AssetCategory | 'All')[] = ['All', 'Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Accessories', 'Footwear', 'Other'];

export const LibrarySidebar: React.FC<LibrarySidebarProps> = ({
  assets,
  currentAsset,
  onSelectAsset,
  onDeleteAsset,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  loading
}) => {
  return (
    <aside className="absolute left-0 top-20 bottom-0 z-30 ml-6 w-80 flex flex-col gap-4 pb-6 overflow-hidden">
      
      {/* Search Bar */}
      <div className="bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl rounded-2xl p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by name or tags..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={16} className="text-slate-600" />
          <h3 className="text-sm font-semibold text-slate-700">Category</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Assets List */}
      <div className="bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl rounded-2xl flex-1 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-700">
            {assets.length} {assets.length === 1 ? 'Asset' : 'Assets'}
          </h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="flex items-center justify-center h-full text-slate-400">
              <Loader className="animate-spin" size={24} />
            </div>
          ) : assets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 p-6 text-center">
              <Box size={48} className="mb-3 opacity-20" />
              <p className="text-sm">No assets found</p>
              <p className="text-xs mt-1">Upload your first 3D model to get started</p>
            </div>
          ) : (
            <div className="space-y-2">
              {assets.map(asset => (
                <div
                  key={asset.id}
                  className={`group relative p-3 rounded-lg border transition-all cursor-pointer ${
                    currentAsset?.id === asset.id
                      ? 'bg-slate-900 border-slate-900 text-white'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
                  }`}
                  onClick={() => onSelectAsset(asset)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      currentAsset?.id === asset.id ? 'bg-white/10' : 'bg-slate-100'
                    }`}>
                      <Box size={20} className={currentAsset?.id === asset.id ? 'text-white' : 'text-slate-600'} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-medium text-sm truncate ${
                        currentAsset?.id === asset.id ? 'text-white' : 'text-slate-800'
                      }`}>
                        {asset.name}
                      </h4>
                      
                      <div className={`flex items-center gap-2 mt-1 text-xs ${
                        currentAsset?.id === asset.id ? 'text-white/70' : 'text-slate-500'
                      }`}>
                        <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/20">
                          {asset.category}
                        </span>
                        <span>{asset.fileSize}</span>
                      </div>

                      {asset.tags.length > 0 && (
                        <div className="flex items-center gap-1 mt-2 flex-wrap">
                          <Tag size={10} className={currentAsset?.id === asset.id ? 'text-white/50' : 'text-slate-400'} />
                          {asset.tags.slice(0, 3).map((tag, i) => (
                            <span
                              key={i}
                              className={`text-[10px] px-1.5 py-0.5 rounded ${
                                currentAsset?.id === asset.id
                                  ? 'bg-white/10 text-white/70'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className={`flex items-center gap-1 mt-2 text-[10px] ${
                        currentAsset?.id === asset.id ? 'text-white/50' : 'text-slate-400'
                      }`}>
                        <Calendar size={10} />
                        {new Date(asset.uploadDate).toLocaleDateString()}
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteAsset(asset.id);
                      }}
                      className={`opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all ${
                        currentAsset?.id === asset.id
                          ? 'hover:bg-white/20 text-white'
                          : 'hover:bg-red-50 text-red-600'
                      }`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </aside>
  );
};
