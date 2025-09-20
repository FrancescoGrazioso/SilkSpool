import React, { useState } from 'react';
import { RepositoryService } from '../services/repositoryService';

interface AddRepoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRepositoryAdded: (url: string) => void;
}

export const AddRepoDialog: React.FC<AddRepoDialogProps> = ({
  isOpen,
  onClose,
  onRepositoryAdded
}) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError('Please enter a repository URL');
      return;
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      setError('Please enter a valid URL');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // First, try to fetch the repository to validate it
      const response = await RepositoryService.fetchRepository(url);
      
      if (response.success && response.data) {
        // Add to configuration
        const configAdded = await RepositoryService.addRepository(url);
        
        if (configAdded) {
          onRepositoryAdded(url);
          setUrl('');
          onClose();
        } else {
          setError('Failed to add repository to configuration');
        }
      } else {
        setError(response.error || 'Failed to fetch repository');
      }
    } catch (err) {
      setError(`Failed to add repository: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setUrl('');
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-100">Add Repository</h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-300 disabled:opacity-50"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="repo-url" className="block text-sm font-medium text-gray-300 mb-2">
              Repository URL
            </label>
            <input
              id="repo-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/mods.json"
              className="input-field w-full"
              disabled={isLoading}
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              Enter the URL to a JSON file containing mod repository data
            </p>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-600 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-red-300">{error}</span>
              </div>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="btn-primary flex-1 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Adding...
                </>
              ) : (
                'Add Repository'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
