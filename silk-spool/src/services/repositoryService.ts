import { invoke } from '@tauri-apps/api/core';
import { Repository, RepositoryInfo, RepositoryResponse, Mod } from '../types';

export class RepositoryService {
  /**
   * Fetch a repository from a URL
   */
  static async fetchRepository(url: string): Promise<RepositoryResponse> {
    try {
      return await invoke<RepositoryResponse>('fetch_repository_command', { url });
    } catch (error) {
      return {
        success: false,
        error: `Failed to fetch repository: ${error}`,
      };
    }
  }

  /**
   * Get all cached repositories
   */
  static async getCachedRepositories(): Promise<RepositoryInfo[]> {
    try {
      return await invoke<RepositoryInfo[]>('get_cached_repositories_command');
    } catch (error) {
      console.error('Failed to get cached repositories:', error);
      return [];
    }
  }

  /**
   * Load a specific cached repository
   */
  static async loadCachedRepository(repoId: string): Promise<Repository | null> {
    try {
      return await invoke<Repository>('load_cached_repository_command', { repoId });
    } catch (error) {
      console.error(`Failed to load repository ${repoId}:`, error);
      return null;
    }
  }

  /**
   * Clear cache for a specific repository
   */
  static async clearRepositoryCache(repoId: string): Promise<boolean> {
    try {
      await invoke('clear_repository_cache_command', { repoId });
      return true;
    } catch (error) {
      console.error(`Failed to clear cache for repository ${repoId}:`, error);
      return false;
    }
  }

  /**
   * Clear all cached repositories
   */
  static async clearAllCache(): Promise<boolean> {
    try {
      await invoke('clear_all_cache_command');
      return true;
    } catch (error) {
      console.error('Failed to clear all cache:', error);
      return false;
    }
  }

  /**
   * Add a repository URL to the configuration
   */
  static async addRepository(url: string): Promise<boolean> {
    try {
      await invoke('add_repository', { url });
      return true;
    } catch (error) {
      console.error('Failed to add repository:', error);
      return false;
    }
  }

  /**
   * Remove a repository URL from the configuration
   */
  static async removeRepository(url: string): Promise<boolean> {
    try {
      await invoke('remove_repository', { url });
      return true;
    } catch (error) {
      console.error('Failed to remove repository:', error);
      return false;
    }
  }

  /**
   * Load the built-in mods.json repository
   */
  static async loadBuiltInRepository(): Promise<Repository | null> {
    try {
      const response = await fetch('/mods.json');
      if (!response.ok) {
        console.log('No built-in mods.json found');
        return null;
      }
      return await response.json();
    } catch (error) {
      console.log('Failed to load built-in repository:', error);
      return null;
    }
  }

  /**
   * Load the official SilkSpool repository from GitHub
   */
  static async loadOfficialRepository(): Promise<Repository | null> {
    try {
      const response = await fetch(
        'https://raw.githubusercontent.com/FrancescoGrazioso/SilkSpool-sources/refs/heads/main/silkspool-sources.json'
      );
      if (!response.ok) {
        console.log('Failed to fetch official repository');
        return null;
      }
      return await response.json();
    } catch (error) {
      console.log('Failed to load official repository:', error);
      return null;
    }
  }

  /**
   * Get all repositories including built-in and official
   */
  static async getAllRepositories(): Promise<RepositoryInfo[]> {
    try {
      const cachedRepos = await this.getCachedRepositories();
      const builtInRepo = await this.loadBuiltInRepository();
      const officialRepo = await this.loadOfficialRepository();

      const allRepos = [...cachedRepos];

      // Add official repository first (highest priority)
      if (officialRepo) {
        allRepos.unshift({
          id: 'official',
          name: officialRepo.name,
          url: 'https://raw.githubusercontent.com/FrancescoGrazioso/SilkSpool-sources/refs/heads/main/silkspool-sources.json',
          version: officialRepo.version,
          mod_count: officialRepo.mods.length,
        });
      }

      // Add built-in repository second (only if it has mods)
      if (builtInRepo && builtInRepo.mods.length > 0) {
        allRepos.unshift({
          id: 'built-in',
          name: builtInRepo.name,
          url: '/mods.json',
          version: builtInRepo.version,
          mod_count: builtInRepo.mods.length,
        });
      }

      return allRepos;
    } catch (error) {
      console.error('Failed to get all repositories:', error);
      return [];
    }
  }

  /**
   * Get all mods from all repositories including built-in and official
   */
  static async getAllMods(): Promise<Mod[]> {
    try {
      const allMods: Mod[] = [];

      // Load official repository first (highest priority)
      const officialRepo = await this.loadOfficialRepository();
      if (officialRepo) {
        allMods.push(...officialRepo.mods);
      }

      // Load built-in repository second (only if it has mods)
      const builtInRepo = await this.loadBuiltInRepository();
      if (builtInRepo && builtInRepo.mods.length > 0) {
        allMods.push(...builtInRepo.mods);
      }

      // Load cached repositories
      const repositories = await this.getCachedRepositories();
      for (const repoInfo of repositories) {
        const repository = await this.loadCachedRepository(repoInfo.id);
        if (repository) {
          allMods.push(...repository.mods);
        }
      }

      return allMods;
    } catch (error) {
      console.error('Failed to get all mods:', error);
      return [];
    }
  }

  /**
   * Get mods from a specific repository
   */
  static async getModsFromRepository(repoId: string): Promise<Mod[]> {
    try {
      if (repoId === 'official') {
        const repository = await this.loadOfficialRepository();
        return repository ? repository.mods : [];
      } else if (repoId === 'built-in') {
        const repository = await this.loadBuiltInRepository();
        return repository && repository.mods.length > 0 ? repository.mods : [];
      } else {
        const repository = await this.loadCachedRepository(repoId);
        return repository ? repository.mods : [];
      }
    } catch (error) {
      console.error(`Failed to get mods from repository ${repoId}:`, error);
      return [];
    }
  }

  /**
   * Search mods across all repositories
   */
  static async searchMods(query: string): Promise<Mod[]> {
    try {
      const allMods = await this.getAllMods();
      const lowercaseQuery = query.toLowerCase();

      return allMods.filter(
        mod =>
          mod.title.toLowerCase().includes(lowercaseQuery) ||
          mod.description.toLowerCase().includes(lowercaseQuery) ||
          mod.authors.some(author => author.toLowerCase().includes(lowercaseQuery))
      );
    } catch (error) {
      console.error('Failed to search mods:', error);
      return [];
    }
  }

  /**
   * Get a specific mod by ID
   */
  static async getModById(modId: string): Promise<Mod | null> {
    try {
      const allMods = await this.getAllMods();
      return allMods.find(mod => mod.id === modId) || null;
    } catch (error) {
      console.error(`Failed to get mod ${modId}:`, error);
      return null;
    }
  }
}
