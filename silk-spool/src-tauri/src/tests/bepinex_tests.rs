#[cfg(test)]
mod bepinex_tests {
    use crate::detect::*;

    #[test]
    fn test_detect_bepinex_windows_no_bepinex() {
        // Test with a path that doesn't have BepInEx
        let game_path = "C:\\NonExistent\\Game";
        let result = detect_bepinex_windows(game_path);
        assert!(result.is_ok());
        
        let status = result.unwrap();
        assert!(!status.present);
        assert!(!status.initialized);
    }

    #[test]
    fn test_detect_bepinex_macos_no_bepinex() {
        // Test with a path that doesn't have BepInEx
        let game_path = "/NonExistent/Game";
        let result = detect_bepinex_macos(game_path);
        assert!(result.is_ok());
        
        let status = result.unwrap();
        assert!(!status.present);
        assert!(!status.initialized);
    }

    #[test]
    fn test_detect_bepinex_command() {
        // Test the main BepInEx detection command
        let result = detect_bepinex_command();
        assert!(result.is_ok());
    }

    #[test]
    fn test_bepinex_status_creation() {
        // Test BepInExStatus struct creation
        let status = BepInExStatus {
            present: false,
            initialized: false,
            message: "Test message".to_string(),
        };
        
        assert!(!status.present);
        assert!(!status.initialized);
        assert_eq!(status.message, "Test message");
    }
}
