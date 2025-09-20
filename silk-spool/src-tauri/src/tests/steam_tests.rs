#[cfg(test)]
mod steam_tests {
    use crate::steam::*;

    #[test]
    fn test_parse_libraryfolders_vdf_basic() {
        let vdf_content = r#"
"LibraryFolders"
{
    "TimeNextStatsReport"        "1234567890"
    "ContentStatsID"        "-1234567890123456789"
    "1"        "C:\\SteamLibrary"
    "2"        "D:\\Games\\Steam"
}
"#;

        let result = parse_libraryfolders_vdf(vdf_content);
        assert!(result.is_ok());
        
        let paths = result.unwrap();
        assert_eq!(paths.len(), 2);
        assert!(paths.contains(&"C:\\SteamLibrary".to_string()));
        assert!(paths.contains(&"D:\\Games\\Steam".to_string()));
    }

    #[test]
    fn test_parse_libraryfolders_vdf_empty() {
        let vdf_content = r#"
"LibraryFolders"
{
    "TimeNextStatsReport"        "1234567890"
    "ContentStatsID"        "-1234567890123456789"
}
"#;

        let result = parse_libraryfolders_vdf(vdf_content);
        assert!(result.is_ok());
        
        let paths = result.unwrap();
        assert_eq!(paths.len(), 0);
    }

    #[test]
    fn test_parse_libraryfolders_vdf_invalid_format() {
        let vdf_content = "invalid vdf content";
        let result = parse_libraryfolders_vdf(vdf_content);
        assert!(result.is_err());
    }

    #[test]
    fn test_get_steam_libraries_windows() {
        // This test would require mocking the file system
        // For now, we'll test the function exists and handles errors gracefully
        let result = get_steam_libraries_windows();
        // The result should be a Vec<String>, even if empty
        assert!(result.is_ok());
    }

    #[test]
    fn test_get_steam_libraries_macos() {
        // This test would require mocking the file system
        // For now, we'll test the function exists and handles errors gracefully
        let result = get_steam_libraries_macos();
        // The result should be a Vec<String>, even if empty
        assert!(result.is_ok());
    }
}
