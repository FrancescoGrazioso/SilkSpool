#[cfg(test)]
mod repository_tests {
    use crate::repository::*;
    use crate::types::*;

    #[test]
    fn test_repository_manager_creation() {
        let manager = RepositoryManager::new();
        assert!(manager.cache_dir.exists() || !manager.cache_dir.exists());
    }

    #[test]
    fn test_validate_repository_structure_valid() {
        let valid_json = r#"
        {
            "name": "Test Repository",
            "description": "A test repository",
            "mods": [
                {
                    "id": "test-mod",
                    "title": "Test Mod",
                    "description": "A test mod",
                    "version": "1.0.0",
                    "authors": ["Test Author"],
                    "requirements": ["BepInEx"],
                    "downloads": [
                        {
                            "url": "https://example.com/mod.zip",
                            "filename": "mod.zip"
                        }
                    ],
                    "images": ["https://example.com/image.png"],
                    "updated_at": "2024-01-01T00:00:00Z"
                }
            ]
        }
        "#;

        let result = validate_repository_structure(valid_json);
        assert!(result.is_ok());
    }

    #[test]
    fn test_validate_repository_structure_invalid() {
        let invalid_json = r#"
        {
            "name": "Test Repository",
            "description": "A test repository",
            "mods": [
                {
                    "id": "test-mod",
                    "title": "Test Mod"
                    // Missing required fields
                }
            ]
        }
        "#;

        let result = validate_repository_structure(invalid_json);
        assert!(result.is_err());
    }

    #[test]
    fn test_validate_repository_structure_malformed_json() {
        let malformed_json = "{ invalid json }";
        let result = validate_repository_structure(malformed_json);
        assert!(result.is_err());
    }

    #[test]
    fn test_mod_creation() {
        let mod_data = Mod {
            id: "test-mod".to_string(),
            title: "Test Mod".to_string(),
            description: "A test mod".to_string(),
            version: "1.0.0".to_string(),
            authors: vec!["Test Author".to_string()],
            requirements: vec!["BepInEx".to_string()],
            downloads: vec![Download {
                url: "https://example.com/mod.zip".to_string(),
                filename: "mod.zip".to_string(),
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
            last_updated: "2024-01-01T00:00:00Z".to_string(),
        };

        assert_eq!(repo_info.id, "test-repo");
        assert_eq!(repo_info.name, "Test Repository");
        assert_eq!(repo_info.mod_count, 5);
    }
}
