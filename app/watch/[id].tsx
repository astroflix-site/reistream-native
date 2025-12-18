import { getEpisodeDetail } from '@/src/services/api';
import { Episode, Server } from '@/src/types/content';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Info } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';

const WatchScreen = () => {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [episode, setEpisode] = useState<Episode | null>(null);
    const [loading, setLoading] = useState(true);
    const [servers, setServers] = useState<Server[]>([]);
    const [selectedServer, setSelectedServer] = useState<Server | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getEpisodeDetail(id as string);
                setEpisode(data);

                if (data && data.servers) {
                    setServers(data.servers);
                    if (data.servers.length > 0) {
                        setSelectedServer(data.servers[0]);
                    }
                }
            } catch (error) {
                console.error("Error fetching episode details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-black">
                <ActivityIndicator size="large" color="#E11D48" />
            </View>
        );
    }

    if (!episode || !selectedServer) return null;

    return (
        <View className="flex-1 bg-black">
            <Stack.Screen options={{
                headerShown: false,
                orientation: 'all' // Support landscape
            }} />

            {/* Video Container */}
            <View className="w-full aspect-video bg-gray-950">
                <WebView
                    source={{ uri: selectedServer.url }}
                    className="flex-1"
                    allowsFullscreenVideo
                    javaScriptEnabled
                    domStorageEnabled
                    startInLoadingState
                    renderLoading={() => (
                        <View className="absolute inset-0 items-center justify-center bg-gray-950">
                            <ActivityIndicator color="#FF0000" />
                        </View>
                    )}
                />
            </View>

            {/* Controls & Info */}
            <ScrollView className="flex-1 px-4 mt-4">
                <View className="flex-row items-center justify-between">
                    <TouchableOpacity onPress={() => router.back()} className="flex-row items-center">
                        <ChevronLeft size={24} color="white" />
                        <Text className="text-white font-bold text-lg ml-2">Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Info size={24} color="#999999" />
                    </TouchableOpacity>
                </View>

                <View className="mt-6">
                    <Text className="text-white text-xl font-bold">{episode.title || `Episode ${episode.episodeNumber}`}</Text>
                    <Text className="text-gray-400 mt-1">Season {episode.season} • Episode {episode.episodeNumber}</Text>
                </View>

                {/* Server Selector */}
                <View className="mt-8">
                    <Text className="text-gray-400 text-xs uppercase font-bold mb-3 tracking-widest">Select Server</Text>
                    <View className="flex-row flex-wrap">
                        {servers.map((server, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => setSelectedServer(server)}
                                className={`mr-3 mb-3 px-6 py-2 rounded-full border ${selectedServer.url === server.url
                                    ? 'bg-red-600 border-red-600'
                                    : 'bg-transparent border-gray-700'
                                    }`}
                            >
                                <Text className={`font-bold ${selectedServer.url === server.url ? 'text-white' : 'text-gray-400'
                                    }`}>
                                    {server.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View className="mt-8 p-4 bg-gray-900/50 rounded-xl border border-gray-800">
                    <Text className="text-gray-300 text-sm italic">
                        Note: If the video doesn't play, please try switching servers. Some servers might be blocked by your network or have outdated components.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
};

export default WatchScreen;
