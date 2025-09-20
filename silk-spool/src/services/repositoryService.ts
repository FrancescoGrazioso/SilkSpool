import { invoke } from '@tauri-apps/api/core';
import { Repository, RepositoryInfo, RepositoryResponse, Mod } from '../types';

export class RepositoryService {
  /**
   * Fetch a repository from a URL
   */
  static async fetchRepository(url: string): Promise<RepositoryResponse> {
    try {
      const response = await invoke<RepositoryResponse>('fetch_repository_command', { url });
      return response;
    } catch (error) {
      return {
        success: false,
        error: `Failed to fetch repository: ${error}`
      };
    }
  }

  /**
   * Get all cached repositories
   */
  static async getCachedRepositories(): Promise<RepositoryInfo[]> {
    try {
      const repositories = await invoke<RepositoryInfo[]>('get_cached_repositories_command');
      return repositories;
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
      const repository = await invoke<Repository>('load_cached_repository_command', { repoId });
      return repository;
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
      const repository = await response.json();
      return repository;
    } catch (error) {
      console.log('Failed to load built-in repository:', error);
      return null;
    }
  }

  /**
   * Get all repositories including built-in
   */
  static async getAllRepositories(): Promise<RepositoryInfo[]> {
    try {
      const cachedRepos = await this.getCachedRepositories();
      const builtInRepo = await this.loadBuiltInRepository();
      
      const allRepos = [...cachedRepos];
      
      if (builtInRepo) {
        allRepos.unshift({
          id: 'built-in',
          name: builtInRepo.name,
          url: '/mods.json',
          version: builtInRepo.version,
          mod_count: builtInRepo.mods.length
        });
      }
      
      return allRepos;
    } catch (error) {
      console.error('Failed to get all repositories:', error);
      return [];
    }
  }

  /**
   * Get all mods from all repositories including built-in
   */
  static async getAllMods(): Promise<Mod[]> {
    try {
      const allMods: Mod[] = [];
      
      // Load built-in repository first
      const builtInRepo = await this.loadBuiltInRepository();
      if (builtInRepo) {
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
      if (repoId === 'built-in') {
        const repository = await this.loadBuiltInRepository();
        return repository ? repository.mods : [];
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

      return allMods.filter(mod => 
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
