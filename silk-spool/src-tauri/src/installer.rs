use std::{
  fs, io,
  path::{Path, PathBuf},
};

use flate2::read::GzDecoder;
use tar::Archive;
use zip::ZipArchive;

use crate::types::InstallResult;

/// File type detection
#[derive(Debug, Clone, PartialEq)]
enum FileType {
  Zip,
  TarGz,
  Dll,
  Directory,
  Other,
}

/// Download a file from URL to a temporary location
pub async fn download_file(url: &str, temp_path: &Path) -> Result<(), String> {
  let response = reqwest::get(url)
    .await
    .map_err(|e| format!("Failed to download file: {}", e))?;

  if !response.status().is_success() {
    return Err(format!(
      "Download failed with status: {}",
      response.status()
    ));
  }

  let content_length = response.content_length();
  let mut downloaded: u64 = 0;
  let mut stream = response.bytes_stream();
  let mut file =
    fs::File::create(temp_path).map_err(|e| format!("Failed to create file: {}", e))?;

  use std::io::Write;

  use futures_util::StreamExt;

  while let Some(chunk) = stream.next().await {
    let chunk = chunk.map_err(|e| format!("Failed to read chunk: {}", e))?;
    file
      .write_all(&chunk)
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

/// Detect file type based on file content and extension
fn detect_file_type(file_path: &Path) -> Result<FileType, String> {
  // First check if it's a directory
  if file_path.is_dir() {
    return Ok(FileType::Directory);
  }

  // Check file extension
  if let Some(extension) = file_path.extension() {
    if let Some(ext_str) = extension.to_str() {
      match ext_str.to_lowercase().as_str() {
        "dll" => return Ok(FileType::Dll),
        "zip" => return Ok(FileType::Zip),
        "gz" => {
          // Check if it's tar.gz by looking at the filename
          if let Some(file_name) = file_path.file_name() {
            if let Some(name_str) = file_name.to_str() {
              if name_str.contains(".tar.gz") || name_str.contains(".tgz") {
                return Ok(FileType::TarGz);
              }
            }
          }
        }
        _ => {}
      }
    }
  }

  // Try to detect by file content (magic bytes)
  if let Ok(mut file) = fs::File::open(file_path) {
    let mut buffer = [0; 4];
    if let Ok(_) = io::Read::read(&mut file, &mut buffer) {
      // ZIP files start with PK (0x504B)
      if buffer[0] == 0x50 && buffer[1] == 0x4B {
        return Ok(FileType::Zip);
      }
      // GZIP files start with 0x1F8B
      if buffer[0] == 0x1F && buffer[1] == 0x8B {
        return Ok(FileType::TarGz);
      }
    }
  }

  Ok(FileType::Other)
}

/// Copy a single file to destination
fn copy_single_file(source: &Path, dest_dir: &Path, _mod_name: &str) -> Result<Vec<String>, String> {
  let dest_file = dest_dir.join(source.file_name().unwrap());
  
  fs::copy(source, &dest_file)
    .map_err(|e| format!("Failed to copy file: {}", e))?;

  Ok(vec![dest_file.to_string_lossy().to_string()])
}

/// Copy a directory recursively to destination
fn copy_directory(source: &Path, dest_dir: &Path) -> Result<Vec<String>, String> {
  let mut copied_files = Vec::new();
  
  fn copy_recursive(
    source: &Path,
    dest: &Path,
    copied_files: &mut Vec<String>,
  ) -> Result<(), String> {
    if source.is_dir() {
      fs::create_dir_all(dest).map_err(|e| format!("Failed to create directory: {}", e))?;
      
      for entry in fs::read_dir(source)
        .map_err(|e| format!("Failed to read directory: {}", e))?
      {
        let entry = entry.map_err(|e| format!("Failed to read directory entry: {}", e))?;
        let source_path = entry.path();
        let dest_path = dest.join(entry.file_name());
        
        if source_path.is_dir() {
          copy_recursive(&source_path, &dest_path, copied_files)?;
        } else {
          fs::copy(&source_path, &dest_path)
            .map_err(|e| format!("Failed to copy file: {}", e))?;
          copied_files.push(dest_path.to_string_lossy().to_string());
        }
      }
    } else {
      fs::copy(source, dest).map_err(|e| format!("Failed to copy file: {}", e))?;
      copied_files.push(dest.to_string_lossy().to_string());
    }
    
    Ok(())
  }
  
  copy_recursive(source, dest_dir, &mut copied_files)?;
  Ok(copied_files)
}

/// Extract ZIP archive
fn extract_zip(archive_path: &Path, extract_to: &Path) -> Result<Vec<String>, String> {
  let file = fs::File::open(archive_path).map_err(|e| format!("Failed to open ZIP file: {}", e))?;

  let mut archive =
    ZipArchive::new(file).map_err(|e| format!("Failed to read ZIP archive: {}", e))?;

  let mut extracted_files = Vec::new();

  for i in 0..archive.len() {
    let mut file = archive
      .by_index(i)
      .map_err(|e| format!("Failed to read file from ZIP: {}", e))?;

    let outpath = extract_to.join(file.name());

    // Create parent directories if they don't exist
    if let Some(parent) = outpath.parent() {
      fs::create_dir_all(parent).map_err(|e| format!("Failed to create directory: {}", e))?;
    }

    if file.name().ends_with('/') {
      // Directory entry
      fs::create_dir_all(&outpath).map_err(|e| format!("Failed to create directory: {}", e))?;
    } else {
      // File entry
      let mut outfile =
        fs::File::create(&outpath).map_err(|e| format!("Failed to create file: {}", e))?;

      io::copy(&mut file, &mut outfile).map_err(|e| format!("Failed to extract file: {}", e))?;

      extracted_files.push(outpath.to_string_lossy().to_string());
    }
  }

  Ok(extracted_files)
}

/// Extract TAR.GZ archive
fn extract_tar_gz(archive_path: &Path, extract_to: &Path) -> Result<Vec<String>, String> {
  let file =
    fs::File::open(archive_path).map_err(|e| format!("Failed to open TAR.GZ file: {}", e))?;

  let gz = GzDecoder::new(file);
  let mut archive = Archive::new(gz);

  let mut extracted_files = Vec::new();

  archive
    .entries()
    .map_err(|e| format!("Failed to read TAR archive: {}", e))?
    .filter_map(|e| e.ok())
    .try_for_each(|mut entry| -> Result<(), String> {
      let path = entry
        .path()
        .map_err(|e| format!("Failed to get entry path: {}", e))?;

      let outpath = extract_to.join(path);

      // Create parent directories if they don't exist
      if let Some(parent) = outpath.parent() {
        fs::create_dir_all(parent).map_err(|e| format!("Failed to create directory: {}", e))?;
      }

      if entry.header().entry_type().is_dir() {
        fs::create_dir_all(&outpath).map_err(|e| format!("Failed to create directory: {}", e))?;
      } else {
        let mut outfile =
          fs::File::create(&outpath).map_err(|e| format!("Failed to create file: {}", e))?;

        io::copy(&mut entry, &mut outfile).map_err(|e| format!("Failed to extract file: {}", e))?;

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

/// Install a mod from a downloaded file
pub async fn install_mod(
  download_url: &str,
  game_path: &Path,
  mod_name: &str,
) -> Result<InstallResult, String> {
  // Create temporary directory for download
  let temp_dir = std::env::temp_dir().join("silk_spool_install");
  fs::create_dir_all(&temp_dir).map_err(|e| format!("Failed to create temp directory: {}", e))?;

  // Determine file extension from URL for initial naming
  let file_extension = if download_url.contains(".zip") {
    "zip"
  } else if download_url.contains(".tar.gz") || download_url.contains(".tgz") {
    "tar.gz"
  } else if download_url.contains(".dll") {
    "dll"
  } else {
    "bin" // Generic binary file
  };

  let temp_file = temp_dir.join(format!("mod.{}", file_extension));

  // Download the file
  download_file(download_url, &temp_file).await?;

  // Detect the actual file type after download
  let file_type = detect_file_type(&temp_file)?;

  // Find BepInEx plugins directory
  let plugins_dir = find_bepinex_plugins_dir(game_path)?;

  // Create mod-specific directory
  let mod_dir = plugins_dir.join(mod_name);
  if mod_dir.exists() {
    fs::remove_dir_all(&mod_dir)
      .map_err(|e| format!("Failed to remove existing mod directory: {}", e))?;
  }
  fs::create_dir_all(&mod_dir).map_err(|e| format!("Failed to create mod directory: {}", e))?;

  // Process the file based on its detected type
  let installed_files = match file_type {
    FileType::Zip => {
      // Extract ZIP archive
      extract_zip(&temp_file, &mod_dir)?
    }
    FileType::TarGz => {
      // Extract TAR.GZ archive
      extract_tar_gz(&temp_file, &mod_dir)?
    }
    FileType::Dll => {
      // Copy DLL file directly to plugins directory (not in subfolder)
      let dest_file = plugins_dir.join(temp_file.file_name().unwrap());
      fs::copy(&temp_file, &dest_file)
        .map_err(|e| format!("Failed to copy DLL file: {}", e))?;
      vec![dest_file.to_string_lossy().to_string()]
    }
    FileType::Directory => {
      // Copy directory contents
      copy_directory(&temp_file, &mod_dir)?
    }
    FileType::Other => {
      // For other file types, copy to mod directory
      copy_single_file(&temp_file, &mod_dir, mod_name)?
    }
  };

  // Clean up temporary files
  let _ = fs::remove_file(&temp_file);
  let _ = fs::remove_dir_all(&temp_dir);

  let message = match file_type {
    FileType::Zip | FileType::TarGz => format!("Successfully extracted and installed {} files", installed_files.len()),
    FileType::Dll => "Successfully installed DLL plugin".to_string(),
    FileType::Directory => format!("Successfully copied directory with {} files", installed_files.len()),
    FileType::Other => format!("Successfully installed {} files", installed_files.len()),
  };

  Ok(InstallResult {
    success: true,
    message,
    installed_files,
    mod_folder_name: Some(mod_name.to_string()),
  })
}

/// Uninstall a mod by removing its directory or files
pub fn uninstall_mod(game_path: &Path, mod_name: &str) -> Result<InstallResult, String> {
  let plugins_dir = find_bepinex_plugins_dir(game_path)?;
  let mod_dir = plugins_dir.join(mod_name);

  // Check if it's a directory-based mod
  if mod_dir.exists() {
    fs::remove_dir_all(&mod_dir).map_err(|e| format!("Failed to remove mod directory: {}", e))?;
    
    return Ok(InstallResult {
      success: true,
      message: "Mod uninstalled successfully".to_string(),
      installed_files: vec![],
      mod_folder_name: Some(mod_name.to_string()),
    });
  }

  // Check if it's a single DLL file (look for DLL files that might match the mod name)
  let dll_file = plugins_dir.join(format!("{}.dll", mod_name));
  if dll_file.exists() {
    fs::remove_file(&dll_file).map_err(|e| format!("Failed to remove DLL file: {}", e))?;
    
    return Ok(InstallResult {
      success: true,
      message: "DLL mod uninstalled successfully".to_string(),
      installed_files: vec![],
      mod_folder_name: Some(mod_name.to_string()),
    });
  }

  // Mod not found
  Ok(InstallResult {
    success: false,
    message: "Mod not found".to_string(),
    installed_files: vec![],
    mod_folder_name: Some(mod_name.to_string()),
  })
}

/// List installed mods
pub fn list_installed_mods(game_path: &Path) -> Result<Vec<String>, String> {
  let plugins_dir = find_bepinex_plugins_dir(game_path)?;

  let mut mods = Vec::new();

  if let Ok(entries) = fs::read_dir(&plugins_dir) {
    for entry in entries {
      if let Ok(entry) = entry {
        if let Some(name) = entry.file_name().to_str() {
          if entry.file_type().map(|ft| ft.is_dir()).unwrap_or(false) {
            // Directory-based mod
            mods.push(name.to_string());
          } else if name.ends_with(".dll") {
            // Single DLL file mod (remove .dll extension for consistency)
            let mod_name = name.trim_end_matches(".dll");
            mods.push(mod_name.to_string());
          }
        }
      }
    }
  }

  Ok(mods)
}
