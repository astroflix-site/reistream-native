import AnimeCard from '@/components/AnimeCard';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { getSeries, getSeriesDetails } from '@/src/services/api';
import { Series } from '@/src/types/content';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { Info, Play } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const [allSeries, setAllSeries] = useState<Series[]>([]);
  const [featured, setFeatured] = useState<Series | null>(null);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getSeries();
        setAllSeries(data);
        if (data.length > 0) {
          // Set initial featured
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

  // Fetch full details for featured to get episode IDs
  useEffect(() => {
    if (featured && !featured.episodes) {
      const fetchFeaturedDetails = async () => {
        try {
          const details = await getSeriesDetails(featured._id);
          if (details && details.episodes && details.episodes.length > 0) {
            setFeatured(prev => prev ? ({
              ...prev,
              episodes: details.episodes
            }) : null);
          }
        } catch (error) {
          console.error("Error fetching featured details:", error);
        }
      };
      fetchFeaturedDetails();
    }
  }, [featured?._id]);

  // Sorting logic matching web app
  const popularSeries = useMemo(() => {
    return [...allSeries].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 10);
  }, [allSeries]);

  const latestSeries = useMemo(() => {
    return [...allSeries].sort((a, b) => {
      const dateA = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
      const dateB = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
      return dateB - dateA;
    }).slice(0, 10);
  }, [allSeries]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator size="large" color="#FF0000" />
      </View>
    );
  }

  const handlePlay = () => {
    if (featured && featured.episodes && featured.episodes.length > 0) {
      router.push(`/watch/${featured.episodes[0]._id}`);
    } else if (featured) {
      router.push(`/details/${featured._id}`);
    }
  };

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
          <View className="relative w-full h-[550px]">
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
              className="absolute bottom-0 left-0 right-0 h-3/4 p-6 justify-end"
            >
              <Text className="text-white text-4xl font-bold tracking-tighter mb-2" numberOfLines={2}>
                {featured.title}
              </Text>

              <View className="flex-row items-center space-x-3 mb-4">
                <Text className="text-green-400 font-bold">{featured.rating || '8.5'} Match</Text>
                <Text className="text-gray-300">
                  {featured.releaseDate ? new Date(featured.releaseDate).getFullYear() : 'N/A'}
                </Text>
                <View className="border border-gray-500 px-1.5 py-0.5 rounded">
                  <Text className="text-gray-300 text-[10px] font-bold">HD</Text>
                </View>
              </View>

              <Text className="text-gray-300 text-sm font-medium leading-5 mb-6" numberOfLines={3}>
                {featured.description}
              </Text>

              <View className="flex-row mb-4">
                <TouchableOpacity
                  onPress={handlePlay}
                  className="bg-white px-8 py-3 rounded-md mr-3 flex-row items-center"
                >
                  <Play size={20} color="black" fill="black" />
                  <Text className="text-black font-bold ml-2 text-base">
                    {featured.episodes && featured.episodes.length > 0 ? 'Play Now' : 'View Details'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => router.push(`/details/${featured._id}`)}
                  className="bg-gray-600/50 px-6 py-3 rounded-md flex-row items-center border border-white/10"
                >
                  <Info size={20} color="white" />
                  <Text className="text-white font-bold ml-2 text-base">More Info</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        )}

        {/* Popular Section */}
        <View className="mt-4 px-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-white text-xl font-bold">Popular</Text>
            <TouchableOpacity onPress={() => router.push('/explore')}>
              <Text className="text-red-600 text-sm font-semibold">View All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={popularSeries}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item._id.toString()}
            renderItem={({ item }) => <AnimeCard item={item} />}
            contentContainerStyle={{ paddingBottom: 50 }}
          />
        </View>

        {/* Latest Uploads Section */}
        <View className="mt-4 mb-2 px-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-white text-xl font-bold">Latest Uploads</Text>
            <TouchableOpacity onPress={() => router.push('/explore')}>
              <Text className="text-red-600 text-sm font-semibold">View All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={latestSeries}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item._id.toString()}
            renderItem={({ item }) => <AnimeCard item={item} />}
            contentContainerStyle={{ paddingBottom: 50 }}
          />
        </View>
        {/* Bottom safe area padding */}
        <View style={{ height: insets.bottom + 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

