#[cfg(test)]
mod basic_tests {
  use crate::{
    repository::{RepositoryInfo, RepositoryResponse},
    types::*,
  };

  #[test]
  fn test_mod_struct_creation() {
    let mod_data = Mod {
      id: "test-mod".to_string(),
      title: "Test Mod".to_string(),
      description: "A test mod".to_string(),
      homepage: Some("https://example.com".to_string()),
      game_version: "1.0.0".to_string(),
      authors: vec!["Test Author".to_string()],
      requirements: vec!["BepInEx".to_string()],
      downloads: vec![Download {
        url: "https://example.com/mod.zip".to_string(),
        label: "Download".to_string(),
      }],
      images: vec!["https://example.com/image.png".to_string()],
      updated_at: "2024-01-01T00:00:00Z".to_string(),
    };

    assert_eq!(mod_data.id, "test-mod");
    assert_eq!(mod_data.title, "Test Mod");
    assert_eq!(mod_data.authors.len(), 1);
    assert_eq!(mod_data.requirements.len(), 1);
    assert_eq!(mod_data.downloads.len(), 1);
    assert_eq!(mod_data.images.len(), 1);
  }

  #[test]
  fn test_repository_info_creation() {
    let repo_info = RepositoryInfo {
      id: "test-repo".to_string(),
      name: "Test Repository".to_string(),
      url: "https://example.com/repo.json".to_string(),
      mod_count: 5,
      version: 1,
      last_updated: Some("2024-01-01T00:00:00Z".to_string()),
    };

    assert_eq!(repo_info.id, "test-repo");
    assert_eq!(repo_info.name, "Test Repository");
    assert_eq!(repo_info.mod_count, 5);
    assert_eq!(repo_info.version, 1);
  }

  #[test]
  fn test_repository_response_creation() {
    let response = RepositoryResponse {
      success: true,
      data: None,
      error: None,
    };

    assert!(response.success);
    assert!(response.data.is_none());
  }

  #[test]
  fn test_download_struct_creation() {
    let download = Download {
      url: "https://example.com/mod.zip".to_string(),
      label: "Download Mod".to_string(),
    };

    assert_eq!(download.url, "https://example.com/mod.zip");
    assert_eq!(download.label, "Download Mod");
  }
}
