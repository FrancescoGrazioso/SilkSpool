use std::fs;
use crate::types::{InstalledMod, InstalledModsData};

/// Get the path to the installed mods data file
fn get_installed_mods_path() -> Result<std::path::PathBuf, String> {
    let cache_dir = dirs::cache_dir()
        .ok_or("Failed to get cache directory")?
        .join("silk-spool");
    
    // Create directory if it doesn't exist
    fs::create_dir_all(&cache_dir)
        .map_err(|e| format!("Failed to create cache directory: {}", e))?;
    
    Ok(cache_dir.join("installed_mods.json"))
}

/// Load installed mods from storage
pub fn load_installed_mods() -> Result<InstalledModsData, String> {
    let path = get_installed_mods_path()?;
    
    if !path.exists() {
        return Ok(InstalledModsData {
            mods: Vec::new(),
            last_updated: chrono::Utc::now().to_rfc3339(),
        });
    }
    
    let content = fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read installed mods file: {}", e))?;
    
    let data: InstalledModsData = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse installed mods data: {}", e))?;
    
    Ok(data)
}

/// Save installed mods to storage
pub fn save_installed_mods(data: &InstalledModsData) -> Result<(), String> {
    let path = get_installed_mods_path()?;
    
    let content = serde_json::to_string_pretty(data)
        .map_err(|e| format!("Failed to serialize installed mods data: {}", e))?;
    
    fs::write(&path, content)
        .map_err(|e| format!("Failed to write installed mods file: {}", e))?;
    
    Ok(())
}

/// Add a mod to the installed list
pub fn add_installed_mod(
    mod_id: String,
    mod_title: String,
    version: String,
    installed_files: Vec<String>,
    game_path: String,
    download_url: Option<String>,
) -> Result<(), String> {
    let mut data = load_installed_mods()?;
    
    // Remove existing mod with same ID if present
    data.mods.retain(|mod_| mod_.mod_id != mod_id);
    
    // Add new mod
    let installed_mod = InstalledMod {
        mod_id,
        mod_title,
        version,
        installed_at: chrono::Utc::now().to_rfc3339(),
        installed_files,
        game_path,
        download_url,
    };
    
    data.mods.push(installed_mod);
    data.last_updated = chrono::Utc::now().to_rfc3339();
    
    save_installed_mods(&data)
}

/// Remove a mod from the installed list
pub fn remove_installed_mod(mod_id: &str) -> Result<(), String> {
    let mut data = load_installed_mods()?;
    
    data.mods.retain(|mod_| mod_.mod_id != mod_id);
    data.last_updated = chrono::Utc::now().to_rfc3339();
    
    save_installed_mods(&data)
}

/// Get installed mod info
pub fn get_installed_mod(mod_id: &str) -> Result<Option<InstalledMod>, String> {
    let data = load_installed_mods()?;
    Ok(data.mods.into_iter().find(|mod_| mod_.mod_id == mod_id))
}

/// Check if a mod is installed
pub fn is_mod_installed(mod_id: &str) -> Result<bool, String> {
    let data = load_installed_mods()?;
    Ok(data.mods.iter().any(|mod_| mod_.mod_id == mod_id))
}

/// Get all installed mods
pub fn get_all_installed_mods() -> Result<Vec<InstalledMod>, String> {
    let data = load_installed_mods()?;
    Ok(data.mods)
}

/// Update mod version after reinstallation
pub fn update_mod_version(
    mod_id: &str,
    new_version: String,
    new_installed_files: Vec<String>,
) -> Result<(), String> {
    let mut data = load_installed_mods()?;
    
    if let Some(mod_) = data.mods.iter_mut().find(|mod_| mod_.mod_id == mod_id) {
        mod_.version = new_version;
        mod_.installed_files = new_installed_files;
        mod_.installed_at = chrono::Utc::now().to_rfc3339();
        
        data.last_updated = chrono::Utc::now().to_rfc3339();
        save_installed_mods(&data)
    } else {
        Err(format!("Mod with ID {} not found", mod_id))
    }
}

/// Clear all installed mods (for testing or reset)
pub fn clear_all_installed_mods() -> Result<(), String> {
    let data = InstalledModsData {
        mods: Vec::new(),
        last_updated: chrono::Utc::now().to_rfc3339(),
    };
    
    save_installed_mods(&data)
}

/// Get installed mods count
pub fn get_installed_mods_count() -> Result<usize, String> {
    let data = load_installed_mods()?;
    Ok(data.mods.len())
}
