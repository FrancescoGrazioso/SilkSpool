import React, { useMemo } from 'react';
import { Mod } from '../types';
import { ModItem } from './ModItem';

interface ModListProps {
  mods: Mod[];
  selectedModId: string | null;
  onModSelect: (mod: Mod) => void;
  searchQuery: string;
  className?: string;
}

export const ModList: React.FC<ModListProps> = ({
  mods,
  selectedModId,
  onModSelect,
  searchQuery,
  className = ""
}) => {
  // Filter and sort mods based on search query
  const filteredMods = useMemo(() => {
    if (!searchQuery.trim()) {
      return mods.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    }

    const query = searchQuery.toLowerCase();
    return mods
      .filter(mod => 
        mod.title.toLowerCase().includes(query) ||
        mod.description.toLowerCase().includes(query) ||
        mod.authors.some(author => author.toLowerCase().includes(query))
      )
      .sort((a, b) => {
        // Prioritize title matches
        const aTitleMatch = a.title.toLowerCase().includes(query);
        const bTitleMatch = b.title.toLowerCase().includes(query);
        
        if (aTitleMatch && !bTitleMatch) return -1;
        if (!aTitleMatch && bTitleMatch) return 1;
        
        // Then sort by date
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      });
  }, [mods, searchQuery]);

  if (mods.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
        <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-300 mb-2">No Mods Available</h3>
        <p className="text-sm text-gray-400 text-center max-w-sm">
          Add a repository to start browsing mods for Hollow Knight: Silksong
        </p>
      </div>
    );
  }

  if (filteredMods.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
        <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-300 mb-2">No Mods Found</h3>
        <p className="text-sm text-gray-400 text-center max-w-sm">
          No mods match your search for "{searchQuery}". Try a different search term.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Results count */}
      <div className="px-2 py-1">
        <span className="text-xs text-gray-400">
          {filteredMods.length} mod{filteredMods.length !== 1 ? 's' : ''} found
          {searchQuery && ` for "${searchQuery}"`}
        </span>
      </div>

      {/* Mod list */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredMods.map((mod) => (
          <ModItem
            key={mod.id}
            mod={mod}
            isSelected={selectedModId === mod.id}
            onClick={() => onModSelect(mod)}
          />
        ))}
      </div>
    </div>
  );
};
