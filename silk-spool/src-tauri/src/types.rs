use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BepInExStatus {
  pub present: bool,
  pub initialized: bool,
  pub message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GameStatus {
  pub path: Option<String>,
  pub found: bool,
  pub bepinex: BepInExStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Mod {
  pub id: String,
  pub title: String,
  pub description: String,
  pub requirements: Vec<String>,
  pub images: Vec<String>,
  pub downloads: Vec<Download>,
  pub homepage: Option<String>,
  pub authors: Vec<String>,
  pub game_version: String,
  pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Download {
  pub label: String,
  pub url: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModRepository {
  pub repo_id: String,
  pub name: String,
  pub version: u32,
  pub mods: Vec<Mod>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
  pub game_path: Option<String>,
  pub repos: Vec<String>, // URLs of mod repositories
  pub ui: UiConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UiConfig {
  pub dark_mode: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InstallResult {
  pub success: bool,
  pub message: String,
  pub installed_files: Vec<String>,
  #[serde(rename = "modFolderName")]
  pub mod_folder_name: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InstalledMod {
  #[serde(rename = "modId")]
  pub mod_id: String,
  #[serde(rename = "modTitle")]
  pub mod_title: String,
  pub version: String,
  #[serde(rename = "installedAt")]
  pub installed_at: String,
  #[serde(rename = "installedFiles")]
  pub installed_files: Vec<String>,
  #[serde(rename = "gamePath")]
  pub game_path: String,
  #[serde(rename = "downloadUrl")]
  pub download_url: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InstalledModsData {
  pub mods: Vec<InstalledMod>,
  #[serde(rename = "lastUpdated")]
  pub last_updated: String,
}
