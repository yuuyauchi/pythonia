import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { colors, typography, spacing } from '../../constants/theme';
import { installPackages } from '../../lib/pythonRunner';
import { usePackageStore } from '../../store/packageStore';

interface PackageInstallerProps {
  visible: boolean;
  packages: string[];
  onComplete: (success: boolean) => void;
  onCancel?: () => void;
}

export const PackageInstaller: React.FC<PackageInstallerProps> = ({
  visible,
  packages,
  onComplete,
  onCancel,
}) => {
  const [installing, setInstalling] = useState(false);
  const [currentPackage, setCurrentPackage] = useState<string | null>(null);
  const [results, setResults] = useState<
    Array<{ package: string; success: boolean; error?: string }>
  >([]);
  const [error, setError] = useState<string | null>(null);

  const { installedPackages, installingPackages } = usePackageStore();

  useEffect(() => {
    if (visible && packages.length > 0 && !installing) {
      startInstallation();
    }
  }, [visible, packages]);

  const startInstallation = async () => {
    setInstalling(true);
    setError(null);
    setResults([]);

    try {
      const result = await installPackages(packages);
      setResults(result.results);

      if (result.success) {
        // All packages installed successfully
        setTimeout(() => {
          onComplete(true);
        }, 1000);
      } else {
        // Some packages failed
        const failedPackages = result.results
          .filter((r) => !r.success)
          .map((r) => r.package)
          .join(', ');
        setError(`一部のパッケージのインストールに失敗しました: ${failedPackages}`);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(`インストール中にエラーが発生しました: ${errorMsg}`);
      onComplete(false);
    } finally {
      setInstalling(false);
    }
  };

  const handleCancel = () => {
    if (!installing && onCancel) {
      onCancel();
    }
  };

  const getPackageStatus = (packageName: string) => {
    if (installedPackages.has(packageName)) {
      return 'installed';
    }
    if (installingPackages.has(packageName)) {
      return 'installing';
    }
    const result = results.find((r) => r.package === packageName);
    if (result) {
      return result.success ? 'success' : 'error';
    }
    return 'pending';
  };

  const renderPackageItem = (packageName: string) => {
    const status = getPackageStatus(packageName);
    const result = results.find((r) => r.package === packageName);

    return (
      <View key={packageName} style={styles.packageItem}>
        <Text style={styles.packageName}>{packageName}</Text>
        <View style={styles.statusContainer}>
          {status === 'pending' && <Text style={styles.statusPending}>待機中</Text>}
          {status === 'installing' && (
            <>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.statusInstalling}>インストール中...</Text>
            </>
          )}
          {status === 'installed' && <Text style={styles.statusSuccess}>✓ 完了</Text>}
          {status === 'success' && <Text style={styles.statusSuccess}>✓ 完了</Text>}
          {status === 'error' && (
            <Text style={styles.statusError}>✗ 失敗</Text>
          )}
        </View>
        {result?.error && (
          <Text style={styles.errorText}>{result.error}</Text>
        )}
      </View>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>パッケージのインストール</Text>
          <Text style={styles.description}>
            このコンテンツで使用するPythonパッケージをインストールしています
          </Text>

          <View style={styles.packageList}>
            {packages.map((pkg) => renderPackageItem(pkg))}
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorTitle}>⚠️ エラー</Text>
              <Text style={styles.errorMessage}>{error}</Text>
            </View>
          )}

          {!installing && (
            <View style={styles.buttonContainer}>
              {error && onCancel && (
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={handleCancel}
                >
                  <Text style={styles.cancelButtonText}>キャンセル</Text>
                </TouchableOpacity>
              )}
              {!error && (
                <TouchableOpacity
                  style={[styles.button, styles.continueButton]}
                  onPress={() => onComplete(true)}
                >
                  <Text style={styles.continueButtonText}>続ける</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  container: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  packageList: {
    marginBottom: spacing.lg,
  },
  packageItem: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  packageName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statusPending: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  statusInstalling: {
    ...typography.caption,
    color: colors.primary,
    marginLeft: spacing.xs,
  },
  statusSuccess: {
    ...typography.caption,
    color: '#10B981',
    fontWeight: '600',
  },
  statusError: {
    ...typography.caption,
    color: colors.error,
    fontWeight: '600',
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.error,
  },
  errorTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.error,
    marginBottom: spacing.xs,
  },
  errorMessage: {
    ...typography.caption,
    color: colors.error,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.textSecondary,
  },
  cancelButtonText: {
    ...typography.button,
    color: colors.text,
  },
  continueButton: {
    backgroundColor: colors.primary,
  },
  continueButtonText: {
    ...typography.button,
    color: '#FFFFFF',
  },
});
