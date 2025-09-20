use serde::{Deserialize, Serialize};
use std::path::Path;
use tauri::State;
use tokio::fs as async_fs;
use tokio::io::AsyncReadExt;

use crate::types::Mod;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RepositoryInfo {
    pub id: String,
    pub name: String,
    pub url: String,
    pub version: u32,
    pub last_updated: Option<String>,
    pub mod_count: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModRepository {
    pub repo_id: String,
    pub name: String,
    pub version: u32,
    pub mods: Vec<Mod>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RepositoryResponse {
    pub success: bool,
    pub data: Option<ModRepository>,
    pub error: Option<String>,
}

pub struct RepositoryManager {
    cache_dir: String,
}

impl RepositoryManager {
    pub fn new(cache_dir: String) -> Self {
        Self { cache_dir }
    }

    /// Fetch mod data from a repository URL
    pub async fn fetch_repository(&self, url: &str) -> Result<ModRepository, String> {
        // Validate URL format
        if !url.starts_with("http://") && !url.starts_with("https://") {
            return Err("Invalid URL format. Must start with http:// or https://".to_string());
        }

        // Make HTTP request
        let response = reqwest::get(url)
            .await
            .map_err(|e| format!("Failed to fetch repository: {}", e))?;

        if !response.status().is_success() {
            return Err(format!(
                "Repository request failed with status: {}",
                response.status()
            ));
        }

        let json_text = response
            .text()
            .await
            .map_err(|e| format!("Failed to read response: {}", e))?;

        // Parse JSON
        let repository: ModRepository = serde_json::from_str(&json_text)
            .map_err(|e| format!("Failed to parse repository JSON: {}", e))?;

        // Validate repository structure
        self.validate_repository(&repository)?;

        // Cache the repository
        self.cache_repository(&repository).await?;

        Ok(repository)
    }

    /// Validate repository structure and mod data
    fn validate_repository(&self, repo: &ModRepository) -> Result<(), String> {
        // Check required fields
        if repo.repo_id.is_empty() {
            return Err("Repository ID cannot be empty".to_string());
        }
        if repo.name.is_empty() {
            return Err("Repository name cannot be empty".to_string());
        }
        if repo.version == 0 {
            return Err("Repository version must be greater than 0".to_string());
        }

        // Validate each mod
        for (index, mod_item) in repo.mods.iter().enumerate() {
            if mod_item.id.is_empty() {
                return Err(format!("Mod at index {} has empty ID", index));
            }
            if mod_item.title.is_empty() {
                return Err(format!("Mod '{}' has empty title", mod_item.id));
            }
            if mod_item.description.is_empty() {
                return Err(format!("Mod '{}' has empty description", mod_item.id));
            }
            if mod_item.game_version.is_empty() {
                return Err(format!("Mod '{}' has empty game version", mod_item.id));
            }
            if mod_item.updated_at.is_empty() {
                return Err(format!("Mod '{}' has empty updated_at", mod_item.id));
            }
        }

        Ok(())
    }

    /// Cache repository data to local file
    async fn cache_repository(&self, repo: &ModRepository) -> Result<(), String> {
        let cache_path = format!("{}/repo_{}.json", self.cache_dir, repo.repo_id);
        
        // Ensure cache directory exists
        if let Some(parent) = Path::new(&cache_path).parent() {
            async_fs::create_dir_all(parent)
                .await
                .map_err(|e| format!("Failed to create cache directory: {}", e))?;
        }

        let json_data = serde_json::to_string_pretty(repo)
            .map_err(|e| format!("Failed to serialize repository: {}", e))?;

        async_fs::write(&cache_path, json_data)
            .await
            .map_err(|e| format!("Failed to write cache file: {}", e))?;

        Ok(())
    }

    /// Load repository from cache
    pub async fn load_cached_repository(&self, repo_id: &str) -> Result<ModRepository, String> {
        let cache_path = format!("{}/repo_{}.json", self.cache_dir, repo_id);
        
        let mut file = async_fs::File::open(&cache_path)
            .await
            .map_err(|e| format!("Failed to open cache file: {}", e))?;

        let mut contents = String::new();
        file.read_to_string(&mut contents)
            .await
            .map_err(|e| format!("Failed to read cache file: {}", e))?;

        let repository: ModRepository = serde_json::from_str(&contents)
            .map_err(|e| format!("Failed to parse cached repository: {}", e))?;

        Ok(repository)
    }

    /// Get all cached repositories
    pub async fn get_cached_repositories(&self) -> Result<Vec<RepositoryInfo>, String> {
        let mut repositories = Vec::new();

        if !Path::new(&self.cache_dir).exists() {
            return Ok(repositories);
        }

        let mut entries = async_fs::read_dir(&self.cache_dir)
            .await
            .map_err(|e| format!("Failed to read cache directory: {}", e))?;

        while let Some(entry) = entries.next_entry()
            .await
            .map_err(|e| format!("Failed to read directory entry: {}", e))?
        {
            let path = entry.path();
            if path.is_file() && path.extension().and_then(|s| s.to_str()) == Some("json") {
                if let Some(filename) = path.file_stem().and_then(|s| s.to_str()) {
                    if filename.starts_with("repo_") {
                        let repo_id = filename.strip_prefix("repo_").unwrap_or(filename);
                        
                        // Try to load the repository to get metadata
                        match self.load_cached_repository(repo_id).await {
                            Ok(repo) => {
                                repositories.push(RepositoryInfo {
                                    id: repo.repo_id.clone(),
                                    name: repo.name.clone(),
                                    url: String::new(), // URL not stored in cache
                                    version: repo.version,
                                    last_updated: None, // Could be extracted from file metadata
                                    mod_count: repo.mods.len(),
                                });
                            }
                            Err(_) => {
                                // Skip corrupted cache files
                                continue;
                            }
                        }
                    }
                }
            }
        }

        Ok(repositories)
    }

    /// Clear cache for a specific repository
    pub async fn clear_repository_cache(&self, repo_id: &str) -> Result<(), String> {
        let cache_path = format!("{}/repo_{}.json", self.cache_dir, repo_id);
        
        if Path::new(&cache_path).exists() {
            async_fs::remove_file(&cache_path)
                .await
                .map_err(|e| format!("Failed to remove cache file: {}", e))?;
        }

        Ok(())
    }

    /// Clear all cached repositories
    pub async fn clear_all_cache(&self) -> Result<(), String> {
        if Path::new(&self.cache_dir).exists() {
            async_fs::remove_dir_all(&self.cache_dir)
                .await
                .map_err(|e| format!("Failed to remove cache directory: {}", e))?;
        }

        Ok(())
    }
}

/// Tauri command to fetch a repository
#[tauri::command]
pub async fn fetch_repository_command(
    url: String,
    repo_manager: State<'_, RepositoryManager>,
) -> Result<RepositoryResponse, String> {
    match repo_manager.fetch_repository(&url).await {
        Ok(repository) => Ok(RepositoryResponse {
            success: true,
            data: Some(repository),
            error: None,
        }),
        Err(error) => Ok(RepositoryResponse {
            success: false,
            data: None,
            error: Some(error),
        }),
    }
}

/// Tauri command to get cached repositories
#[tauri::command]
pub async fn get_cached_repositories_command(
    repo_manager: State<'_, RepositoryManager>,
) -> Result<Vec<RepositoryInfo>, String> {
    repo_manager.get_cached_repositories().await
}

/// Tauri command to load a specific cached repository
#[tauri::command]
pub async fn load_cached_repository_command(
    repo_id: String,
    repo_manager: State<'_, RepositoryManager>,
) -> Result<ModRepository, String> {
    repo_manager.load_cached_repository(&repo_id).await
}

/// Tauri command to clear repository cache
#[tauri::command]
pub async fn clear_repository_cache_command(
    repo_id: String,
    repo_manager: State<'_, RepositoryManager>,
) -> Result<(), String> {
    repo_manager.clear_repository_cache(&repo_id).await
}

/// Tauri command to clear all cache
#[tauri::command]
pub async fn clear_all_cache_command(
    repo_manager: State<'_, RepositoryManager>,
) -> Result<(), String> {
    repo_manager.clear_all_cache().await
}
