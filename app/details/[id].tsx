import { useWatchlist } from '@/src/hooks/useWatchlist';
import { getSeriesDetails } from '@/src/services/api';
import { Episode, Series } from '@/src/types/content';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Bookmark, ChevronDown, ChevronLeft, ChevronRight, Play, Star } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const EPISODES_PER_PAGE = 10;

const DetailsScreen = () => {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [series, setSeries] = useState<Series | null>(null);
    const [episodes, setEpisodes] = useState<Episode[]>([]);
    const [loading, setLoading] = useState(true);
    const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
    const isBookmarked = series ? isInWatchlist(series._id) : false;

    // Season and pagination state
    const [selectedSeason, setSelectedSeason] = useState<number>(1);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [showSeasonPicker, setShowSeasonPicker] = useState<boolean>(false);

    // Get unique seasons sorted
    const seasons = useMemo(() => {
        const uniqueSeasons = [...new Set(episodes.map(ep => ep.season))].sort((a, b) => a - b);
        return uniqueSeasons;
    }, [episodes]);

    // Filter episodes by selected season
    const filteredEpisodes = useMemo(() => {
        return episodes
            .filter(ep => ep.season === selectedSeason)
            .sort((a, b) => a.episodeNumber - b.episodeNumber);
    }, [episodes, selectedSeason]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredEpisodes.length / EPISODES_PER_PAGE);
    const paginatedEpisodes = useMemo(() => {
        const startIndex = (currentPage - 1) * EPISODES_PER_PAGE;
        return filteredEpisodes.slice(startIndex, startIndex + EPISODES_PER_PAGE);
    }, [filteredEpisodes, currentPage]);

    // Reset page when season changes
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedSeason]);

    // Set initial season when episodes load
    useEffect(() => {
        if (seasons.length > 0 && !seasons.includes(selectedSeason)) {
            setSelectedSeason(seasons[0]);
        }
    }, [seasons]);

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
                headerTintColor: '#fff',
                headerLeft: () => (
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="ml-4 p-2 bg-black/40 rounded-full"
                    >
                        <ChevronLeft size={24} color="white" />
                    </TouchableOpacity>
                )
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
                                router.push(`/watch/${episodes[0]._id}?seriesId=${series._id}`);
                            }
                        }}
                    >
                        <Play size={20} color="white" fill="white" />
                        <Text className="text-white font-bold ml-2">Watch Now</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className={`w-14 items-center justify-center rounded-full ml-3 ${isBookmarked ? 'bg-red-600' : 'bg-gray-800'}`}
                        onPress={() => {
                            if (series) {
                                if (isBookmarked) removeFromWatchlist(series._id);
                                else addToWatchlist(series);
                            }
                        }}
                    >
                        <Bookmark size={20} color="white" fill={isBookmarked ? "white" : "none"} />
                    </TouchableOpacity>
                </View>

                {/* Synopsis */}
                <View className="mt-8">
                    <Text className="text-white text-lg font-bold">Synopsis</Text>
                    <Text className="text-gray-400 mt-2 leading-6">
                        {series.description ? series.description.replace(/<br\s*\/?>/gi, '\n') : ''}
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

                {/* Episodes Section with Season Dropdown */}
                <View className="mt-8 mb-10">
                    {/* Header with Season Dropdown */}
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-white text-lg font-bold">Episodes</Text>

                        {/* Season Dropdown Toggle */}
                        {seasons.length > 0 && (
                            <TouchableOpacity
                                className="flex-row items-center bg-gray-800 px-4 py-2 rounded-lg"
                                onPress={() => setShowSeasonPicker(true)}
                            >
                                <Text className="text-white font-medium mr-2">Season {selectedSeason}</Text>
                                <ChevronDown size={18} color="white" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Season Picker Modal */}
                    <Modal
                        visible={showSeasonPicker}
                        transparent={true}
                        animationType="fade"
                        onRequestClose={() => setShowSeasonPicker(false)}
                    >
                        <TouchableOpacity
                            className="flex-1 bg-black/70 justify-center items-center"
                            activeOpacity={1}
                            onPress={() => setShowSeasonPicker(false)}
                        >
                            <View className="bg-gray-900 rounded-2xl w-[80%] max-h-[60%] overflow-hidden">
                                <Text className="text-white text-lg font-bold p-4 border-b border-gray-800">
                                    Select Season
                                </Text>
                                <ScrollView className="max-h-80">
                                    {seasons.map((season) => (
                                        <TouchableOpacity
                                            key={season}
                                            className={`px-4 py-3 border-b border-gray-800 ${selectedSeason === season ? 'bg-red-600' : ''
                                                }`}
                                            onPress={() => {
                                                setSelectedSeason(season);
                                                setShowSeasonPicker(false);
                                            }}
                                        >
                                            <Text className={`text-base ${selectedSeason === season ? 'text-white font-bold' : 'text-gray-300'
                                                }`}>
                                                Season {season}
                                            </Text>
                                            <Text className="text-gray-400 text-xs mt-1">
                                                {episodes.filter(ep => ep.season === season).length} Episodes
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        </TouchableOpacity>
                    </Modal>

                    {/* Episode Count Info */}
                    <Text className="text-gray-400 text-sm mb-3">
                        {filteredEpisodes.length} episodes • Page {currentPage} of {totalPages || 1}
                    </Text>

                    {/* Episode List */}
                    <View className="space-y-3">
                        {paginatedEpisodes.map((ep) => (
                            <TouchableOpacity
                                key={ep._id}
                                className="flex-row items-center bg-gray-900 rounded-xl overflow-hidden border border-gray-800"
                                onPress={() => router.push(`/watch/${ep._id}?seriesId=${series._id}`)}
                            >
                                <View className="relative w-32 h-20">
                                    <Image
                                        source={{ uri: series.imageURL || 'https://via.placeholder.com/150' }}
                                        className="w-full h-full"
                                        resizeMode="cover"
                                    />
                                    <View className="absolute inset-0 bg-black/30" />
                                    <View className="absolute bottom-1 right-1 bg-black/80 px-2 py-0.5 rounded text-center">
                                        <Text className="text-white text-[10px] font-bold">EP {ep.episodeNumber}</Text>
                                    </View>
                                </View>
                                <View className="flex-1 p-3 justify-center">
                                    <Text className="text-white font-bold text-base mb-1" numberOfLines={2}>
                                        {ep.title || `Episode ${ep.episodeNumber}`}
                                    </Text>
                                    <Text className="text-gray-400 text-xs">
                                        S{ep.season} E{ep.episodeNumber}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <View className="flex-row items-center justify-center mt-6 space-x-4">
                            <TouchableOpacity
                                className={`flex-row items-center px-4 py-2 rounded-lg ${currentPage === 1 ? 'bg-gray-800 opacity-50' : 'bg-gray-800'
                                    }`}
                                onPress={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft size={18} color="white" />
                                <Text className="text-white ml-1">Prev</Text>
                            </TouchableOpacity>

                            <View className="flex-row items-center px-4">
                                <Text className="text-white font-bold">{currentPage}</Text>
                                <Text className="text-gray-400 mx-1">/</Text>
                                <Text className="text-gray-400">{totalPages}</Text>
                            </View>

                            <TouchableOpacity
                                className={`flex-row items-center px-4 py-2 rounded-lg ${currentPage === totalPages ? 'bg-gray-800 opacity-50' : 'bg-gray-800'
                                    }`}
                                onPress={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                            >
                                <Text className="text-white mr-1">Next</Text>
                                <ChevronRight size={18} color="white" />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
                {/* Bottom safe area padding */}
                <View style={{ height: insets.bottom + 20 }} />
            </View>
        </ScrollView>
    );
};

export default DetailsScreen;
