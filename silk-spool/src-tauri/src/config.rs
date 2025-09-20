use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};
use std::fs;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    pub game_path: Option<PathBuf>,
    pub repos: Vec<String>,
    pub ui: UiConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UiConfig {
    pub theme: String,
    pub window_size: WindowSize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WindowSize {
    pub width: u32,
    pub height: u32,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            game_path: None,
            repos: Vec::new(),
            ui: UiConfig {
                theme: "dark".to_string(),
                window_size: WindowSize {
                    width: 1200,
                    height: 800,
                },
            },
        }
    }
}

/// Get the application data directory
pub fn get_app_data_dir() -> Result<PathBuf, String> {
    dirs::data_dir()
        .ok_or("Could not find data directory".to_string())
        .map(|dir| dir.join("silk-spool"))
}

/// Get the configuration file path
pub fn get_config_path() -> Result<PathBuf, String> {
    let app_dir = get_app_data_dir()?;
    Ok(app_dir.join("config.json"))
}

/// Load configuration from file
pub fn load_config() -> Result<AppConfig, String> {
    let config_path = get_config_path()?;
    
    if !config_path.exists() {
        // Return default config if file doesn't exist
        return Ok(AppConfig::default());
    }

    let content = fs::read_to_string(&config_path)
        .map_err(|e| format!("Failed to read config file: {}", e))?;

    let config: AppConfig = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse config file: {}", e))?;

    Ok(config)
}

/// Save configuration to file
pub fn save_config(config: &AppConfig) -> Result<(), String> {
    let config_path = get_config_path()?;
    let app_dir = config_path.parent().unwrap();
    
    // Create app directory if it doesn't exist
    fs::create_dir_all(app_dir)
        .map_err(|e| format!("Failed to create app directory: {}", e))?;

    let content = serde_json::to_string_pretty(config)
        .map_err(|e| format!("Failed to serialize config: {}", e))?;

    fs::write(&config_path, content)
        .map_err(|e| format!("Failed to write config file: {}", e))?;

    Ok(())
}

/// Validate a game path
pub fn validate_game_path(path: &Path) -> Result<(), String> {
    if !path.exists() {
        return Err("Path does not exist".to_string());
    }

    if !path.is_dir() {
        return Err("Path is not a directory".to_string());
    }

    // Check if this looks like a valid game installation
    let is_valid = is_valid_game_directory(path);
    
    if !is_valid {
        return Err("Directory does not appear to contain a valid game installation".to_string());
    }

    Ok(())
}

/// Check if a directory contains a valid game installation
fn is_valid_game_directory(path: &Path) -> bool {
    #[cfg(target_os = "windows")]
    {
        // Look for .exe files in the directory
        if let Ok(entries) = fs::read_dir(path) {
            for entry in entries {
                if let Ok(entry) = entry {
                    if entry.file_type().map(|ft| ft.is_file()).unwrap_or(false) {
                        if let Some(extension) = entry.path().extension() {
                            if extension == "exe" {
                                return true;
                            }
                        }
                    }
                }
            }
        }
    }
    
    #[cfg(target_os = "macos")]
    {
        // Look for .app bundles in the directory
        if let Ok(entries) = fs::read_dir(path) {
            for entry in entries {
                if let Ok(entry) = entry {
                    if entry.file_type().map(|ft| ft.is_dir()).unwrap_or(false) {
                        if let Some(extension) = entry.path().extension() {
                            if extension == "app" {
                                return true;
                            }
                        }
                    }
                }
            }
        }
    }
    
    false
}

/// Add a repository URL to the configuration
pub fn add_repo(url: String) -> Result<(), String> {
    let mut config = load_config()?;
    
    if !config.repos.contains(&url) {
        config.repos.push(url);
        save_config(&config)?;
    }
    
    Ok(())
}

/// Remove a repository URL from the configuration
pub fn remove_repo(url: &str) -> Result<(), String> {
    let mut config = load_config()?;
    
    config.repos.retain(|repo| repo != url);
    save_config(&config)?;
    
    Ok(())
}

/// Update the game path in the configuration
pub fn update_game_path(path: Option<PathBuf>) -> Result<(), String> {
    let mut config = load_config()?;
    
    if let Some(ref game_path) = path {
        validate_game_path(game_path)?;
    }
    
    config.game_path = path;
    save_config(&config)?;
    
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;

    #[test]
    fn test_config_serialization() {
        let config = AppConfig::default();
        let json = serde_json::to_string(&config).unwrap();
        let deserialized: AppConfig = serde_json::from_str(&json).unwrap();
        
        assert_eq!(config.game_path, deserialized.game_path);
        assert_eq!(config.repos, deserialized.repos);
        assert_eq!(config.ui.theme, deserialized.ui.theme);
    }

    #[test]
    fn test_repo_management() {
        // Create a temporary config for testing
        let temp_dir = std::env::temp_dir().join("silk_spool_config_test");
        fs::create_dir_all(&temp_dir).unwrap();
        
        // This would require mocking the app data directory
        // For now, just test the logic
        let mut config = AppConfig::default();
        
        // Test adding repos
        config.repos.push("https://example.com/repo1".to_string());
        config.repos.push("https://example.com/repo2".to_string());
        
        assert_eq!(config.repos.len(), 2);
        
        // Test removing repos
        config.repos.retain(|repo| repo != "https://example.com/repo1");
        assert_eq!(config.repos.len(), 1);
        assert_eq!(config.repos[0], "https://example.com/repo2");
        
        // Cleanup
        fs::remove_dir_all(&temp_dir).unwrap();
    }
}
