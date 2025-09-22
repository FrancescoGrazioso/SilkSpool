import { invoke } from '@tauri-apps/api/core';
import { InstalledMod, InstalledModsData } from '../types';
import { notificationService } from './notificationService';

class InstalledModsService {
  private static instance: InstalledModsService;
  private installedMods: InstalledMod[] = [];
  private listeners: ((mods: InstalledMod[]) => void)[] = [];

  private constructor() {}

  public static getInstance(): InstalledModsService {
    if (!InstalledModsService.instance) {
      InstalledModsService.instance = new InstalledModsService();
    }
    return InstalledModsService.instance;
  }

  /**
   * Subscribe to installed mods changes
   */
  public subscribe(listener: (mods: InstalledMod[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify all listeners of changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.installedMods));
  }

  /**
   * Load installed mods from storage
   */
  public async loadInstalledMods(): Promise<InstalledMod[]> {
    try {
      const data: InstalledModsData = await invoke('get_installed_mods');
      this.installedMods = data.mods || [];
      this.notifyListeners();
      return this.installedMods;
    } catch (error) {
      console.error('Failed to load installed mods:', error);
      this.installedMods = [];
      this.notifyListeners();
      return [];
    }
  }

  /**
   * Save installed mods to storage
   */
  public async saveInstalledMods(): Promise<void> {
    try {
      const data: InstalledModsData = {
        mods: this.installedMods,
        lastUpdated: new Date().toISOString()
      };
      await invoke('save_installed_mods_command', { data });
    } catch (error) {
      console.error('Failed to save installed mods:', error);
      throw error;
    }
  }

  /**
   * Add a mod to the installed list
   */
  public async addInstalledMod(
    modId: string,
    modTitle: string,
    version: string,
    installedFiles: string[],
    gamePath: string,
    downloadUrl?: string
  ): Promise<void> {
    const installedMod: InstalledMod = {
      modId,
      modTitle,
      version,
      installedAt: new Date().toISOString(),
      installedFiles,
      gamePath,
      downloadUrl
    };

    // Remove existing mod with same ID if present
    this.installedMods = this.installedMods.filter(mod => mod.modId !== modId);
    
    // Add new mod
    this.installedMods.push(installedMod);
    
    await this.saveInstalledMods();
    this.notifyListeners();

    notificationService.success(
      'Mod Installed',
      `${modTitle} v${version} has been installed successfully`
    );
  }

  /**
   * Remove a mod from the installed list
   */
  public async removeInstalledMod(modId: string): Promise<void> {
    const mod = this.installedMods.find(m => m.modId === modId);
    if (!mod) {
      throw new Error('Mod not found in installed list');
    }

    this.installedMods = this.installedMods.filter(m => m.modId !== modId);
    await this.saveInstalledMods();
    this.notifyListeners();

    notificationService.success(
      'Mod Uninstalled',
      `${mod.modTitle} has been uninstalled successfully`
    );
  }

  /**
   * Check if a mod is installed
   */
  public isModInstalled(modId: string): boolean {
    return this.installedMods.some(mod => mod.modId === modId);
  }

  /**
   * Get installed mod info
   */
  public getInstalledMod(modId: string): InstalledMod | undefined {
    return this.installedMods.find(mod => mod.modId === modId);
  }

  /**
   * Get all installed mods
   */
  public getInstalledMods(): InstalledMod[] {
    return [...this.installedMods];
  }

  /**
   * Get installed mods count
   */
  public getInstalledModsCount(): number {
    return this.installedMods.length;
  }

  /**
   * Update mod version after reinstallation
   */
  public async updateModVersion(
    modId: string,
    newVersion: string,
    newInstalledFiles: string[]
  ): Promise<void> {
    const modIndex = this.installedMods.findIndex(mod => mod.modId === modId);
    if (modIndex === -1) {
      throw new Error('Mod not found in installed list');
    }

    this.installedMods[modIndex].version = newVersion;
    this.installedMods[modIndex].installedFiles = newInstalledFiles;
    this.installedMods[modIndex].installedAt = new Date().toISOString();

    await this.saveInstalledMods();
    this.notifyListeners();

    notificationService.success(
      'Mod Updated',
      `${this.installedMods[modIndex].modTitle} has been updated to v${newVersion}`
    );
  }

  /**
   * Clear all installed mods (for testing or reset)
   */
  public async clearAllInstalledMods(): Promise<void> {
    this.installedMods = [];
    await this.saveInstalledMods();
    this.notifyListeners();
  }
}

export const installedModsService = InstalledModsService.getInstance();
