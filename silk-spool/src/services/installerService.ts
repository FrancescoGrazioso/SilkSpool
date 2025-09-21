import { invoke } from '@tauri-apps/api/core';
import { InstallResult } from '../types';
import { notificationService } from './notificationService';

export class InstallerService {
  /**
   * Install a mod from a download URL
   */
  static async installMod(
    downloadUrl: string,
    gamePath: string,
    modName: string
  ): Promise<InstallResult> {
    // Show initial notification
    const notificationId = notificationService.progress(
      'Installing Mod',
      `Starting installation of ${modName}...`,
      0
    );

    try {
      // Update progress to show download starting
      notificationService.updateProgress(notificationId, 10);
      notificationService.updateProgress(notificationId, 25);

      const result = await invoke<InstallResult>('install_mod_command', {
        downloadUrl,
        gamePath,
        modName,
      });

      if (result.success) {
        // Update progress to completion
        notificationService.updateProgress(notificationId, 100);
        
        // Dismiss progress notification and show success
        notificationService.dismiss(notificationId);
        notificationService.success(
          'Installation Complete',
          `Successfully installed ${modName}. ${result.message}`,
          5000
        );
      } else {
        // Dismiss progress notification and show error
        notificationService.dismiss(notificationId);
        notificationService.error(
          'Installation Failed',
          `Failed to install ${modName}: ${result.message}`
        );
      }

      return result;
    } catch (error) {
      console.error('Failed to install mod:', error);
      
      // Dismiss progress notification and show error
      notificationService.dismiss(notificationId);
      notificationService.error(
        'Installation Failed',
        `Failed to install ${modName}: ${error}`
      );

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
  static async uninstallMod(
    gamePath: string,
    modName: string
  ): Promise<InstallResult> {
    try {
      const result = await invoke<InstallResult>('uninstall_mod_command', {
        gamePath,
        modName,
      });

      if (result.success) {
        notificationService.success(
          'Uninstallation Complete',
          `Successfully uninstalled ${modName}`,
          3000
        );
      } else {
        notificationService.error(
          'Uninstallation Failed',
          `Failed to uninstall ${modName}: ${result.message}`
        );
      }

      return result;
    } catch (error) {
      console.error('Failed to uninstall mod:', error);
      notificationService.error(
        'Uninstallation Failed',
        `Failed to uninstall ${modName}: ${error}`
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
  static async isModInstalled(
    gamePath: string,
    modName: string
  ): Promise<boolean> {
    try {
      const installedMods = await this.listInstalledMods(gamePath);
      return installedMods.includes(modName);
    } catch (error) {
      console.error('Failed to check if mod is installed:', error);
      return false;
    }
  }
}
