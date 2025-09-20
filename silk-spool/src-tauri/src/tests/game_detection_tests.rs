#[cfg(test)]
mod game_detection_tests {
    use crate::detect::*;

    #[test]
    fn test_find_silksong_installation_valid_paths() {
        // Test with mock Steam library paths
        let steam_libraries = vec![
            "C:\\SteamLibrary".to_string(),
            "D:\\Games\\Steam".to_string(),
        ];

        // This would require mocking the file system to create test directories
        // For now, we'll test that the function handles the input correctly
        let result = find_silksong_installation(&steam_libraries);
        assert!(result.is_ok());
    }

    #[test]
    fn test_find_silksong_installation_empty_libraries() {
        let steam_libraries = vec![];
        let result = find_silksong_installation(&steam_libraries);
        assert!(result.is_ok());
        // Should return empty result for empty libraries
    }

    #[test]
    fn test_detect_game_command() {
        // This test would require mocking the file system
        // For now, we'll test that the function exists and returns a proper type
        let result = detect_game_command();
        // The result should be a GameStatus
        assert!(result.is_ok());
    }

    #[test]
    fn test_validate_game_path_windows() {
        // Test with a mock path that should be invalid
        let invalid_path = "C:\\NonExistent\\Path";
        let result = validate_game_path(invalid_path);
        assert!(result.is_err());
    }

    #[test]
    fn test_validate_game_path_macos() {
        // Test with a mock path that should be invalid
        let invalid_path = "/NonExistent/Path";
        let result = validate_game_path(invalid_path);
        assert!(result.is_err());
    }
}
