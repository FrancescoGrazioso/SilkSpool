export interface CachedImage {
  url: string;
  blob: Blob;
  timestamp: number;
  size: number;
}

export class ImageCacheService {
  private static readonly CACHE_KEY = 'silk-spool-image-cache';
  private static readonly MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB
  private static readonly MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days
  private static cache: Map<string, CachedImage> = new Map();

  /**
   * Initialize cache from localStorage
   */
  static initialize(): void {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        this.cache = new Map(parsed);
        this.cleanup();
      }
    } catch (error) {
      console.warn('Failed to initialize image cache:', error);
      this.cache = new Map();
    }
  }

  /**
   * Get cached image or fetch and cache it
   */
  static async getImage(url: string): Promise<string> {
    // Check if image is already cached and not expired
    const cached = this.cache.get(url);
    if (cached && this.isValid(cached)) {
      return URL.createObjectURL(cached.blob);
    }

    try {
      // Fetch image
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const blob = await response.blob();
      const size = blob.size;

      // Check if adding this image would exceed cache limit
      if (this.getTotalCacheSize() + size > this.MAX_CACHE_SIZE) {
        this.evictOldest();
      }

      // Cache the image
      const cachedImage: CachedImage = {
        url,
        blob,
        timestamp: Date.now(),
        size,
      };

      this.cache.set(url, cachedImage);
      this.saveToStorage();

      return URL.createObjectURL(blob);
    } catch (error) {
      console.error(`Failed to fetch image ${url}:`, error);
      throw error;
    }
  }

  /**
   * Preload images for better performance
   */
  static async preloadImages(urls: string[]): Promise<void> {
    const promises = urls.map(url =>
      this.getImage(url).catch(error => {
        console.warn(`Failed to preload image ${url}:`, error);
        return null;
      })
    );

    await Promise.allSettled(promises);
  }

  /**
   * Check if cached image is still valid
   */
  private static isValid(cached: CachedImage): boolean {
    const age = Date.now() - cached.timestamp;
    return age < this.MAX_AGE;
  }

  /**
   * Get total cache size in bytes
   */
  private static getTotalCacheSize(): number {
    let total = 0;
    for (const cached of this.cache.values()) {
      total += cached.size;
    }
    return total;
  }

  /**
   * Remove oldest cached images to make space
   */
  private static evictOldest(): void {
    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

    // Remove oldest 25% of images
    const toRemove = Math.ceil(entries.length * 0.25);
    for (let i = 0; i < toRemove; i++) {
      const [url, cached] = entries[i];
      URL.revokeObjectURL(URL.createObjectURL(cached.blob));
      this.cache.delete(url);
    }
  }

  /**
   * Clean up expired images
   */
  private static cleanup(): void {
    const now = Date.now();
    for (const [url, cached] of this.cache.entries()) {
      if (now - cached.timestamp > this.MAX_AGE) {
        URL.revokeObjectURL(URL.createObjectURL(cached.blob));
        this.cache.delete(url);
      }
    }
    this.saveToStorage();
  }

  /**
   * Save cache to localStorage
   */
  private static saveToStorage(): void {
    try {
      const serializable = Array.from(this.cache.entries());
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(serializable));
    } catch (error) {
      console.warn('Failed to save image cache:', error);
    }
  }

  /**
   * Clear all cached images
   */
  static clearCache(): void {
    for (const cached of this.cache.values()) {
      URL.revokeObjectURL(URL.createObjectURL(cached.blob));
    }
    this.cache.clear();
    localStorage.removeItem(this.CACHE_KEY);
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): {
    count: number;
    size: number;
    maxSize: number;
    usage: number;
  } {
    const count = this.cache.size;
    const size = this.getTotalCacheSize();
    const maxSize = this.MAX_CACHE_SIZE;
    const usage = (size / maxSize) * 100;

    return { count, size, maxSize, usage };
  }

  /**
   * Format bytes to human readable string
   */
  static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
