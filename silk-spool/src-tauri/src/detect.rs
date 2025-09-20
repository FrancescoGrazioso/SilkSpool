use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BepInExStatus {
    pub present: bool,
    pub initialized: bool,
    pub message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GameStatus {
    pub path: Option<PathBuf>,
    pub found: bool,
    pub bepinex: BepInExStatus,
}

/// Detect BepInEx installation for Windows
pub fn detect_bepinex_windows(game_path: &Path) -> BepInExStatus {
    let bepinex_path = game_path.join("BepInEx");
    
    if !bepinex_path.exists() {
        return BepInExStatus {
            present: false,
            initialized: false,
            message: "BepInEx not detected".to_string(),
        };
    }

    // Check for BepInEx loader files
    let winhttp_dll = game_path.join("winhttp.dll");
    let doorstop_config = game_path.join("doorstop_config.ini");
    
    let has_loader = winhttp_dll.exists() || doorstop_config.exists();
    
    if !has_loader {
        return BepInExStatus {
            present: false,
            initialized: false,
            message: "BepInEx folder found but loader not detected".to_string(),
        };
    }

    // Check for log file to determine if initialized
    let log_file = bepinex_path.join("LogOutput.txt");
    let initialized = log_file.exists();

    BepInExStatus {
        present: true,
        initialized,
        message: if initialized {
            "BepInEx detected and initialized".to_string()
        } else {
            "BepInEx detected but not initialized".to_string()
        },
    }
}

/// Detect BepInEx installation for macOS
pub fn detect_bepinex_macos(game_path: &Path) -> BepInExStatus {
    // On macOS, BepInEx is typically installed next to the .app bundle
    let bepinex_path = game_path.join("BepInEx");
    
    if !bepinex_path.exists() {
        return BepInExStatus {
            present: false,
            initialized: false,
            message: "BepInEx not detected".to_string(),
        };
    }

    // Check for log file to determine if initialized
    let log_file = bepinex_path.join("LogOutput.txt");
    let initialized = log_file.exists();

    // Check for run_bepinex.sh script
    let run_script = game_path.join("run_bepinex.sh");
    let has_script = run_script.exists();

    BepInExStatus {
        present: true,
        initialized,
        message: if initialized {
            "BepInEx detected and initialized".to_string()
        } else if has_script {
            "BepInEx detected with run script".to_string()
        } else {
            "BepInEx detected but not initialized".to_string()
        },
    }
}

/// Detect BepInEx installation based on platform
pub fn detect_bepinex(game_path: &Path) -> BepInExStatus {
    #[cfg(target_os = "windows")]
    {
        detect_bepinex_windows(game_path)
    }
    
    #[cfg(target_os = "macos")]
    {
        detect_bepinex_macos(game_path)
    }
    
    #[cfg(not(any(target_os = "windows", target_os = "macos")))]
    {
        BepInExStatus {
            present: false,
            initialized: false,
            message: "Unsupported platform".to_string(),
        }
    }
}

/// Get the current game status by detecting Steam installation and BepInEx
pub fn get_game_status() -> Result<GameStatus, String> {
    use crate::steam::find_silksong_installation;
    
    match find_silksong_installation() {
        Ok(detection_result) => {
            if detection_result.found {
                let game_path = detection_result.path.unwrap();
                let bepinex_status = detect_bepinex(&game_path);
                
                Ok(GameStatus {
                    path: Some(game_path),
                    found: true,
                    bepinex: bepinex_status,
                })
            } else {
                Ok(GameStatus {
                    path: None,
                    found: false,
                    bepinex: BepInExStatus {
                        present: false,
                        initialized: false,
                        message: "Game not found".to_string(),
                    },
                })
            }
        }
        Err(e) => {
            Ok(GameStatus {
                path: None,
                found: false,
                bepinex: BepInExStatus {
                    present: false,
                    initialized: false,
                    message: format!("Detection error: {}", e),
                },
            })
        }
    }
}

/// Validate a manually selected game path
pub fn validate_game_path(path: &Path) -> Result<GameStatus, String> {
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

    let bepinex_status = detect_bepinex(path);
    
    Ok(GameStatus {
        path: Some(path.to_path_buf()),
        found: true,
        bepinex: bepinex_status,
    })
}

/// Check if a directory contains a valid game installation
fn is_valid_game_directory(path: &Path) -> bool {
    #[cfg(target_os = "windows")]
    {
        // Look for .exe files in the directory
        for entry in std::fs::read_dir(path).unwrap_or_else(|_| std::fs::read_dir(".").unwrap()) {
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
    
    #[cfg(target_os = "macos")]
    {
        // Look for .app bundles in the directory
        for entry in std::fs::read_dir(path).unwrap_or_else(|_| std::fs::read_dir(".").unwrap()) {
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
    
    false
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;

    #[test]
    fn test_bepinex_detection() {
        // Create a temporary directory for testing
        let temp_dir = std::env::temp_dir().join("silk_spool_test");
        fs::create_dir_all(&temp_dir).unwrap();
        
        // Test case 1: No BepInEx
        let status = detect_bepinex(&temp_dir);
        assert!(!status.present);
        assert!(!status.initialized);
        
        // Test case 2: BepInEx folder but no loader
        let bepinex_dir = temp_dir.join("BepInEx");
        fs::create_dir_all(&bepinex_dir).unwrap();
        
        let status = detect_bepinex(&temp_dir);
        assert!(!status.present); // Should be false because no loader files
        
        // Cleanup
        fs::remove_dir_all(&temp_dir).unwrap();
    }
}
