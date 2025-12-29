// Storage utility with fallback to localStorage

interface StorageResult {
  key: string;
  value: string;
  shared: boolean;
}

interface StorageListResult {
  keys: string[];
  prefix?: string;
  shared: boolean;
}

class StorageManager {
  private useClaudeStorage: boolean;
  private memoryStore: Map<string, string> = new Map();

  constructor() {
    // Check if Claude's storage API is available
    this.useClaudeStorage = typeof window !== 'undefined' && 
                            'storage' in window && 
                            typeof (window as any).storage?.get === 'function';
    
    console.log('Storage mode:', this.useClaudeStorage ? 'Claude Storage' : 'LocalStorage fallback');
  }

  async get(key: string): Promise<StorageResult | null> {
    try {
      if (this.useClaudeStorage) {
        return await (window as any).storage.get(key, false);
      } else {
        // Fallback to localStorage
        const value = localStorage.getItem(key);
        if (value) {
          return { key, value, shared: false };
        }
        return null;
      }
    } catch (err) {
      console.error('Storage get error:', err);
      // Try memory store as last resort
      const value = this.memoryStore.get(key);
      return value ? { key, value, shared: false } : null;
    }
  }

  async set(key: string, value: string): Promise<StorageResult | null> {
    try {
      if (this.useClaudeStorage) {
        return await (window as any).storage.set(key, value, false);
      } else {
        // Fallback to localStorage
        localStorage.setItem(key, value);
        return { key, value, shared: false };
      }
    } catch (err) {
      console.error('Storage set error:', err);
      // If localStorage is full, use memory
      this.memoryStore.set(key, value);
      return { key, value, shared: false };
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      if (this.useClaudeStorage) {
        const result = await (window as any).storage.delete(key, false);
        return result?.deleted ?? false;
      } else {
        localStorage.removeItem(key);
        return true;
      }
    } catch (err) {
      console.error('Storage delete error:', err);
      this.memoryStore.delete(key);
      return true;
    }
  }

  async list(prefix?: string): Promise<StorageListResult | null> {
    try {
      if (this.useClaudeStorage) {
        return await (window as any).storage.list(prefix, false);
      } else {
        // Fallback to localStorage
        const keys: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (!prefix || key.startsWith(prefix))) {
            keys.push(key);
          }
        }
        return { keys, prefix, shared: false };
      }
    } catch (err) {
      console.error('Storage list error:', err);
      // Try memory store
      const keys = Array.from(this.memoryStore.keys()).filter(
        key => !prefix || key.startsWith(prefix)
      );
      return { keys, prefix, shared: false };
    }
  }
}

export const storage = new StorageManager();
