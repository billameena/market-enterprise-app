export const storage = {
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : null;
    } catch {
      return null;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      console.warn(`Failed to save to localStorage: ${key}`);
    }
  },

  remove(key: string): void {
    localStorage.removeItem(key);
  },

  clear(): void {
    localStorage.clear();
  },
};

export const session = {
  get<T>(key: string): T | null {
    try {
      const item = sessionStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : null;
    } catch {
      return null;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch {
      console.warn(`Failed to save to sessionStorage: ${key}`);
    }
  },

  remove(key: string): void {
    sessionStorage.removeItem(key);
  },
};

// Auth token storage keys
export const AUTH_KEYS = {
  ACCESS_TOKEN: 'auth:access_token',
  REFRESH_TOKEN: 'auth:refresh_token',
  USER: 'auth:user',
} as const;
