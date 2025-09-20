import { Mod } from '../types';
import { FilterOptions } from '../components/AdvancedFilters';

export class SearchService {
  /**
   * Search and filter mods based on query and filters
   */
  static searchMods(
    mods: Mod[],
    query: string,
    filters: FilterOptions
  ): Mod[] {
    let results = [...mods];

    // Apply text search
    if (query.trim()) {
      results = this.performTextSearch(results, query.trim());
    }

    // Apply requirement filters
    if (filters.requirements.length > 0) {
      results = results.filter(mod =>
        filters.requirements.every(req =>
          mod.requirements.some(modReq =>
            modReq.toLowerCase().includes(req.toLowerCase())
          )
        )
      );
    }

    // Apply author filters
    if (filters.authors.length > 0) {
      results = results.filter(mod =>
        filters.authors.some(author =>
          mod.authors.some(modAuthor =>
            modAuthor.toLowerCase().includes(author.toLowerCase())
          )
        )
      );
    }

    // Apply sorting
    results = this.sortMods(results, filters.sortBy, filters.sortOrder);

    return results;
  }

  /**
   * Perform full-text search on mods
   */
  private static performTextSearch(mods: Mod[], query: string): Mod[] {
    const lowercaseQuery = query.toLowerCase();
    
    return mods.filter(mod => {
      // Search in title
      if (mod.title.toLowerCase().includes(lowercaseQuery)) {
        return true;
      }
      
      // Search in description
      if (mod.description.toLowerCase().includes(lowercaseQuery)) {
        return true;
      }
      
      // Search in authors
      if (mod.authors.some(author => author.toLowerCase().includes(lowercaseQuery))) {
        return true;
      }
      
      // Search in requirements
      if (mod.requirements.some(req => req.toLowerCase().includes(lowercaseQuery))) {
        return true;
      }
      
      return false;
    });
  }

  /**
   * Sort mods based on criteria
   */
  private static sortMods(
    mods: Mod[],
    sortBy: 'name' | 'date' | 'relevance',
    sortOrder: 'asc' | 'desc'
  ): Mod[] {
    const sorted = [...mods].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'date':
          comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
          break;
        case 'relevance':
          // For relevance, we could implement a scoring system
          // For now, just use date as relevance
          comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return sorted;
  }

  /**
   * Extract unique requirements from mods
   */
  static getUniqueRequirements(mods: Mod[]): string[] {
    const requirements = new Set<string>();
    
    mods.forEach(mod => {
      mod.requirements.forEach(req => {
        requirements.add(req);
      });
    });
    
    return Array.from(requirements).sort();
  }

  /**
   * Extract unique authors from mods
   */
  static getUniqueAuthors(mods: Mod[]): string[] {
    const authors = new Set<string>();
    
    mods.forEach(mod => {
      mod.authors.forEach(author => {
        authors.add(author);
      });
    });
    
    return Array.from(authors).sort();
  }

  /**
   * Get search suggestions based on mod data
   */
  static getSearchSuggestions(mods: Mod[], query: string, maxSuggestions: number = 5): string[] {
    if (!query.trim() || query.length < 2) {
      return [];
    }
    
    const lowercaseQuery = query.toLowerCase();
    const suggestions = new Set<string>();
    
    mods.forEach(mod => {
      // Add title suggestions
      if (mod.title.toLowerCase().includes(lowercaseQuery)) {
        suggestions.add(mod.title);
      }
      
      // Add author suggestions
      mod.authors.forEach(author => {
        if (author.toLowerCase().includes(lowercaseQuery)) {
          suggestions.add(author);
        }
      });
      
      // Add requirement suggestions
      mod.requirements.forEach(req => {
        if (req.toLowerCase().includes(lowercaseQuery)) {
          suggestions.add(req);
        }
      });
    });
    
    return Array.from(suggestions)
      .slice(0, maxSuggestions)
      .sort((a, b) => {
        // Prioritize exact matches
        const aExact = a.toLowerCase().startsWith(lowercaseQuery);
        const bExact = b.toLowerCase().startsWith(lowercaseQuery);
        
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        
        return a.localeCompare(b);
      });
  }

  /**
   * Highlight search terms in text
   */
  static highlightSearchTerms(text: string, query: string): string {
    if (!query.trim()) {
      return text;
    }
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 text-yellow-900 px-1 rounded">$1</mark>');
  }
}
