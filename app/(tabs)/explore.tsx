import AnimeCard from '@/components/AnimeCard';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { getSeries } from '@/src/services/api';
import { Series } from '@/src/types/content';
import { ChevronDown, ChevronLeft, ChevronRight, Filter, Search, SortAsc, X } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const ITEMS_PER_PAGE = 20;

export default function ExploreScreen() {
    const [allSeries, setAllSeries] = useState<Series[]>([]);
    const [loading, setLoading] = useState(true);
    const colorScheme = useColorScheme();
    const insets = useSafeAreaInsets();

    // Filters and Pagination State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('All');
    const [sortBy, setSortBy] = useState('newest');
    const [currentPage, setCurrentPage] = useState(1);

    // UI State
    const [showGenrePicker, setShowGenrePicker] = useState(false);
    const [showSortPicker, setShowSortPicker] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getSeries();
                setAllSeries(data);
            } catch (error) {
                console.error("Error fetching series:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Extract unique genres
    const genres = useMemo(() => {
        const allGenres = allSeries.flatMap(s =>
            s.genre ? s.genre.split(',').map(g => g.trim()) : []
        );
        return ['All', ...new Set(allGenres)].sort();
    }, [allSeries]);

    // Filter and Sort logic
    const filteredSeries = useMemo(() => {
        let result = [...allSeries];

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(s => s.title.toLowerCase().includes(query));
        }

        // Genre filter
        if (selectedGenre !== 'All') {
            result = result.filter(s => {
                const sGenres = s.genre ? s.genre.split(',').map(g => g.trim()) : [];
                return sGenres.includes(selectedGenre);
            });
        }

        // Sorting
        switch (sortBy) {
            case 'a-z':
                result.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'z-a':
                result.sort((a, b) => b.title.localeCompare(a.title));
                break;
            case 'rating':
                result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            case 'newest':
            default:
                // Assuming original order is newest
                break;
        }

        return result;
    }, [allSeries, searchQuery, selectedGenre, sortBy]);

    // Pagination logic
    const totalPages = Math.ceil(filteredSeries.length / ITEMS_PER_PAGE);
    const paginatedSeries = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredSeries.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredSeries, currentPage]);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedGenre, sortBy]);

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-black">
                <ActivityIndicator size="large" color="#FF0000" />
            </View>
        );
    }

    const SortOptions = [
        { label: 'Newest', value: 'newest' },
        { label: 'Top Rated', value: 'rating' },
        { label: 'A-Z', value: 'a-z' },
        { label: 'Z-A', value: 'z-a' },
    ];

    return (
        <SafeAreaView
            className="flex-1"
            style={{ backgroundColor: Colors[colorScheme ?? 'dark'].background }}
        >
            <View className="flex-1 px-4">
                {/* Header */}
                <View className="mt-16 mb-6">
                    <Text className="text-white text-3xl font-extrabold tracking-tight">Explore</Text>
                    <Text className="text-gray-400 text-base mt-1">Discover your next favorite anime</Text>
                </View>

                {/* Filters Row */}
                <View className="space-y-4 mb-6">
                    {/* Search Bar */}
                    <View className="flex-row items-center bg-gray-900 rounded-xl px-4 py-2 border border-gray-800">
                        <Search size={20} color="#64748b" />
                        <TextInput
                            placeholder="Search anime..."
                            placeholderTextColor="#64748b"
                            className="flex-1 ml-3 text-white h-10"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <X size={20} color="#64748b" />
                            </TouchableOpacity>
                        )}
                    </View>

                    <View className="flex-row space-x-3">
                        {/* Genre Filter */}
                        <TouchableOpacity
                            onPress={() => setShowGenrePicker(true)}
                            className="flex-1 flex-row items-center justify-between bg-gray-900 px-4 py-3 rounded-xl border border-gray-800"
                        >
                            <View className="flex-row items-center">
                                <Filter size={16} color="#64748b" className="mr-2" />
                                <Text className="text-white font-medium ml-2" numberOfLines={1}>
                                    {selectedGenre}
                                </Text>
                            </View>
                            <ChevronDown size={16} color="#64748b" />
                        </TouchableOpacity>

                        {/* Sort Filter */}
                        <TouchableOpacity
                            onPress={() => setShowSortPicker(true)}
                            className="flex-1 flex-row items-center justify-between bg-gray-900 px-4 py-3 rounded-xl border border-gray-800"
                        >
                            <View className="flex-row items-center">
                                <SortAsc size={16} color="#64748b" className="mr-2" />
                                <Text className="text-white font-medium ml-2" numberOfLines={1}>
                                    {SortOptions.find(o => o.value === sortBy)?.label}
                                </Text>
                            </View>
                            <ChevronDown size={16} color="#64748b" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Results Info */}
                <Text className="text-gray-500 text-sm mb-4">
                    Showing {filteredSeries.length} results
                </Text>

                {/* Anime Grid */}
                <FlatList
                    data={paginatedSeries}
                    numColumns={3}
                    keyExtractor={(item) => item._id.toString()}
                    renderItem={({ item }) => (
                        <View className="w-1/3 p-1">
                            <AnimeCard item={item} width={110} />
                        </View>
                    )}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={() => (
                        <View className="flex-1 items-center justify-center py-20">
                            <Text className="text-gray-500 text-center">
                                No anime found matching your criteria.
                            </Text>
                        </View>
                    )}
                    ListFooterComponent={() => (
                        totalPages > 1 ? (
                            <View className="flex-row items-center justify-center py-8 mb-10 space-x-4">
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
                        ) : <View className="h-20" />
                    )}
                    contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
                />
            </View>

            {/* Genre Picker Modal */}
            <Modal
                visible={showGenrePicker}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowGenrePicker(false)}
            >
                <TouchableOpacity
                    className="flex-1 bg-black/70 justify-center items-center"
                    activeOpacity={1}
                    onPress={() => setShowGenrePicker(false)}
                >
                    <View className="bg-gray-900 rounded-2xl w-[80%] max-h-[60%] overflow-hidden border border-gray-800">
                        <Text className="text-white text-lg font-bold p-4 border-b border-gray-800">
                            Select Genre
                        </Text>
                        <ScrollView>
                            {genres.map((genre) => (
                                <TouchableOpacity
                                    key={genre}
                                    className={`px-4 py-3 border-b border-gray-800 ${selectedGenre === genre ? 'bg-red-600' : ''
                                        }`}
                                    onPress={() => {
                                        setSelectedGenre(genre);
                                        setShowGenrePicker(false);
                                    }}
                                >
                                    <Text className={`text-base ${selectedGenre === genre ? 'text-white font-bold' : 'text-gray-300'
                                        }`}>
                                        {genre}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Sort Picker Modal */}
            <Modal
                visible={showSortPicker}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowSortPicker(false)}
            >
                <TouchableOpacity
                    className="flex-1 bg-black/70 justify-center items-center"
                    activeOpacity={1}
                    onPress={() => setShowSortPicker(false)}
                >
                    <View className="bg-gray-900 rounded-2xl w-[80%] overflow-hidden border border-gray-800">
                        <Text className="text-white text-lg font-bold p-4 border-b border-gray-800">
                            Sort By
                        </Text>
                        {SortOptions.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                className={`px-4 py-3 border-b border-gray-800 ${sortBy === option.value ? 'bg-red-600' : ''
                                    }`}
                                onPress={() => {
                                    setSortBy(option.value);
                                    setShowSortPicker(false);
                                }}
                            >
                                <Text className={`text-base ${sortBy === option.value ? 'text-white font-bold' : 'text-gray-300'
                                    }`}>
                                    {option.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
}

