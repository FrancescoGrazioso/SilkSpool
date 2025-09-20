// Core application types for Silk Spool

export interface Mod {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  images: string[];
  downloads: Download[];
  homepage: string;
  authors: string[];
  game_version: string;
  updated_at: string;
}

export interface Download {
  label: string;
  url: string;
}

export interface Repository {
  repo_id: string;
  name: string;
  version: number;
  mods: Mod[];
}

export interface RepositoryInfo {
  id: string;
  name: string;
  url: string;
  version: number;
  last_updated?: string;
  mod_count: number;
}

export interface RepositoryResponse {
  success: boolean;
  data?: Repository;
  error?: string;
}

export interface GameStatus {
  path: string | null;
  found: boolean;
  bepinex: BepInExStatus;
}

export interface BepInExStatus {
  present: boolean;
  initialized: boolean;
  message: string;
}

export interface AppConfig {
  gamePath: string | null;
  repos: string[];
  ui: {
    theme: 'dark' | 'light';
    windowSize: {
      width: number;
      height: number;
    };
  };
}

export interface SteamLibrary {
  path: string;
  apps: SteamApp[];
}

export interface SteamApp {
  appid: string;
  name: string;
  installdir: string;
}

export interface SearchFilters {
  query: string;
  requirements: string[];
  authors: string[];
  sortBy: 'name' | 'date' | 'relevance';
  sortOrder: 'asc' | 'desc';
}

export interface UIState {
  selectedMod: Mod | null;
  searchFilters: SearchFilters;
  activeRepos: string[];
  isLoading: boolean;
  error: string | null;
}

export interface GameState {
  gameStatus: GameStatus;
  isScanning: boolean;
  lastScanTime: Date | null;
}
