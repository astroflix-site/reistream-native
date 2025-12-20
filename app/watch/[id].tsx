import { getEpisodeDetail, getSeriesDetails } from '@/src/services/api';
import { Episode, Server } from '@/src/types/content';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Info } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

const WatchScreen = () => {
    const { id, seriesId: paramSeriesId } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [episode, setEpisode] = useState<Episode | null>(null);
    const [loading, setLoading] = useState(true);
    const [servers, setServers] = useState<Server[]>([]);
    const [selectedServer, setSelectedServer] = useState<Server | null>(null);
    const [seriesEpisodes, setSeriesEpisodes] = useState<Episode[]>([]);
    const [series, setSeries] = useState<any>(null);
    const [isServerDropdownOpen, setIsServerDropdownOpen] = useState(false);

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

                if (data) {
                    const seriesIdToFetch = (data.seriesId || paramSeriesId || id) as string;
                    try {
                        const seriesData = await getSeriesDetails(seriesIdToFetch);
                        setSeries(seriesData);
                        if (seriesData && seriesData.episodes) {
                            setSeriesEpisodes(seriesData.episodes);
                        }
                    } catch (error) {
                        console.error("Error fetching series details:", error);
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

    // Get episodes window (6-7 items)
    const currentIndex = seriesEpisodes.findIndex(ep => ep._id === episode._id);
    const windowSize = 7;
    const start = Math.max(0, currentIndex - Math.floor(windowSize / 2));
    const displayedEpisodes = seriesEpisodes.slice(start, start + windowSize);

    return (
        <View className="flex-1 bg-black">
            <Stack.Screen options={{
                headerShown: false,
                orientation: 'all'
            }} />

            {/* Video Container with Header Overlay */}
            <View className="relative w-full h-64 mt-12 bg-gray-950">
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

                {/* Absolute Header Overlay */}
                <View className="absolute top-0 left-0 right-0 p-4 flex-row items-center bg-gradient-to-b from-black/60 to-transparent">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 items-center justify-center bg-black/40 rounded-full"
                    >
                        <ChevronLeft size={24} color="white" />
                    </TouchableOpacity>
                    <View className="ml-4 flex-1">
                        <Text className="text-white text-base font-bold truncate shadow-lg" numberOfLines={1}>
                            {episode.title || `Episode ${episode.episodeNumber}`}
                        </Text>
                        <Text className="text-gray-200 text-xs shadow-lg">
                            S{episode.season} • E{episode.episodeNumber}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Content Under Video */}
            <ScrollView className="flex-1 px-4 mt-4">
                {/* Server Selector Dropdown */}
                <View className="mb-6">
                    <TouchableOpacity
                        onPress={() => setIsServerDropdownOpen(!isServerDropdownOpen)}
                        className="flex-row items-center justify-between bg-gray-900 border border-gray-800 p-4 rounded-xl"
                    >
                        <View>
                            <Text className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">Current Server</Text>
                            <Text className="text-white font-bold">{selectedServer.name}</Text>
                        </View>
                        <ChevronLeft size={20} color="white" style={{ transform: [{ rotate: isServerDropdownOpen ? '-90deg' : '-90deg' }] }} />
                    </TouchableOpacity>

                    {isServerDropdownOpen && (
                        <View className="mt-2 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                            {servers.map((server, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => {
                                        setSelectedServer(server);
                                        setIsServerDropdownOpen(false);
                                    }}
                                    className={`p-4 border-b border-gray-800 ${selectedServer.url === server.url ? 'bg-red-600/10' : ''}`}
                                >
                                    <Text className={`${selectedServer.url === server.url ? 'text-red-500 font-bold' : 'text-gray-300'}`}>
                                        {server.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    <View className="flex-row items-center mt-3 bg-yellow-500/10 p-3 rounded-lg">
                        <Info size={16} color="#fbbf24" />
                        <Text className="text-yellow-500 text-xs ml-2 flex-1">
                            Note: If current server doesn't work, please switch to another one.
                        </Text>
                    </View>
                </View>

                {/* Episodes Section - Card Style */}
                <View className="mb-10">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-white text-lg font-bold">Episodes</Text>
                        <Text className="text-gray-500 text-sm font-medium">{seriesEpisodes.length} Episodes</Text>
                    </View>

                    <View className="space-y-4">
                        {displayedEpisodes.map((ep) => (
                            <TouchableOpacity
                                key={ep._id}
                                onPress={() => router.replace(`/watch/${ep._id}?seriesId=${paramSeriesId || episode.seriesId}`)}
                                className={`flex-row items-center bg-gray-900 rounded-xl overflow-hidden border ${ep._id === episode._id
                                    ? 'border-red-600'
                                    : 'border-transparent'
                                    }`}
                            >
                                <View className="relative w-32 h-20">
                                    <Image
                                        source={{ uri: series?.imageURL || 'https://via.placeholder.com/150' }}
                                        className="w-full h-full"
                                        resizeMode="cover"
                                    />
                                    <View className="absolute inset-0 bg-black/30" />
                                    <View className="absolute bottom-1 right-1 bg-black/80 px-2 py-0.5 rounded text-center">
                                        <Text className="text-white text-[10px] font-bold">EP {ep.episodeNumber}</Text>
                                    </View>
                                    {ep._id === episode._id && (
                                        <View className="absolute inset-0 items-center justify-center bg-black/40">
                                            <View className="bg-red-600 p-1.5 rounded-full">
                                                <View className="w-2 h-2 bg-white rounded-full" />
                                            </View>
                                        </View>
                                    )}
                                </View>
                                <View className="flex-1 p-3 justify-center">
                                    <Text className={`font-bold text-base mb-1 ${ep._id === episode._id ? 'text-red-500' : 'text-white'}`} numberOfLines={2}>
                                        {ep.title || `Episode ${ep.episodeNumber}`}
                                    </Text>
                                    <Text className="text-gray-400 text-xs">
                                        Season {ep.season}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
                {/* Bottom safe area padding */}
                <View style={{ height: insets.bottom + 20 }} />
            </ScrollView>
        </View>
    );
};

export default WatchScreen;
