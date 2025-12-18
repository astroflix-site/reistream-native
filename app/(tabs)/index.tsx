import AnimeCard from '@/components/AnimeCard';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { getSeries } from '@/src/services/api';
import { Series } from '@/src/types/content';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { Play } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const [featured, setFeatured] = useState<Series | null>(null);
  const [allSeries, setAllSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getSeries();
        setAllSeries(data);
        if (data.length > 0) {
          setFeatured(data[0]);
        }
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
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        <Stack.Screen options={{ title: 'Home' }} />

        {/* Hero Section */}
        {featured && (
          <View className="relative w-full h-[500px]">
            <Image
              source={{ uri: featured.backdrop || featured.imageURL }}
              className="w-full h-full"
              resizeMode="cover"
            />
            {/* Top Gradient */}
            <LinearGradient
              colors={['#000000', 'transparent']}
              className="absolute top-0 left-0 right-0 h-32"
            />
            {/* Bottom Gradient Overlay */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)', '#000000']}
              className="absolute bottom-0 left-0 right-0 h-1/2 p-4 justify-end"
            >
              <Text className="text-white text-3xl font-bold">{featured.title}</Text>
              <Text className="text-gray-300 text-sm mt-2 font-medium" numberOfLines={2}>
                {featured.description}
              </Text>
              <View className="flex-row mt-6 mb-4">
                <TouchableOpacity className="bg-red-600 px-8 py-3 rounded-full mr-3 flex-row items-center">
                  <Play size={18} color="white" fill="white" />
                  <Text className="text-white font-bold ml-2">Watch Now</Text>
                </TouchableOpacity>
                <TouchableOpacity className="bg-gray-800/80 px-8 py-3 rounded-full flex-row items-center">
                  <Text className="text-white font-bold">+ Watchlist</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        )}

        {/* Popular Section */}
        <View className="mt-8 px-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-white text-xl font-bold">Popular Anime</Text>
            <Text className="text-red-600 text-sm">View All</Text>
          </View>
          <FlatList
            data={allSeries}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item._id.toString()}
            renderItem={({ item }) => <AnimeCard item={item} />}
          />
        </View>

        {/* Trending Section */}
        <View className="mt-8 px-4 mb-10">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-white text-xl font-bold">Trending Now</Text>
            <Text className="text-red-600 text-sm">View All</Text>
          </View>
          <FlatList
            data={Array.isArray(allSeries) ? [...allSeries].reverse() : []}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item._id.toString()}
            renderItem={({ item }) => <AnimeCard item={item} />}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
