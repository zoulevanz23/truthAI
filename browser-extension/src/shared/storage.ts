// Shared storage utility for the browser extension
// Stores API key, user preferences, and analysis history

const STORAGE_KEY = 'truthcheck-ai-storage';

export interface StorageData {
  apiKey?: string;
  lastAnalysis?: {
    timestamp: number;
    verdict: string;
    confidence: number;
  };
  preferences: {
    showSafetyIndicator: boolean;
    autoAnalyzeLinks: boolean;
  };
}

export const storage = {
  // Get stored data
  get: async (): Promise<StorageData> => {
    return new Promise((resolve) => {
      chrome.storage.local.get(STORAGE_KEY, (result) => {
        resolve result[STORAGE_KEY] || {
          preferences: {
            showSafetyIndicator: true,
            autoAnalyzeLinks: false,
          },
        };
      });
    });
  },

  // Save data
  set: async (data: Partial<StorageData>): Promise<void> => {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [STORAGE_KEY]: data }, resolve);
    });
  },

  // Update specific fields
  update: async (data: Partial<StorageData>): Promise<void> => {
    return new Promise((resolve) => {
      chrome.storage.local.get(STORAGE_KEY, (current) => {
        const merged = { ...current[STORAGE_KEY], ...data };
        chrome.storage.local.set({ [STORAGE_KEY]: merged }, resolve);
      });
    });
  },
};

export default storage;