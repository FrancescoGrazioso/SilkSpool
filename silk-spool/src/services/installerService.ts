import { invoke } from '@tauri-apps/api/core';
import { InstallResult, Mod } from '../types';
import { notificationService } from './notificationService';
import { installedModsService } from './installedModsService';

export class InstallerService {
  /**
   * Install a mod from a download URL
   */
  static async installMod(
    downloadUrl: string,
    gamePath: string,
    mod: Mod,
    downloadLabel?: string
  ): Promise<InstallResult> {
    // Show initial notification
    const notificationId = notificationService.progress(
      'Installing Mod',
      `Starting installation of ${mod.title}...`,
      0
    );

    try {
      // Update progress to show download starting
      notificationService.updateProgress(notificationId, 10);
      notificationService.updateProgress(notificationId, 25);

      const result = await invoke<InstallResult>('install_mod_command', {
        downloadUrl,
        gamePath,
        modName: mod.title,
      });

      if (result.success) {
        // Update progress to completion
        notificationService.updateProgress(notificationId, 100);

        // Extract version from download label or use game_version as fallback
        let modVersion = mod.game_version; // Default fallback
        if (downloadLabel) {
          // Try to extract version from download label (e.g., "Download v2.0.2" -> "2.0.2")
          const versionMatch = downloadLabel.match(/v?(\d+\.\d+\.\d+)/i);
          if (versionMatch) {
            modVersion = versionMatch[1];
          }
        }

        // Track the installed mod
        await installedModsService.addInstalledMod(
          mod.id,
          mod.title,
          modVersion,
          result.installed_files,
          gamePath,
          downloadUrl
        );

        // Dismiss progress notification and show success
        notificationService.dismiss(notificationId);
        notificationService.success(
          'Installation Complete',
          `Successfully installed ${mod.title}. ${result.message}`,
          5000
        );
      } else {
        // Dismiss progress notification and show error
        notificationService.dismiss(notificationId);
        notificationService.error(
          'Installation Failed',
          `Failed to install ${mod.title}: ${result.message}`
        );
      }

      return result;
    } catch (error) {
      console.error('Failed to install mod:', error);

      // Dismiss progress notification and show error
      notificationService.dismiss(notificationId);
      notificationService.error('Installation Failed', `Failed to install ${mod.title}: ${error}`);

      return {
        success: false,
        message: `Installation failed: ${error}`,
        installed_files: [],
      };
    }
  }

  /**
   * Uninstall a mod
   */
  static async uninstallMod(gamePath: string, mod: Mod): Promise<InstallResult> {
    try {
      // Get the installed mod info to find the folder name
      const installedMod = installedModsService.getInstalledMod(mod.id);
      if (!installedMod) {
        throw new Error('Mod not found in installed mods list');
      }

      // Use the mod title as folder name (same as installation)
      const result = await invoke<InstallResult>('uninstall_mod_command', {
        gamePath,
        modName: mod.title,
      });

      if (result.success) {
        // Remove from installed mods tracking
        await installedModsService.removeInstalledMod(mod.id);

        notificationService.success(
          'Uninstallation Complete',
          `Successfully uninstalled ${mod.title}`,
          3000
        );
      } else {
        notificationService.error(
          'Uninstallation Failed',
          `Failed to uninstall ${mod.title}: ${result.message}`
        );
      }

      return result;
    } catch (error) {
      console.error('Failed to uninstall mod:', error);
      notificationService.error(
        'Uninstallation Failed',
        `Failed to uninstall ${mod.title}: ${error}`
      );
      return {
        success: false,
        message: `Uninstallation failed: ${error}`,
        installed_files: [],
      };
    }
  }

  /**
   * List installed mods
   */
  static async listInstalledMods(gamePath: string): Promise<string[]> {
    try {
      return await invoke<string[]>('list_installed_mods_command', {
        gamePath,
      });
    } catch (error) {
      console.error('Failed to list installed mods:', error);
      return [];
    }
  }

  /**
   * Check if a mod is installed
   */
  static async isModInstalled(gamePath: string, modName: string): Promise<boolean> {
    try {
      const installedMods = await this.listInstalledMods(gamePath);
      return installedMods.includes(modName);
    } catch (error) {
      console.error('Failed to check if mod is installed:', error);
      return false;
    }
  }
}
