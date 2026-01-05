import React from 'react';
import { Linking, Modal, Text, TouchableOpacity, View } from 'react-native';

interface UpdateModalProps {
    visible: boolean;
    releaseData: {
        tag_name: string;
        html_url: string;
        body: string;
    } | null;
    onClose: () => void;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({ visible, releaseData, onClose }) => {
    if (!releaseData) return null;

    const handleUpdate = () => {
        Linking.openURL(releaseData.html_url);
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-center items-center bg-black/50 px-4">
                <View className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
                    <View className="p-6">
                        <Text className="text-xl font-bold text-white mb-2 text-center">
                            Update Available 🚀
                        </Text>
                        <Text className="text-zinc-400 text-center mb-6">
                            A new version ({releaseData.tag_name}) of ReiStream is available.
                        </Text>

                        {releaseData.body ? (
                            <View className="bg-zinc-950/50 p-4 rounded-xl mb-6 max-h-40">
                                <Text className="text-zinc-300 text-xs" numberOfLines={5}>
                                    {releaseData.body}
                                </Text>
                            </View>
                        ) : null}

                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                onPress={onClose}
                                className="flex-1 py-3 rounded-xl bg-zinc-800 items-center justify-center"
                            >
                                <Text className="text-zinc-300 font-medium">Later</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleUpdate}
                                className="flex-1 py-3 rounded-xl bg-primary items-center justify-center bg-red-600"
                            >
                                <Text className="text-white font-bold">Update Now</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
};
