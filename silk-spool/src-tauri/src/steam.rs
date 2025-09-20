use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};
use walkdir::WalkDir;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SteamLibrary {
    pub path: PathBuf,
    pub apps: Vec<SteamApp>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SteamApp {
    pub appid: String,
    pub name: String,
    pub installdir: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GameDetectionResult {
    pub found: bool,
    pub path: Option<PathBuf>,
    pub libraries: Vec<SteamLibrary>,
}

/// Get Steam libraries for Windows
pub fn get_steam_libraries_windows() -> Result<Vec<PathBuf>, String> {
    let steam_path = Path::new("C:\\Program Files (x86)\\Steam");
    let library_folders_path = steam_path.join("steamapps").join("libraryfolders.vdf");
    
    if !library_folders_path.exists() {
        return Err("Steam libraryfolders.vdf not found".to_string());
    }

    let content = std::fs::read_to_string(&library_folders_path)
        .map_err(|e| format!("Failed to read libraryfolders.vdf: {}", e))?;

    let mut libraries = Vec::new();
    
    // Add default Steam library
    libraries.push(steam_path.to_path_buf());

    // Simple VDF parsing - look for "path" entries
    for line in content.lines() {
        if line.contains("\"path\"") {
            // Extract path from line like: "path"		"C:\SteamLibrary"
            if let Some(start) = line.find('"') {
                if let Some(end) = line.rfind('"') {
                    if start != end {
                        let path_str = &line[start+1..end];
                        let path = PathBuf::from(path_str);
                        if path.exists() && !libraries.contains(&path) {
                            libraries.push(path);
                        }
                    }
                }
            }
        }
    }

    Ok(libraries)
}

/// Get Steam libraries for macOS
pub fn get_steam_libraries_macos() -> Result<Vec<PathBuf>, String> {
    let home_dir = dirs::home_dir().ok_or("Could not find home directory")?;
    let steam_path = home_dir.join("Library").join("Application Support").join("Steam");
    let library_folders_path = steam_path.join("steamapps").join("libraryfolders.vdf");
    
    let mut libraries = Vec::new();
    
    // Add default Steam library
    libraries.push(steam_path.clone());

    // Try to read libraryfolders.vdf if it exists
    if library_folders_path.exists() {
        if let Ok(content) = std::fs::read_to_string(&library_folders_path) {
            // Simple VDF parsing - look for "path" entries
            for line in content.lines() {
                if line.contains("\"path\"") {
                    // Extract path from line like: "path"		"/path/to/library"
                    if let Some(start) = line.find('"') {
                        if let Some(end) = line.rfind('"') {
                            if start != end {
                                let path_str = &line[start+1..end];
                                let path = PathBuf::from(path_str);
                                if path.exists() && !libraries.contains(&path) {
                                    libraries.push(path);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    Ok(libraries)
}

/// Get Steam libraries based on the current platform
pub fn get_steam_libraries() -> Result<Vec<PathBuf>, String> {
    #[cfg(target_os = "windows")]
    {
        get_steam_libraries_windows()
    }
    
    #[cfg(target_os = "macos")]
    {
        get_steam_libraries_macos()
    }
    
    #[cfg(not(any(target_os = "windows", target_os = "macos")))]
    {
        Err("Unsupported platform".to_string())
    }
}

/// Find Hollow Knight: Silksong installation in Steam libraries
pub fn find_silksong_installation() -> Result<GameDetectionResult, String> {
    let libraries = get_steam_libraries()?;
    let mut result = GameDetectionResult {
        found: false,
        path: None,
        libraries: Vec::new(),
    };

    // Regex patterns to match Silksong folder names
    let silksong_patterns = [
        r"(?i)silksong",
        r"(?i)hollow.?knight.?silksong",
        r"(?i)hollow knight silksong",
    ];

    for library_path in libraries {
        let steamapps_path = library_path.join("steamapps").join("common");
        
        if !steamapps_path.exists() {
            continue;
        }

        let library = SteamLibrary {
            path: library_path.clone(),
            apps: Vec::new(),
        };

        // Walk through common directory to find game folders
        for entry in WalkDir::new(&steamapps_path).max_depth(1) {
            let entry = entry.map_err(|e| format!("Failed to read directory: {}", e))?;
            
            if entry.file_type().is_dir() {
                let dir_name = entry.file_name().to_string_lossy();
                
                // Check if this directory matches our Silksong patterns
                for pattern in &silksong_patterns {
                    let regex = regex::Regex::new(pattern)
                        .map_err(|e| format!("Invalid regex pattern: {}", e))?;
                    
                    if regex.is_match(&dir_name) {
                        // Check if this is a valid game installation
                        if is_valid_game_installation(entry.path()) {
                            result.found = true;
                            result.path = Some(entry.path().to_path_buf());
                            break;
                        }
                    }
                }
            }
        }

        result.libraries.push(library);
        
        if result.found {
            break;
        }
    }

    Ok(result)
}

/// Check if a directory contains a valid game installation
fn is_valid_game_installation(path: &Path) -> bool {
    #[cfg(target_os = "windows")]
    {
        // Look for .exe files in the directory
        for entry in WalkDir::new(path).max_depth(1) {
            if let Ok(entry) = entry {
                if entry.file_type().is_file() {
                    if let Some(extension) = entry.path().extension() {
                        if extension == "exe" {
                            return true;
                        }
                    }
                }
            }
        }
    }
    
    #[cfg(target_os = "macos")]
    {
        // Look for .app bundles in the directory
        for entry in WalkDir::new(path).max_depth(1) {
            if let Ok(entry) = entry {
                if entry.file_type().is_dir() {
                    if let Some(extension) = entry.path().extension() {
                        if extension == "app" {
                            return true;
                        }
                    }
                }
            }
        }
    }
    
    false
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_silksong_patterns() {
        let patterns = [
            r"(?i)silksong",
            r"(?i)hollow.?knight.?silksong",
            r"(?i)hollow knight silksong",
        ];

        let test_cases = [
            "Hollow Knight Silksong",
            "hollow knight silksong",
            "Silksong",
            "silksong",
            "Hollow Knight: Silksong",
        ];

        for pattern in &patterns {
            let regex = regex::Regex::new(pattern).unwrap();
            for case in &test_cases {
                assert!(regex.is_match(case), "Pattern '{}' should match '{}'", pattern, case);
            }
        }
    }
}
