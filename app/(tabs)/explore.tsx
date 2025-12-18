import AnimeCard from '@/components/AnimeCard';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { getSeries } from '@/src/services/api';
import { Series } from '@/src/types/content';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ExploreScreen() {
    const [allSeries, setAllSeries] = useState<Series[]>([]);
    const [loading, setLoading] = useState(true);
    const colorScheme = useColorScheme();

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
                data={allSeries}
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
                        <Text className="text-white text-2xl font-bold">Discover Anime</Text>
                        <Text className="text-gray-500 text-sm">Explore our entire collection</Text>
                    </View>
                )}
            />
        </SafeAreaView>
    );
}
