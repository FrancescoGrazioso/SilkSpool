mod steam;
mod detect;
mod config;
mod repository;
mod types;
mod test_repo;

use detect::{get_game_status, validate_game_path, GameStatus};
use config::{load_config, save_config, add_repo, remove_repo, update_game_path, AppConfig};
use repository::{
    RepositoryManager, 
    fetch_repository_command, 
    get_cached_repositories_command,
    load_cached_repository_command,
    clear_repository_cache_command,
    clear_all_cache_command
};
use test_repo::test_sample_repository;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

/// Detect Steam installation and find Hollow Knight: Silksong
#[tauri::command]
async fn detect_game() -> Result<GameStatus, String> {
    get_game_status()
}

/// Validate a manually selected game path
#[tauri::command]
async fn validate_game_path_command(path: String) -> Result<GameStatus, String> {
    let game_path = std::path::Path::new(&path);
    validate_game_path(game_path)
}

/// Get current configuration
#[tauri::command]
async fn get_config() -> Result<AppConfig, String> {
    load_config()
}

/// Save configuration
#[tauri::command]
async fn save_config_command(config: AppConfig) -> Result<(), String> {
    save_config(&config)
}

/// Add a repository URL
#[tauri::command]
async fn add_repository(url: String) -> Result<(), String> {
    add_repo(url)
}

/// Remove a repository URL
#[tauri::command]
async fn remove_repository(url: String) -> Result<(), String> {
    remove_repo(&url)
}

/// Update the game path
#[tauri::command]
async fn update_game_path_command(path: Option<String>) -> Result<(), String> {
    let game_path = path.map(|p| std::path::PathBuf::from(p));
    update_game_path(game_path)
}

#[tauri::command]
async fn test_repository_command() -> Result<String, String> {
    match test_sample_repository() {
        Ok(_) => Ok("Repository test completed successfully!".to_string()),
        Err(e) => Err(format!("Repository test failed: {}", e))
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(RepositoryManager::new(
            dirs::cache_dir()
                .unwrap_or_else(|| std::env::temp_dir())
                .join("silk-spool")
                .join("repositories")
                .to_string_lossy()
                .to_string()
        ))
        .invoke_handler(tauri::generate_handler![
            greet,
            detect_game,
            validate_game_path_command,
            get_config,
            save_config_command,
            add_repository,
            remove_repository,
            update_game_path_command,
            fetch_repository_command,
            get_cached_repositories_command,
            load_cached_repository_command,
            clear_repository_cache_command,
            clear_all_cache_command,
            test_repository_command
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
