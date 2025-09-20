#[cfg(test)]
mod config_tests {
    use crate::config::*;
    use std::collections::HashMap;

    #[test]
    fn test_config_creation() {
        let config = AppConfig {
            game_path: Some("C:\\Games\\Silksong".to_string()),
            repositories: HashMap::new(),
            auto_detect: true,
        };
        
        assert_eq!(config.game_path, Some("C:\\Games\\Silksong".to_string()));
        assert!(config.repositories.is_empty());
        assert!(config.auto_detect);
    }

    #[test]
    fn test_config_default() {
        let config = AppConfig::default();
        
        assert_eq!(config.game_path, None);
        assert!(config.repositories.is_empty());
        assert!(config.auto_detect);
    }

    #[test]
    fn test_save_config() {
        let config = AppConfig::default();
        let result = save_config(&config);
        // This test would require mocking the file system
        // For now, we'll test that the function exists
        assert!(result.is_ok());
    }

    #[test]
    fn test_load_config() {
        let result = load_config();
        // This test would require mocking the file system
        // For now, we'll test that the function exists and returns a config
        assert!(result.is_ok());
    }

    #[test]
    fn test_config_serialization() {
        let config = AppConfig {
            game_path: Some("C:\\Games\\Silksong".to_string()),
            repositories: HashMap::new(),
            auto_detect: true,
        };
        
        // Test that the config can be serialized to JSON
        let json = serde_json::to_string(&config);
        assert!(json.is_ok());
        
        // Test that the JSON can be deserialized back to config
        let json_str = json.unwrap();
        let deserialized: Result<AppConfig, _> = serde_json::from_str(&json_str);
        assert!(deserialized.is_ok());
        
        let deserialized_config = deserialized.unwrap();
        assert_eq!(deserialized_config.game_path, config.game_path);
        assert_eq!(deserialized_config.auto_detect, config.auto_detect);
    }
}
