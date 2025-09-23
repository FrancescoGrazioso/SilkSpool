import React from 'react';
import { Mod } from '../types';
import { useIsModInstalled } from '../hooks/useInstalledMods';

interface ModItemProps {
  mod: Mod;
  isSelected: boolean;
  onClick: () => void;
}

export const ModItem: React.FC<ModItemProps> = ({
  mod,
  isSelected,
  onClick
}) => {
  const isInstalled = useIsModInstalled(mod.id);
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'bg-primary-600 border border-primary-500'
          : 'bg-gray-800 border border-gray-700 hover:bg-gray-750 hover:border-gray-600'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center justify-between mb-1">
          <h3 className={`font-semibold text-sm leading-tight ${
            isSelected ? 'text-white' : 'text-gray-100'
          }`}>
            {mod.title}
          </h3>
          {isInstalled && (
            <span className="text-xs px-2 py-1 rounded-full bg-green-600 text-white">
              Installed
            </span>
          )}
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${
          isSelected 
            ? 'bg-primary-500 text-white' 
            : 'bg-gray-700 text-gray-300'
        }`}>
          {formatDate(mod.updated_at)}
        </span>
      </div>

      {/* Authors */}
      {mod.authors.length > 0 && (
        <div className="mb-2">
          <span className={`text-xs ${
            isSelected ? 'text-primary-200' : 'text-gray-400'
          }`}>
            by {mod.authors.join(', ')}
          </span>
        </div>
      )}

      {/* Description */}
      <p className={`text-xs mb-3 line-clamp-2 ${
        isSelected ? 'text-gray-200' : 'text-gray-300'
      }`}>
        {mod.description}
      </p>

      {/* Requirements */}
      {mod.requirements.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {mod.requirements.slice(0, 2).map((req, index) => (
            <span
              key={index}
              className={`text-xs px-2 py-1 rounded ${
                isSelected
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-700 text-gray-300'
              }`}
            >
              {req}
            </span>
          ))}
          {mod.requirements.length > 2 && (
            <span className={`text-xs px-2 py-1 rounded ${
              isSelected
                ? 'bg-primary-500 text-white'
                : 'bg-gray-700 text-gray-300'
            }`}>
              +{mod.requirements.length - 2} more
            </span>
          )}
        </div>
      )}

      {/* Game Version */}
      <div className="flex items-center justify-between">
        <span className={`text-xs ${
          isSelected ? 'text-primary-200' : 'text-gray-400'
        }`}>
          Game: {mod.game_version}
        </span>
        
        {/* Download Count */}
        <span className={`text-xs ${
          isSelected ? 'text-primary-200' : 'text-gray-400'
        }`}>
          {mod.downloads.length} download{mod.downloads.length !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
};
