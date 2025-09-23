mod config;
mod detect;
mod installed_mods;
mod installer;
mod repository;
mod steam;
mod test_repo;
mod types;

#[cfg(test)]
mod tests;

use config::{add_repo, load_config, remove_repo, save_config, update_game_path, AppConfig};
use detect::{get_game_status, validate_game_path, GameStatus};
use installed_mods::{
  add_installed_mod, clear_all_installed_mods, get_all_installed_mods, get_installed_mod,
  get_installed_mods_count, is_mod_installed, load_installed_mods, remove_installed_mod,
  save_installed_mods, update_mod_version,
};
use installer::{install_mod, list_installed_mods, uninstall_mod};
use repository::{
  clear_all_cache_command, clear_repository_cache_command, fetch_repository_command,
  get_cached_repositories_command, load_cached_repository_command, RepositoryManager,
};
use test_repo::test_sample_repository;

use crate::types::{InstallResult, InstalledMod, InstalledModsData};

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
    Err(e) => Err(format!("Repository test failed: {}", e)),
  }
}

/// Install a mod from download URL
#[tauri::command]
async fn install_mod_command(
  download_url: String,
  game_path: String,
  mod_name: String,
) -> Result<InstallResult, String> {
  let game_path = std::path::Path::new(&game_path);
  install_mod(&download_url, game_path, &mod_name).await
}

/// Uninstall a mod
#[tauri::command]
async fn uninstall_mod_command(
  game_path: String,
  mod_name: String,
) -> Result<InstallResult, String> {
  let game_path = std::path::Path::new(&game_path);
  uninstall_mod(game_path, &mod_name)
}

/// List installed mods
#[tauri::command]
async fn list_installed_mods_command(game_path: String) -> Result<Vec<String>, String> {
  let game_path = std::path::Path::new(&game_path);
  list_installed_mods(game_path)
}

/// Get installed mods data
#[tauri::command]
async fn get_installed_mods() -> Result<InstalledModsData, String> {
  load_installed_mods()
}

/// Save installed mods data
#[tauri::command]
async fn save_installed_mods_command(data: InstalledModsData) -> Result<(), String> {
  save_installed_mods(&data)
}

/// Add installed mod
#[tauri::command]
async fn add_installed_mod_command(
  mod_id: String,
  mod_title: String,
  version: String,
  installed_files: Vec<String>,
  game_path: String,
  download_url: Option<String>,
) -> Result<(), String> {
  add_installed_mod(
    mod_id,
    mod_title,
    version,
    installed_files,
    game_path,
    download_url,
  )
}

/// Remove installed mod
#[tauri::command]
async fn remove_installed_mod_command(mod_id: String) -> Result<(), String> {
  remove_installed_mod(&mod_id)
}

/// Get installed mod info
#[tauri::command]
async fn get_installed_mod_command(mod_id: String) -> Result<Option<InstalledMod>, String> {
  get_installed_mod(&mod_id)
}

/// Check if mod is installed
#[tauri::command]
async fn is_mod_installed_command(mod_id: String) -> Result<bool, String> {
  is_mod_installed(&mod_id)
}

/// Get all installed mods
#[tauri::command]
async fn get_all_installed_mods_command() -> Result<Vec<InstalledMod>, String> {
  get_all_installed_mods()
}

/// Update mod version
#[tauri::command]
async fn update_mod_version_command(
  mod_id: String,
  new_version: String,
  new_installed_files: Vec<String>,
) -> Result<(), String> {
  update_mod_version(&mod_id, new_version, new_installed_files)
}

/// Clear all installed mods
#[tauri::command]
async fn clear_all_installed_mods_command() -> Result<(), String> {
  clear_all_installed_mods()
}

/// Get installed mods count
#[tauri::command]
async fn get_installed_mods_count_command() -> Result<usize, String> {
  get_installed_mods_count()
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
        .to_string(),
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
      test_repository_command,
      install_mod_command,
      uninstall_mod_command,
      list_installed_mods_command,
      get_installed_mods,
      save_installed_mods_command,
      add_installed_mod_command,
      remove_installed_mod_command,
      get_installed_mod_command,
      is_mod_installed_command,
      get_all_installed_mods_command,
      update_mod_version_command,
      clear_all_installed_mods_command,
      get_installed_mods_count_command
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
