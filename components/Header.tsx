import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="absolute top-0 left-0 w-full z-40 px-8 py-6 flex items-center justify-between pointer-events-none">
      <div className="flex items-center gap-4 pointer-events-auto">
        {/* MAS Logo Container */}
        <div className="bg-white p-3 shadow-sm rounded-sm">
          <img 
            src="https://vectorseek.com/wp-content/uploads/2023/09/Mas-Logo-Vector.svg-.png" 
            alt="MAS Holdings" 
            className="h-10 w-auto object-contain"
          />
        </div>
        <div className="hidden md:block">
          <h1 className="font-serif text-2xl font-bold text-slate-900 tracking-tight">Fashion Library</h1>
          <p className="font-sans text-xs text-slate-500 uppercase tracking-widest">Digital Asset Management</p>
        </div>
      </div>
    </header>
  );
};
