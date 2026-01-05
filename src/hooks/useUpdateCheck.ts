import axios from 'axios';
import Constants from 'expo-constants';
import { useEffect, useState } from 'react';

interface GitHubRelease {
    tag_name: string;
    html_url: string;
    body: string;
}

interface UpdateCheckResult {
    isUpdateAvailable: boolean;
    latestRelease: GitHubRelease | null;
    loading: boolean;
    checkError: Error | null;
}

const REPO_OWNER = 'astroflix-site';
const REPO_NAME = 'reistream-native';

export const useUpdateCheck = (): UpdateCheckResult => {
    const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
    const [latestRelease, setLatestRelease] = useState<GitHubRelease | null>(null);
    const [loading, setLoading] = useState(true);
    const [checkError, setCheckError] = useState<Error | null>(null);

    useEffect(() => {
        const checkForUpdates = async () => {
            // Skip update check in development to avoid rate limits and annoyance
            if (__DEV__) {
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(
                    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/latest`
                );

                const release = response.data;
                const latestVersion = release.tag_name.replace(/^v/, '');
                const currentVersion = Constants.expoConfig?.version || '1.0.0';
                // console.log(currentVersion)
                // const currentVersion = "0.1.0"
                if (compareVersions(latestVersion, currentVersion) > 0) {
                    setIsUpdateAvailable(true);
                    setLatestRelease(release);
                }
            } catch (error) {
                console.error('Failed to check for updates:', error);
                setCheckError(error as Error);
            } finally {
                setLoading(false);
            }
        };

        checkForUpdates();
    }, []);

    return { isUpdateAvailable, latestRelease, loading, checkError };
};

// Simple semantic version comparison
// Returns 1 if v1 > v2, -1 if v1 < v2, 0 if equal
const compareVersions = (v1: string, v2: string): number => {
    const v1Parts = v1.split('.').map(Number);
    const v2Parts = v2.split('.').map(Number);

    for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
        const p1 = v1Parts[i] || 0;
        const p2 = v2Parts[i] || 0;

        if (p1 > p2) return 1;
        if (p1 < p2) return -1;
    }

    return 0;
};
