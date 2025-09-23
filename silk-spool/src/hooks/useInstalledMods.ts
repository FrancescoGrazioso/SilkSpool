import { useState, useEffect } from 'react';
import { installedModsService } from '../services/installedModsService';
import { InstalledMod } from '../types';

/**
 * Hook to get the current list of installed mods
 */
export const useInstalledMods = (): InstalledMod[] => {
  const [installedMods, setInstalledMods] = useState<InstalledMod[]>([]);

  useEffect(() => {
    // Load initial data
    installedModsService.loadInstalledMods().then(setInstalledMods);

    // Subscribe to changes
    const unsubscribe = installedModsService.subscribe(setInstalledMods);

    return unsubscribe;
  }, []);

  return installedMods;
};

/**
 * Hook to check if a specific mod is installed
 */
export const useIsModInstalled = (modId: string): boolean => {
  const installedMods = useInstalledMods();
  return installedMods.some(mod => mod.modId === modId);
};
