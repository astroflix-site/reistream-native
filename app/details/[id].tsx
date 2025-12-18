import { useWatchlist } from '@/src/hooks/useWatchlist';
import { getSeriesDetails } from '@/src/services/api';
import { Episode, Series } from '@/src/types/content';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Bookmark, Play, Share2, Star } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const DetailsScreen = () => {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [series, setSeries] = useState<Series | null>(null);
    const [episodes, setEpisodes] = useState<Episode[]>([]);
    const [loading, setLoading] = useState(true);
    const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
    const isBookmarked = series ? isInWatchlist(series._id) : false;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const seriesData = await getSeriesDetails(id as string);
                setSeries(seriesData);
                if (seriesData && seriesData.episodes) {
                    setEpisodes(seriesData.episodes);
                }
            } catch (error) {
                console.error("Error fetching details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-black">
                <ActivityIndicator size="large" color="#FF0000" />
            </View>
        );
    }

    if (!series) return null;

    return (
        <ScrollView className="flex-1 bg-black" showsVerticalScrollIndicator={false}>
            <Stack.Screen options={{
                headerTransparent: true,
                headerTitle: '',
                headerTintColor: '#fff'
            }} />

            {/* Backdrop */}
            <View className="relative h-[300px]">
                <Image
                    source={{ uri: series.backdrop || series.imageURL }}
                    className="w-full h-full"
                    resizeMode="cover"
                />
                <View className="absolute inset-0 bg-black/40" />
            </View>

            {/* Content */}
            <View className="px-4 -mt-20">
                <View className="flex-row items-end">
                    <Image
                        source={{ uri: series.imageURL }}
                        className="w-32 h-48 rounded-lg border-2 border-black"
                        resizeMode="cover"
                    />
                    <View className="flex-1 ml-4 mb-2">
                        <Text className="text-white text-2xl font-bold">{series.title}</Text>
                        <View className="flex-row items-center mt-2">
                            <Star size={16} color="#fbbf24" fill="#fbbf24" />
                            <Text className="text-white ml-1 font-bold">{series.rating || '8.5'}</Text>
                            <Text className="text-gray-400 ml-4">{series.status || 'Ongoing'}</Text>
                        </View>
                    </View>
                </View>

                {/* Buttons */}
                <View className="flex-row mt-6">
                    <TouchableOpacity
                        className="flex-1 bg-red-600 flex-row items-center justify-center py-3 rounded-full"
                        onPress={() => {
                            if (episodes.length > 0) {
                                router.push(`/watch/${episodes[0]._id}`);
                            }
                        }}
                    >
                        <Play size={20} color="white" fill="white" />
                        <Text className="text-white font-bold ml-2">Watch Now</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className={`w-12 h-12 items-center justify-center rounded-full ml-3 ${isBookmarked ? 'bg-red-600' : 'bg-gray-800'}`}
                        onPress={() => {
                            if (series) {
                                if (isBookmarked) removeFromWatchlist(series._id);
                                else addToWatchlist(series);
                            }
                        }}
                    >
                        <Bookmark size={20} color="white" fill={isBookmarked ? "white" : "none"} />
                    </TouchableOpacity>
                    <TouchableOpacity className="bg-gray-800 w-12 h-12 items-center justify-center rounded-full ml-3">
                        <Share2 size={20} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Synopsis */}
                <View className="mt-8">
                    <Text className="text-white text-lg font-bold">Synopsis</Text>
                    <Text className="text-gray-400 mt-2 leading-6">
                        {series.description}
                    </Text>
                </View>

                {/* Info Grid */}
                <View className="flex-row flex-wrap mt-6 py-4 border-y border-gray-900">
                    <View className="w-1/2 mb-4">
                        <Text className="text-gray-500 text-xs uppercase">Release Date</Text>
                        <Text className="text-white font-medium">{series.releaseDate || 'N/A'}</Text>
                    </View>
                    <View className="w-1/2 mb-4">
                        <Text className="text-gray-500 text-xs uppercase">Genre</Text>
                        <Text className="text-white font-medium" numberOfLines={1}>{series.genre || 'Action'}</Text>
                    </View>
                    <View className="w-1/2">
                        <Text className="text-gray-500 text-xs uppercase">Total Episodes</Text>
                        <Text className="text-white font-medium">{series.totalEpisodes || '?'}</Text>
                    </View>
                </View>

                {/* Episodes */}
                <View className="mt-8 mb-10">
                    <Text className="text-white text-lg font-bold mb-4">Episodes</Text>
                    {episodes.map((ep, index) => (
                        <TouchableOpacity
                            key={ep._id}
                            className="flex-row items-center bg-gray-900/50 p-4 rounded-xl mb-3"
                            onPress={() => router.push(`/watch/${ep._id}`)}
                        >
                            <View className="w-10 h-10 bg-gray-800 items-center justify-center rounded-full">
                                <Text className="text-white font-bold">{index + 1}</Text>
                            </View>
                            <View className="flex-1 ml-4">
                                <Text className="text-white font-semibold" numberOfLines={1}>{ep.title || `Episode ${ep.episodeNumber}`}</Text>
                                <Text className="text-gray-500 text-xs">Season {ep.season}</Text>
                            </View>
                            <Play size={16} color="#FF0000" fill="#FF0000" />
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </ScrollView>
    );
};

export default DetailsScreen;
