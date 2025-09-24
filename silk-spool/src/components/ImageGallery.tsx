import React, { useState, useCallback, useEffect } from 'react';
import { LazyImage } from './LazyImage';

interface ImageGalleryProps {
  images: string[];
  title: string;
  className?: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images, title, className = '' }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  const handleImageLoad = useCallback((index: number) => {
    setLoadedImages(prev => new Set([...prev, index]));
  }, []);

  const handleImageError = useCallback(
    (index: number) => {
      console.warn(`Failed to load image ${index} for ${title}`);
    },
    [title]
  );

  const openLightbox = (index: number) => {
    setSelectedImageIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setSelectedImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
    } else {
      setSelectedImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
    }
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isLightboxOpen) {
        return;
      }

      switch (e.key) {
        case 'Escape':
          closeLightbox();
          break;
        case 'ArrowLeft':
          navigateImage('prev');
          break;
        case 'ArrowRight':
          navigateImage('next');
          break;
      }
    },
    [isLightboxOpen]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Reset selected image index when images change (e.g., when switching mods)
  useEffect(() => {
    setSelectedImageIndex(0);
    setLoadedImages(new Set());
  }, [images]);

  if (!images || images.length === 0) {
    return (
      <div className={`bg-gray-800 rounded-lg flex items-center justify-center ${className}`}>
        <div className='text-center text-gray-400'>
          <svg
            className='w-12 h-12 mx-auto mb-2'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
            />
          </svg>
          <p className='text-sm'>No images available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Main Image */}
      <div className='mb-3 h-80 bg-gray-800 rounded-lg overflow-hidden'>
        <LazyImage
          src={images[selectedImageIndex]}
          alt={`${title} screenshot ${selectedImageIndex + 1}`}
          className='w-full h-full object-contain cursor-pointer hover:opacity-90 transition-opacity'
          onLoad={() => handleImageLoad(selectedImageIndex)}
          onError={() => handleImageError(selectedImageIndex)}
          onClick={() => openLightbox(selectedImageIndex)}
        />
      </div>

      {/* Thumbnail Grid */}
      {images.length > 1 && (
        <div className='grid grid-cols-4 gap-2 pl-1'>
          {images.map((image, index) => (
            <div
              key={index}
              className={`relative aspect-video rounded cursor-pointer transition-all overflow-hidden ${
                selectedImageIndex === index
                  ? 'ring-2 ring-primary-500 opacity-100'
                  : 'opacity-60 hover:opacity-80'
              }`}
              onClick={() => setSelectedImageIndex(index)}
            >
              <LazyImage
                src={image}
                alt={`${title} thumbnail ${index + 1}`}
                className='w-full h-full object-cover'
                onLoad={() => handleImageLoad(index)}
                onError={() => handleImageError(index)}
              />

              {/* Loading indicator */}
              {!loadedImages.has(index) && (
                <div className='absolute inset-0 bg-gray-700 flex items-center justify-center'>
                  <div className='animate-spin w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full'></div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {isLightboxOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4'>
          <div className='relative max-w-7xl max-h-full'>
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className='absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors'
            >
              <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>

            {/* Navigation buttons */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => navigateImage('prev')}
                  className='absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors'
                >
                  <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M15 19l-7-7 7-7'
                    />
                  </svg>
                </button>
                <button
                  onClick={() => navigateImage('next')}
                  className='absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors'
                >
                  <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 5l7 7-7 7'
                    />
                  </svg>
                </button>
              </>
            )}

            {/* Main lightbox image */}
            <LazyImage
              src={images[selectedImageIndex]}
              alt={`${title} fullscreen ${selectedImageIndex + 1}`}
              className='max-w-full max-h-full object-contain rounded-lg'
              onLoad={() => handleImageLoad(selectedImageIndex)}
              onError={() => handleImageError(selectedImageIndex)}
            />

            {/* Image counter */}
            {images.length > 1 && (
              <div className='absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm'>
                {selectedImageIndex + 1} / {images.length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
