import { create } from 'zustand';

export interface PackageInfo {
  name: string;
  version?: string;
  installedAt?: number;
}

export interface PackageInstallProgress {
  packageName: string;
  status: 'installing' | 'success' | 'error';
  progress?: number;
  error?: string;
}

interface PackageState {
  // Installed packages
  installedPackages: Map<string, PackageInfo>;

  // Currently installing packages
  installingPackages: Map<string, PackageInstallProgress>;

  // Actions
  markPackageAsInstalled: (packageName: string, version?: string) => void;
  markPackageAsInstalling: (packageName: string) => void;
  markPackageInstallError: (packageName: string, error: string) => void;
  updateInstallProgress: (packageName: string, progress: number) => void;
  isPackageInstalled: (packageName: string) => boolean;
  isPackageInstalling: (packageName: string) => boolean;
  getInstalledPackages: () => string[];
  clearInstallingPackage: (packageName: string) => void;
  reset: () => void;
}

export const usePackageStore = create<PackageState>((set, get) => ({
  installedPackages: new Map(),
  installingPackages: new Map(),

  markPackageAsInstalled: (packageName: string, version?: string) => {
    set((state) => {
      const newInstalled = new Map(state.installedPackages);
      newInstalled.set(packageName, {
        name: packageName,
        version,
        installedAt: Date.now(),
      });

      const newInstalling = new Map(state.installingPackages);
      newInstalling.delete(packageName);

      return {
        installedPackages: newInstalled,
        installingPackages: newInstalling,
      };
    });
  },

  markPackageAsInstalling: (packageName: string) => {
    set((state) => {
      const newInstalling = new Map(state.installingPackages);
      newInstalling.set(packageName, {
        packageName,
        status: 'installing',
        progress: 0,
      });

      return {
        installingPackages: newInstalling,
      };
    });
  },

  markPackageInstallError: (packageName: string, error: string) => {
    set((state) => {
      const newInstalling = new Map(state.installingPackages);
      newInstalling.set(packageName, {
        packageName,
        status: 'error',
        error,
      });

      return {
        installingPackages: newInstalling,
      };
    });
  },

  updateInstallProgress: (packageName: string, progress: number) => {
    set((state) => {
      const newInstalling = new Map(state.installingPackages);
      const current = newInstalling.get(packageName);
      if (current) {
        newInstalling.set(packageName, {
          ...current,
          progress,
        });
      }

      return {
        installingPackages: newInstalling,
      };
    });
  },

  isPackageInstalled: (packageName: string) => {
    return get().installedPackages.has(packageName);
  },

  isPackageInstalling: (packageName: string) => {
    return get().installingPackages.has(packageName);
  },

  getInstalledPackages: () => {
    return Array.from(get().installedPackages.keys());
  },

  clearInstallingPackage: (packageName: string) => {
    set((state) => {
      const newInstalling = new Map(state.installingPackages);
      newInstalling.delete(packageName);

      return {
        installingPackages: newInstalling,
      };
    });
  },

  reset: () => {
    set({
      installedPackages: new Map(),
      installingPackages: new Map(),
    });
  },
}));
