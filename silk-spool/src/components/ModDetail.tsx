import React, { useState, useEffect } from 'react';
import { Mod } from '../types';
import { ImageGallery } from './ImageGallery';
import { openUrl } from '@tauri-apps/plugin-opener';
import { InstallerService } from '../services/installerService';
import { installedModsService } from '../services/installedModsService';

interface ModDetailProps {
  mod: Mod | null;
  gamePath: string | null;
  className?: string;
}

export const ModDetail: React.FC<ModDetailProps> = ({
  mod,
  gamePath,
  className = ""
}) => {
  const [loadingDownload, setLoadingDownload] = useState<string | null>(null);
  const [loadingHomepage, setLoadingHomepage] = useState(false);
  const [loadingUninstall, setLoadingUninstall] = useState(false);
  const [installedMods, setInstalledMods] = useState<string[]>([]);

  // Listen to installed mods changes
  useEffect(() => {
    const unsubscribe = installedModsService.subscribe((mods) => {
      setInstalledMods(mods.map(m => m.modId));
    });

    // Load initial state
    setInstalledMods(installedModsService.getInstalledMods().map(m => m.modId));

    return unsubscribe;
  }, []);

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

  const handleDownload = async (downloadUrl: string, downloadLabel: string) => {
    if (!gamePath) {
      return;
    }

    setLoadingDownload(downloadLabel);
    try {
      // Install the mod using the installer service (notifications are handled by the service)
      await InstallerService.installMod(
        downloadUrl,
        gamePath,
        mod,
        downloadLabel
      );
    } catch (error) {
      console.error('Failed to install mod:', error);
    } finally {
      setLoadingDownload(null);
    }
  };

  const handleHomepageClick = async () => {
    if (mod.homepage) {
      setLoadingHomepage(true);
      try {
        // Open homepage URL in browser using Tauri
        await openUrl(mod.homepage);
      } catch (error) {
        console.error('Failed to open homepage URL:', error);
        // Fallback to window.open if Tauri fails
        window.open(mod.homepage, '_blank');
      } finally {
        setLoadingHomepage(false);
      }
    }
  };

  const handleUninstall = async () => {
    if (!gamePath || !mod) {
      return;
    }

    setLoadingUninstall(true);
    try {
      await InstallerService.uninstallMod(gamePath, mod);
    } catch (error) {
      console.error('Failed to uninstall mod:', error);
    } finally {
      setLoadingUninstall(false);
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
          <ImageGallery
            images={mod.images}
            title={mod.title}
          />
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
            {mod.downloads.map((download, index) => {
              const isLoading = loadingDownload === download.label;
              return (
                <button
                  key={index}
                  onClick={() => handleDownload(download.url, download.label)}
                  disabled={isLoading}
                  className={`w-full px-4 py-3 rounded-lg transition-colors duration-200 flex items-center justify-between ${
                    isLoading
                      ? 'bg-primary-500 cursor-not-allowed'
                      : 'bg-primary-600 hover:bg-primary-700'
                  } text-white`}
                >
                  <span className="font-medium">
                    {isLoading ? 'Installing...' : download.label}
                  </span>
                  {isLoading ? (
                    <svg
                      className="h-5 w-5 animate-spin"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  ) : (
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
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Uninstall Button */}
      {installedMods.includes(mod.id) && (
        <div className="mb-6">
          <button
            onClick={handleUninstall}
            disabled={loadingUninstall}
            className={`w-full px-4 py-3 rounded-lg transition-colors duration-200 flex items-center justify-between ${
              loadingUninstall
                ? 'bg-red-500 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700'
            } text-white`}
          >
            <span className="font-medium">
              {loadingUninstall ? 'Uninstalling...' : 'Uninstall Mod'}
            </span>
            {loadingUninstall ? (
              <svg
                className="h-5 w-5 animate-spin"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            ) : (
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            )}
          </button>
        </div>
      )}

      {/* Homepage */}
      {mod.homepage && (
        <div className="mb-6">
          <button
            onClick={handleHomepageClick}
            disabled={loadingHomepage}
            className={`w-full px-4 py-3 rounded-lg transition-colors duration-200 flex items-center justify-between ${
              loadingHomepage
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-gray-700 hover:bg-gray-600'
            } text-gray-100`}
          >
            <span className="font-medium">
              {loadingHomepage ? 'Opening...' : 'Visit Homepage'}
            </span>
            {loadingHomepage ? (
              <svg
                className="h-5 w-5 animate-spin"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            ) : (
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
            )}
          </button>
        </div>
      )}

    </div>
  );
};
