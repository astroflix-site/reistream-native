import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { Series } from '../src/types/content';

interface AnimeCardProps {
    item: Series;
    width?: number;
}

const AnimeCard = ({ item, width = 150 }: AnimeCardProps) => {
    const router = useRouter();

    return (
        <TouchableOpacity
            onPress={() => router.push(`/details/${item._id}`)}
            className="mr-4"
            style={{ width }}
        >
            <View className="relative">
                <Image
                    source={{ uri: item.imageURL }}
                    className="rounded-lg aspect-[2/3]"
                    style={{ width }}
                    resizeMode="cover"
                />
                <View className="absolute top-2 right-2 bg-red-600 px-2 py-1 rounded">
                    <Text className="text-white text-xs font-bold leading-none">
                        {item.rating || '8.5'}
                    </Text>
                </View>
            </View>
            <Text
                className="text-white mt-1 font-semibold"
                numberOfLines={1}
            >
                {item.title}
            </Text>
            <Text className="text-gray-400 text-xs">{item.genre?.split(',')[0] || 'Anime'}</Text>
        </TouchableOpacity>
    );
};

export default AnimeCard;
