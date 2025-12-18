import AnimeCard from '@/components/AnimeCard';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useWatchlist } from '@/src/hooks/useWatchlist';
import { BookmarkX } from 'lucide-react-native';
import React from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BookmarkScreen() {
    const { watchlist, loading } = useWatchlist();
    const colorScheme = useColorScheme();

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-black">
                <ActivityIndicator size="large" color="#FF0000" />
            </View>
        );
    }

    return (
        <SafeAreaView
            className="flex-1"
            style={{ backgroundColor: Colors[colorScheme ?? 'dark'].background }}
        >
            <FlatList
                data={watchlist}
                numColumns={3}
                keyExtractor={(item) => item._id.toString()}
                renderItem={({ item }) => (
                    <View className="w-1/3 p-1">
                        <AnimeCard item={item} width={110} />
                    </View>
                )}
                className="px-2 pt-2"
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={() => (
                    <View className="px-2 mb-4">
                        <Text className="text-white text-2xl font-bold">My Watchlist</Text>
                        <Text className="text-gray-500 text-sm">Anime you've saved to watch later</Text>
                    </View>
                )}
                ListEmptyComponent={() => (
                    <View className="flex-1 items-center justify-center mt-32">
                        <BookmarkX size={64} color="#64748b" />
                        <Text className="text-slate-400 mt-4 text-center px-10">
                            Your watchlist is empty. Add some anime to keep track of them!
                        </Text>
                    </View>
                )}
            />
        </SafeAreaView>
    );
}
