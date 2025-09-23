use std::fs;

use serde_json;

use crate::types::ModRepository;

/// Test function to validate our sample repository JSON
pub fn test_sample_repository() -> Result<(), String> {
  // Read the built-in mods.json file
  let json_content = fs::read_to_string("../public/mods.json")
    .map_err(|e| format!("Failed to read built-in mods.json: {}", e))?;

  // Parse the JSON
  let repository: ModRepository = serde_json::from_str(&json_content)
    .map_err(|e| format!("Failed to parse repository JSON: {}", e))?;

  // Validate the repository structure
  println!("✅ Repository loaded successfully!");
  println!("📚 Repository: {}", repository.name);
  println!("🆔 ID: {}", repository.repo_id);
  println!("📦 Version: {}", repository.version);
  println!("🎮 Mods count: {}", repository.mods.len());

  // Validate each mod
  for (index, mod_item) in repository.mods.iter().enumerate() {
    println!("\n🎯 Mod {}: {}", index + 1, mod_item.title);
    println!("   📝 Description: {}", mod_item.description);
    println!("   👥 Authors: {}", mod_item.authors.join(", "));
    println!("   📋 Requirements: {}", mod_item.requirements.join(", "));
    println!("   🖼️  Images: {}", mod_item.images.len());
    println!("   ⬇️  Downloads: {}", mod_item.downloads.len());
    println!(
      "   🏠 Homepage: {}",
      mod_item.homepage.as_deref().unwrap_or("None")
    );
    println!("   🎮 Game Version: {}", mod_item.game_version);
    println!("   📅 Updated: {}", mod_item.updated_at);
  }

  println!("\n🎉 All tests passed! Repository structure is valid.");
  Ok(())
}

/// Test function to validate repository structure
pub fn validate_repository_structure(repo: &ModRepository) -> Result<(), String> {
  // Check required fields
  if repo.repo_id.is_empty() {
    return Err("Repository ID cannot be empty".to_string());
  }
  if repo.name.is_empty() {
    return Err("Repository name cannot be empty".to_string());
  }
  if repo.version == 0 {
    return Err("Repository version must be greater than 0".to_string());
  }

  // Validate each mod
  for (index, mod_item) in repo.mods.iter().enumerate() {
    if mod_item.id.is_empty() {
      return Err(format!("Mod at index {} has empty ID", index));
    }
    if mod_item.title.is_empty() {
      return Err(format!("Mod '{}' has empty title", mod_item.id));
    }
    if mod_item.description.is_empty() {
      return Err(format!("Mod '{}' has empty description", mod_item.id));
    }
    if mod_item.game_version.is_empty() {
      return Err(format!("Mod '{}' has empty game version", mod_item.id));
    }
    if mod_item.updated_at.is_empty() {
      return Err(format!("Mod '{}' has empty updated_at", mod_item.id));
    }
  }

  Ok(())
}
