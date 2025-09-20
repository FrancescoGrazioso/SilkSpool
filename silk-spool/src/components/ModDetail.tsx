import React, { useState } from 'react';
import { Mod } from '../types';

interface ModDetailProps {
  mod: Mod | null;
  className?: string;
}

export const ModDetail: React.FC<ModDetailProps> = ({
  mod,
  className = ""
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);

  if (!mod) {
    return (
      <div className={`flex flex-col items-center justify-center h-full ${className}`}>
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
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-300 mb-2">Select a Mod</h3>
        <p className="text-sm text-gray-400 text-center max-w-sm">
          Choose a mod from the list to view its details, images, and download options.
        </p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const handleDownload = (downloadUrl: string) => {
    // Open download URL in browser
    window.open(downloadUrl, '_blank');
  };

  const handleHomepageClick = () => {
    if (mod.homepage) {
      window.open(mod.homepage, '_blank');
    }
  };

  return (
    <div className={`h-full overflow-y-auto ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-100 mb-2">{mod.title}</h1>
        
        {/* Authors */}
        {mod.authors.length > 0 && (
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-sm text-gray-400">by</span>
            <div className="flex flex-wrap gap-1">
              {mod.authors.map((author, index) => (
                <span
                  key={index}
                  className="text-sm text-primary-400 hover:text-primary-300 cursor-pointer"
                >
                  {author}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Meta info */}
        <div className="flex items-center space-x-4 text-sm text-gray-400">
          <span>Updated: {formatDate(mod.updated_at)}</span>
          <span>Game: {mod.game_version}</span>
          <span>{mod.downloads.length} download{mod.downloads.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Images */}
      {mod.images.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-100 mb-3">Images</h2>
          
          {/* Main image */}
          <div className="mb-3">
            <img
              src={mod.images[selectedImageIndex]}
              alt={`${mod.title} screenshot ${selectedImageIndex + 1}`}
              className="w-full h-64 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setShowLightbox(true)}
            />
          </div>

          {/* Thumbnail grid */}
          {mod.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {mod.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${mod.title} screenshot ${index + 1}`}
                  className={`w-full h-16 object-cover rounded cursor-pointer transition-all ${
                    selectedImageIndex === index
                      ? 'ring-2 ring-primary-500 opacity-100'
                      : 'opacity-60 hover:opacity-80'
                  }`}
                  onClick={() => setSelectedImageIndex(index)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Description */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-100 mb-3">Description</h2>
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
            {mod.description}
          </p>
        </div>
      </div>

      {/* Requirements */}
      {mod.requirements.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-100 mb-3">Requirements</h2>
          <div className="flex flex-wrap gap-2">
            {mod.requirements.map((req, index) => (
              <span
                key={index}
                className="bg-gray-700 text-gray-200 px-3 py-1 rounded-full text-sm"
              >
                {req}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Downloads */}
      {mod.downloads.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-100 mb-3">Downloads</h2>
          <div className="space-y-2">
            {mod.downloads.map((download, index) => (
              <button
                key={index}
                onClick={() => handleDownload(download.url)}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white px-4 py-3 rounded-lg transition-colors duration-200 flex items-center justify-between"
              >
                <span className="font-medium">{download.label}</span>
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Homepage */}
      {mod.homepage && (
        <div className="mb-6">
          <button
            onClick={handleHomepageClick}
            className="w-full bg-gray-700 hover:bg-gray-600 text-gray-100 px-4 py-3 rounded-lg transition-colors duration-200 flex items-center justify-between"
          >
            <span className="font-medium">Visit Homepage</span>
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Lightbox */}
      {showLightbox && mod.images.length > 0 && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
          onClick={() => setShowLightbox(false)}
        >
          <div className="relative max-w-4xl max-h-full p-4">
            <button
              onClick={() => setShowLightbox(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <img
              src={mod.images[selectedImageIndex]}
              alt={`${mod.title} screenshot ${selectedImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
            
            {mod.images.length > 1 && (
              <div className="flex justify-center mt-4 space-x-2">
                {mod.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImageIndex(index);
                    }}
                    className={`w-3 h-3 rounded-full ${
                      selectedImageIndex === index ? 'bg-white' : 'bg-gray-500'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
