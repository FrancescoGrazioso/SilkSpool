use std::path::{Path, PathBuf};
use std::fs;
use std::io;
use zip::ZipArchive;
use flate2::read::GzDecoder;
use tar::Archive;
use crate::types::InstallResult;

/// Download a file from URL to a temporary location
pub async fn download_file(url: &str, temp_path: &Path) -> Result<(), String> {
    let response = reqwest::get(url)
        .await
        .map_err(|e| format!("Failed to download file: {}", e))?;
    
    if !response.status().is_success() {
        return Err(format!("Download failed with status: {}", response.status()));
    }
    
    let content_length = response.content_length();
    let mut downloaded: u64 = 0;
    let mut stream = response.bytes_stream();
    let mut file = fs::File::create(temp_path)
        .map_err(|e| format!("Failed to create file: {}", e))?;
    
    use futures_util::StreamExt;
    use std::io::Write;
    
    while let Some(chunk) = stream.next().await {
        let chunk = chunk.map_err(|e| format!("Failed to read chunk: {}", e))?;
        file.write_all(&chunk)
            .map_err(|e| format!("Failed to write chunk: {}", e))?;
        
        downloaded += chunk.len() as u64;
        
        // Log progress if we know the total size
        if let Some(total) = content_length {
            let progress = (downloaded as f64 / total as f64 * 100.0) as u32;
            if progress % 10 == 0 && progress > 0 {
                println!("Download progress: {}%", progress);
            }
        }
    }
    
    Ok(())
}

/// Extract ZIP archive
fn extract_zip(archive_path: &Path, extract_to: &Path) -> Result<Vec<String>, String> {
    let file = fs::File::open(archive_path)
        .map_err(|e| format!("Failed to open ZIP file: {}", e))?;
    
    let mut archive = ZipArchive::new(file)
        .map_err(|e| format!("Failed to read ZIP archive: {}", e))?;
    
    let mut extracted_files = Vec::new();
    
    for i in 0..archive.len() {
        let mut file = archive.by_index(i)
            .map_err(|e| format!("Failed to read file from ZIP: {}", e))?;
        
        let outpath = extract_to.join(file.name());
        
        // Create parent directories if they don't exist
        if let Some(parent) = outpath.parent() {
            fs::create_dir_all(parent)
                .map_err(|e| format!("Failed to create directory: {}", e))?;
        }
        
        if file.name().ends_with('/') {
            // Directory entry
            fs::create_dir_all(&outpath)
                .map_err(|e| format!("Failed to create directory: {}", e))?;
        } else {
            // File entry
            let mut outfile = fs::File::create(&outpath)
                .map_err(|e| format!("Failed to create file: {}", e))?;
            
            io::copy(&mut file, &mut outfile)
                .map_err(|e| format!("Failed to extract file: {}", e))?;
            
            extracted_files.push(outpath.to_string_lossy().to_string());
        }
    }
    
    Ok(extracted_files)
}

/// Extract TAR.GZ archive
fn extract_tar_gz(archive_path: &Path, extract_to: &Path) -> Result<Vec<String>, String> {
    let file = fs::File::open(archive_path)
        .map_err(|e| format!("Failed to open TAR.GZ file: {}", e))?;
    
    let gz = GzDecoder::new(file);
    let mut archive = Archive::new(gz);
    
    let mut extracted_files = Vec::new();
    
    archive.entries()
        .map_err(|e| format!("Failed to read TAR archive: {}", e))?
        .filter_map(|e| e.ok())
        .try_for_each(|mut entry| -> Result<(), String> {
            let path = entry.path()
                .map_err(|e| format!("Failed to get entry path: {}", e))?;
            
            let outpath = extract_to.join(path);
            
            // Create parent directories if they don't exist
            if let Some(parent) = outpath.parent() {
                fs::create_dir_all(parent)
                    .map_err(|e| format!("Failed to create directory: {}", e))?;
            }
            
            if entry.header().entry_type().is_dir() {
                fs::create_dir_all(&outpath)
                    .map_err(|e| format!("Failed to create directory: {}", e))?;
            } else {
                let mut outfile = fs::File::create(&outpath)
                    .map_err(|e| format!("Failed to create file: {}", e))?;
                
                io::copy(&mut entry, &mut outfile)
                    .map_err(|e| format!("Failed to extract file: {}", e))?;
                
                extracted_files.push(outpath.to_string_lossy().to_string());
            }
            
            Ok(())
        })?;
    
    Ok(extracted_files)
}

/// Find BepInEx plugins directory
fn find_bepinex_plugins_dir(game_path: &Path) -> Result<PathBuf, String> {
    let bepinex_dir = game_path.join("BepInEx");
    let plugins_dir = bepinex_dir.join("plugins");
    
    if !bepinex_dir.exists() {
        return Err("BepInEx not found. Please install BepInEx first.".to_string());
    }
    
    if !plugins_dir.exists() {
        fs::create_dir_all(&plugins_dir)
            .map_err(|e| format!("Failed to create plugins directory: {}", e))?;
    }
    
    Ok(plugins_dir)
}

/// Install a mod from a downloaded archive
pub async fn install_mod(
    download_url: &str,
    game_path: &Path,
    mod_name: &str,
) -> Result<InstallResult, String> {
    // Create temporary directory for extraction
    let temp_dir = std::env::temp_dir().join("silk_spool_install");
    fs::create_dir_all(&temp_dir)
        .map_err(|e| format!("Failed to create temp directory: {}", e))?;
    
    // Determine file extension and create temp file path
    let file_extension = if download_url.contains(".zip") {
        "zip"
    } else if download_url.contains(".tar.gz") || download_url.contains(".tgz") {
        "tar.gz"
    } else {
        "zip" // Default to zip
    };
    
    let temp_file = temp_dir.join(format!("mod.{}", file_extension));
    
    // Download the file
    download_file(download_url, &temp_file).await?;
    
    // Find BepInEx plugins directory
    let plugins_dir = find_bepinex_plugins_dir(game_path)?;
    
    // Create mod-specific directory
    let mod_dir = plugins_dir.join(mod_name);
    if mod_dir.exists() {
        fs::remove_dir_all(&mod_dir)
            .map_err(|e| format!("Failed to remove existing mod directory: {}", e))?;
    }
    fs::create_dir_all(&mod_dir)
        .map_err(|e| format!("Failed to create mod directory: {}", e))?;
    
    // Extract the archive
    let extracted_files = match file_extension {
        "zip" => extract_zip(&temp_file, &mod_dir)?,
        "tar.gz" => extract_tar_gz(&temp_file, &mod_dir)?,
        _ => return Err("Unsupported archive format".to_string()),
    };
    
    // Clean up temporary files
    let _ = fs::remove_file(&temp_file);
    let _ = fs::remove_dir_all(&temp_dir);
    
    Ok(InstallResult {
        success: true,
        message: format!("Successfully installed {} files", extracted_files.len()),
        installed_files: extracted_files,
    })
}

/// Uninstall a mod by removing its directory
pub fn uninstall_mod(game_path: &Path, mod_name: &str) -> Result<InstallResult, String> {
    let plugins_dir = find_bepinex_plugins_dir(game_path)?;
    let mod_dir = plugins_dir.join(mod_name);
    
    if !mod_dir.exists() {
        return Ok(InstallResult {
            success: false,
            message: "Mod not found".to_string(),
            installed_files: vec![],
        });
    }
    
    fs::remove_dir_all(&mod_dir)
        .map_err(|e| format!("Failed to remove mod directory: {}", e))?;
    
    Ok(InstallResult {
        success: true,
        message: "Mod uninstalled successfully".to_string(),
        installed_files: vec![],
    })
}

/// List installed mods
pub fn list_installed_mods(game_path: &Path) -> Result<Vec<String>, String> {
    let plugins_dir = find_bepinex_plugins_dir(game_path)?;
    
    let mut mods = Vec::new();
    
    if let Ok(entries) = fs::read_dir(&plugins_dir) {
        for entry in entries {
            if let Ok(entry) = entry {
                if entry.file_type().map(|ft| ft.is_dir()).unwrap_or(false) {
                    if let Some(name) = entry.file_name().to_str() {
                        mods.push(name.to_string());
                    }
                }
            }
        }
    }
    
    Ok(mods)
}
