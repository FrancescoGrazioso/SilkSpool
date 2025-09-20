import React, { useState } from 'react';

export interface FilterOptions {
  requirements: string[];
  authors: string[];
  sortBy: 'name' | 'date' | 'relevance';
  sortOrder: 'asc' | 'desc';
}

interface AdvancedFiltersProps {
  onFiltersChange: (filters: FilterOptions) => void;
  availableRequirements: string[];
  availableAuthors: string[];
  className?: string;
}

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  onFiltersChange,
  availableRequirements,
  availableAuthors,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    requirements: [],
    authors: [],
    sortBy: 'date',
    sortOrder: 'desc'
  });

  const handleRequirementToggle = (requirement: string) => {
    const newRequirements = filters.requirements.includes(requirement)
      ? filters.requirements.filter(r => r !== requirement)
      : [...filters.requirements, requirement];
    
    const newFilters = { ...filters, requirements: newRequirements };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleAuthorToggle = (author: string) => {
    const newAuthors = filters.authors.includes(author)
      ? filters.authors.filter(a => a !== author)
      : [...filters.authors, author];
    
    const newFilters = { ...filters, authors: newAuthors };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleSortChange = (sortBy: 'name' | 'date' | 'relevance') => {
    const newFilters = { ...filters, sortBy };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleSortOrderChange = (sortOrder: 'asc' | 'desc') => {
    const newFilters = { ...filters, sortOrder };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const newFilters: FilterOptions = {
      requirements: [],
      authors: [],
      sortBy: 'date',
      sortOrder: 'desc'
    };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const hasActiveFilters = filters.requirements.length > 0 || filters.authors.length > 0;

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
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
        <span className="text-sm">Filters</span>
        {hasActiveFilters && (
          <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
            {filters.requirements.length + filters.authors.length}
          </span>
        )}
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
        <div className="absolute top-full left-0 mt-1 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
          <div className="p-4 space-y-4">
            {/* Sort Options */}
            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-2">Sort By</h3>
              <div className="flex space-x-2">
                {(['name', 'date', 'relevance'] as const).map((option) => (
                  <button
                    key={option}
                    onClick={() => handleSortChange(option)}
                    className={`px-3 py-1 rounded text-xs transition-colors ${
                      filters.sortBy === option
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {option === 'name' ? 'Name' : option === 'date' ? 'Date' : 'Relevance'}
                  </button>
                ))}
              </div>
              <div className="flex space-x-2 mt-2">
                <button
                  onClick={() => handleSortOrderChange('asc')}
                  className={`px-3 py-1 rounded text-xs transition-colors ${
                    filters.sortOrder === 'asc'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Ascending
                </button>
                <button
                  onClick={() => handleSortOrderChange('desc')}
                  className={`px-3 py-1 rounded text-xs transition-colors ${
                    filters.sortOrder === 'desc'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Descending
                </button>
              </div>
            </div>

            {/* Requirements Filter */}
            {availableRequirements.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-2">Requirements</h3>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {availableRequirements.map((requirement) => (
                    <label
                      key={requirement}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={filters.requirements.includes(requirement)}
                        onChange={() => handleRequirementToggle(requirement)}
                        className="rounded border-gray-600 bg-gray-700 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-300">{requirement}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Authors Filter */}
            {availableAuthors.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-2">Authors</h3>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {availableAuthors.map((author) => (
                    <label
                      key={author}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={filters.authors.includes(author)}
                        onChange={() => handleAuthorToggle(author)}
                        className="rounded border-gray-600 bg-gray-700 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-300">{author}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Clear Filters */}
            {hasActiveFilters && (
              <div className="pt-2 border-t border-gray-700">
                <button
                  onClick={clearFilters}
                  className="w-full text-sm text-primary-400 hover:text-primary-300 py-2"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
