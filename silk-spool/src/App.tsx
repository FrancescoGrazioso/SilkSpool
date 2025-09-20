import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import { GameStatus, Mod, RepositoryInfo } from "./types";
import { SearchBar, StatusBar, RepoSelector, ModList, ModDetail, AddRepoDialog } from "./components";
import { RepositoryService } from "./services/repositoryService";

function App() {
  const [gameStatus, setGameStatus] = useState<GameStatus>({
    path: null,
    found: false,
    bepinex: {
      present: false,
      initialized: false,
      message: "Scanning for game installation..."
    }
  });

  const [isScanning, setIsScanning] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMod, setSelectedMod] = useState<Mod | null>(null);
  const [activeRepoId, setActiveRepoId] = useState<string | null>(null);
  const [mods, setMods] = useState<Mod[]>([]);
  const [repositories, setRepositories] = useState<RepositoryInfo[]>([]);
  const [isAddRepoDialogOpen, setIsAddRepoDialogOpen] = useState(false);
  const [isLoadingMods, setIsLoadingMods] = useState(false);

  const handleSelectGameFolder = async () => {
    try {
      // This would open a file dialog to select the game folder
      // For now, we'll use a simple prompt
      const path = prompt("Enter the path to your Hollow Knight: Silksong installation:");
      if (path) {
        setIsScanning(true);
        const result = await invoke<GameStatus>("validate_game_path_command", { path });
        setGameStatus(result);
        setIsScanning(false);
      }
    } catch (error) {
      console.error("Path validation failed:", error);
      alert(`Failed to validate path: ${error}`);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleModSelect = (mod: Mod) => {
    setSelectedMod(mod);
  };

  const handleRepoSelect = async (repoId: string | null) => {
    setActiveRepoId(repoId);
    await loadMods(repoId);
  };

  const handleAddRepo = () => {
    setIsAddRepoDialogOpen(true);
  };


  const handleRepositoryAdded = async (_url: string) => {
    // Refresh repositories and mods
    await loadRepositories();
    await loadMods(activeRepoId);
  };

  const loadRepositories = async () => {
    try {
      const repos = await RepositoryService.getAllRepositories();
      setRepositories(repos);
    } catch (error) {
      console.error('Failed to load repositories:', error);
    }
  };

  const loadMods = async (repoId: string | null) => {
    setIsLoadingMods(true);
    try {
      let mods: Mod[] = [];
      
      if (repoId) {
        mods = await RepositoryService.getModsFromRepository(repoId);
      } else {
        mods = await RepositoryService.getAllMods();
      }
      
      setMods(mods);
    } catch (error) {
      console.error('Failed to load mods:', error);
      setMods([]);
    } finally {
      setIsLoadingMods(false);
    }
  };

  useEffect(() => {
    // Real game detection using Rust backend
    const detectGame = async () => {
      setIsScanning(true);
      
      try {
        const result = await invoke<GameStatus>("detect_game");
        setGameStatus(result);
      } catch (error) {
        console.error("Game detection failed:", error);
        setGameStatus({
          path: null,
          found: false,
          bepinex: {
            present: false,
            initialized: false,
            message: `Detection error: ${error}`
          }
        });
      }
      
      setIsScanning(false);
    };

    const initializeApp = async () => {
      await detectGame();
      await loadRepositories();
      await loadMods(null);
    };

    initializeApp();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SS</span>
            </div>
            <h1 className="text-xl font-semibold">Silk Spool</h1>
          </div>
          
          <StatusBar 
            gameStatus={gameStatus}
            onSelectPath={handleSelectGameFolder}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex h-[calc(100vh-73px)]">
        {/* Sidebar - Mod List */}
        <div className="w-1/3 bg-gray-800 border-r border-gray-700 p-4 flex flex-col">
          {/* Search and Repository Controls */}
          <div className="mb-4 space-y-3">
            <SearchBar 
              onSearch={handleSearch}
              placeholder="Search mods..."
            />
            
            <RepoSelector
              repositories={repositories}
              activeRepoId={activeRepoId}
              onRepoSelect={handleRepoSelect}
              onAddRepo={handleAddRepo}
            />
          </div>
          
          {/* Mod List */}
          <div className="flex-1">
            {isScanning || isLoadingMods ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-400">
                  {isScanning ? 'Scanning for game installation...' : 'Loading mods...'}
                </p>
              </div>
            ) : (
              <ModList
                mods={mods}
                selectedModId={selectedMod?.id || null}
                onModSelect={handleModSelect}
                searchQuery={searchQuery}
              />
            )}
          </div>
        </div>

        {/* Main Panel - Mod Details */}
        <div className="flex-1 p-6">
          {isScanning ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin w-12 h-12 border-2 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <h2 className="text-xl font-semibold mb-2">Initializing Silk Spool</h2>
                <p className="text-gray-400">Detecting game installation and BepInEx...</p>
              </div>
            </div>
          ) : (
            <ModDetail 
              mod={selectedMod}
              className="h-full"
            />
          )}
        </div>
      </main>

      {/* Add Repository Dialog */}
      <AddRepoDialog
        isOpen={isAddRepoDialogOpen}
        onClose={() => setIsAddRepoDialogOpen(false)}
        onRepositoryAdded={handleRepositoryAdded}
      />
    </div>
  );
}

export default App;
