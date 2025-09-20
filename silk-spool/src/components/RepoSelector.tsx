import React, { useState } from 'react';
import { RepositoryInfo } from '../types';

interface RepoSelectorProps {
  repositories: RepositoryInfo[];
  activeRepoId: string | null;
  onRepoSelect: (repoId: string | null) => void;
  onAddRepo: () => void;
  className?: string;
}

export const RepoSelector: React.FC<RepoSelectorProps> = ({
  repositories,
  activeRepoId,
  onRepoSelect,
  onAddRepo,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleRepoSelect = (repoId: string | null) => {
    onRepoSelect(repoId);
    setIsOpen(false);
  };

  const getTotalModCount = () => {
    return repositories.reduce((total, repo) => total + repo.mod_count, 0);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-gray-100 px-3 py-2 rounded-lg transition-colors duration-200"
      >
        <svg
          className="h-4 w-4"
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
        <span className="text-sm">
          {activeRepoId 
            ? repositories.find(r => r.id === activeRepoId)?.name || 'All Repositories'
            : 'All Repositories'
          }
        </span>
        <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
          {activeRepoId 
            ? repositories.find(r => r.id === activeRepoId)?.mod_count || 0
            : getTotalModCount()
          }
        </span>
        <svg
          className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
          <div className="p-2">
            {/* All Repositories Option */}
            <button
              onClick={() => handleRepoSelect(null)}
              className={`w-full text-left px-3 py-2 rounded-md transition-colors duration-200 ${
                activeRepoId === null
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>All Repositories</span>
                <span className="bg-gray-600 text-white text-xs px-2 py-1 rounded-full">
                  {getTotalModCount()}
                </span>
              </div>
            </button>

            {/* Repository List */}
            {repositories.map((repo) => (
              <button
                key={repo.id}
                onClick={() => handleRepoSelect(repo.id)}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors duration-200 ${
                  activeRepoId === repo.id
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium flex items-center space-x-2">
                      <span>{repo.name}</span>
                      {repo.id === 'built-in' && (
                        <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                          Built-in
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 truncate">{repo.url}</div>
                  </div>
                  <span className="bg-gray-600 text-white text-xs px-2 py-1 rounded-full">
                    {repo.mod_count}
                  </span>
                </div>
              </button>
            ))}

            {/* Add Repository Button */}
            <div className="border-t border-gray-700 mt-2 pt-2">
              <button
                onClick={() => {
                  onAddRepo();
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-primary-400 hover:text-primary-300 hover:bg-gray-700 rounded-md transition-colors duration-200"
              >
                <div className="flex items-center space-x-2">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  <span>Add Repository</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
