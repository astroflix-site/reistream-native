import AnimeCard from '@/components/AnimeCard';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { searchSeries } from '@/src/services/api';
import { Series } from '@/src/types/content';
import { Search as SearchIcon, X, ArrowLeft } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TextInput, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export default function SearchScreen() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Series[]>([]);
    const [loading, setLoading] = useState(false);
    const colorScheme = useColorScheme();

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (query.trim()) {
                setLoading(true);
                try {
                    const data = await searchSeries(query);
                    setResults(data);
                } catch (error) {
                    console.error("Search error:", error);
                } finally {
                    setLoading(false);
                }
            } else {
                setResults([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    return (
        <SafeAreaView
            className="flex-1 px-4 pt-4"
            style={{ backgroundColor: Colors[colorScheme ?? 'dark'].background }}
        >
            {/* Search Header */}
            <View className="flex-row items-center mb-6">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="mr-4 p-2 bg-gray-900 rounded-full"
                >
                    <ArrowLeft size={20} color="white" />
                </TouchableOpacity>
                <View className="flex-1 flex-row items-center bg-gray-900 rounded-full px-4 py-2 border border-gray-800">
                    <SearchIcon size={20} color="#64748b" />
                    <TextInput
                        placeholder="Search for anime..."
                        placeholderTextColor="#64748b"
                        className="flex-1 ml-3 text-white h-10"
                        value={query}
                        onChangeText={setQuery}
                        autoFocus
                    />
                    {query.length > 0 && (
                        <X size={20} color="#64748b" onPress={() => setQuery('')} />
                    )}
                </View>
            </View>

            {/* Results */}
            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator color="#FF0000" />
                </View>
            ) : (
                <FlatList
                    data={results}
                    numColumns={2}
                    keyExtractor={(item) => item._id.toString()}
                    renderItem={({ item }) => (
                        <View className="w-1/2 p-2">
                            <AnimeCard item={item} width={160} />
                        </View>
                    )}
                    ListEmptyComponent={
                        query.length > 0 ? (
                            <View className="flex-1 items-center mt-20">
                                <Text className="text-gray-500">No results found for "{query}"</Text>
                            </View>
                        ) : (
                            <View className="flex-1 items-center mt-20">
                                <Text className="text-gray-500">Search for your favorite anime</Text>
                            </View>
                        )
                    }
                    className="mt-4"
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
}
