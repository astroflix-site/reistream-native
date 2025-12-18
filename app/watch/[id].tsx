import { getEpisodeDetail, getSeriesDetails } from '@/src/services/api';
import { Episode, Server } from '@/src/types/content';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Info } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';

const WatchScreen = () => {
    const { id, seriesId: paramSeriesId } = useLocalSearchParams();
    const router = useRouter();
    const [episode, setEpisode] = useState<Episode | null>(null);
    const [loading, setLoading] = useState(true);
    const [servers, setServers] = useState<Server[]>([]);
    const [selectedServer, setSelectedServer] = useState<Server | null>(null);
    const [seriesEpisodes, setSeriesEpisodes] = useState<Episode[]>([]);
    const [series, setSeries] = useState<any>(null);

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

    // Get 10 episodes starting from current
    const currentIndex = seriesEpisodes.findIndex(ep => ep._id === episode._id);
    const displayedEpisodes = seriesEpisodes.slice(
        currentIndex >= 0 ? currentIndex : 0,
        currentIndex >= 0 ? currentIndex + 10 : 10
    );

    return (
        <View className="flex-1 bg-black">
            <Stack.Screen options={{
                headerShown: false,
                orientation: 'all' // Support landscape
            }} />

            {/* Video Container with Header Overlay */}
            <View className="relative w-full aspect-video bg-gray-950">
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
                <View className="absolute top-0 left-0 right-0 p-4 pt-8 bg-black/40 flex-row items-center">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 items-center justify-center bg-black/40 rounded-full"
                    >
                        <ChevronLeft size={24} color="white" />
                    </TouchableOpacity>
                    <View className="ml-4 flex-1">
                        <Text className="text-white text-base font-bold truncate" numberOfLines={1}>
                            {episode.title || `Episode ${episode.episodeNumber}`}
                        </Text>
                        <Text className="text-gray-300 text-xs">
                            S{episode.season} • E{episode.episodeNumber}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Content Under Video */}
            <ScrollView className="flex-1 px-4">
                {/* Server Selector */}
                <View className="mt-6">
                    <Text className="text-white text-xs font-bold mb-3 tracking-widest text-gray-500 uppercase">Select Server</Text>
                    <View className="flex-row flex-wrap">
                        {servers.map((server, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => setSelectedServer(server)}
                                className={`mr-2 mb-2 px-4 py-2 rounded-lg border ${selectedServer.url === server.url
                                    ? 'bg-red-600 border-red-600'
                                    : 'bg-gray-900 border-gray-800'
                                    }`}
                            >
                                <Text className={`font-bold text-xs ${selectedServer.url === server.url ? 'text-white' : 'text-gray-400'
                                    }`}>
                                    {server.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Episodes Section - Card Style */}
                <View className="mt-8 mb-10">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-white text-sm font-bold uppercase tracking-wider">Episodes</Text>
                        <Text className="text-gray-500 text-xs">{seriesEpisodes.length} Total</Text>
                    </View>

                    <View className="space-y-3">
                        {displayedEpisodes.map((ep) => (
                            <TouchableOpacity
                                key={ep._id}
                                onPress={() => router.replace(`/watch/${ep._id}?seriesId=${paramSeriesId || episode.seriesId}`)}
                                className={`flex-row items-center p-2 rounded-xl border ${ep._id === episode._id
                                    ? 'bg-red-600/10 border-red-600'
                                    : 'bg-gray-900/50 border-gray-800'
                                    }`}
                            >
                                <View className="relative">
                                    <Image
                                        source={{ uri: series?.imageURL }}
                                        className="w-24 h-14 rounded-lg bg-gray-800"
                                        resizeMode="cover"
                                    />
                                    <View className="absolute bottom-1 right-1 bg-black/60 px-1.5 py-0.5 rounded">
                                        <Text className="text-white text-[10px] font-bold">E{ep.episodeNumber}</Text>
                                    </View>
                                </View>
                                <View className="ml-3 flex-1">
                                    <Text className={`font-bold text-sm truncate ${ep._id === episode._id ? 'text-white' : 'text-gray-300'}`} numberOfLines={1}>
                                        {ep.title || `Episode ${ep.episodeNumber}`}
                                    </Text>
                                    <View className="flex-row items-center mt-1">
                                        <Text className="text-gray-500 text-xs">Season {ep.season}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {seriesEpisodes.length > displayedEpisodes.length + currentIndex && (
                        <TouchableOpacity className="mt-4 items-center py-3">
                            <Text className="text-gray-500 text-xs font-bold uppercase tracking-widest">More episodes below</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

export default WatchScreen;
