/// <reference types="vite/client" />

interface DesktopAPI {
  selectDirectory: (options?: { title?: string; defaultPath?: string }) => Promise<string | null>;
  showItemInFolder: (targetPath: string) => Promise<boolean>;
  saveTextFile: (params: { directory: string; filename: string; content: string }) => Promise<{ ok: boolean; path?: string; error?: string }>;
}

interface Window {
  desktop?: DesktopAPI;
}

declare global {
  interface Window {
    desktop?: DesktopAPI;
  }
}

export {};