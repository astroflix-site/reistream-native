import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { router } from 'expo-router';
import { Bell, ChevronRight, Info, LogIn, LogOut, Settings, User as UserIcon, UserPlus, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../src/context/AuthContext';
import { updateProfile } from '../../src/services/api';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const { user, logout, refreshUser } = useAuth();
  const insets = useSafeAreaInsets();
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editUsername, setEditUsername] = useState(user?.username || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const MenuItem = ({ icon: Icon, title, value, onPress }: any) => (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-between p-4 bg-gray-900/50 mb-2 rounded-2xl border border-gray-900"
    >
      <View className="flex-row items-center">
        <View className="w-10 h-10 bg-gray-800 items-center justify-center rounded-xl mr-4">
          <Icon size={20} color="#FF0000" />
        </View>
        <Text className="text-white font-medium">{title}</Text>
      </View>
      <View className="flex-row items-center">
        {value && <Text className="text-gray-500 mr-2">{value}</Text>}
        <ChevronRight size={18} color="#999999" />
      </View>
    </TouchableOpacity>
  );

  const handleLogout = async () => {
    await logout();
    router.replace('/(tabs)');
  };

  const handleUpdateProfile = async () => {
    if (!editUsername || !editEmail) {
      Alert.alert('Error', 'Username and Email are required');
      return;
    }

    setIsUpdating(true);
    try {
      await updateProfile({ username: editUsername, email: editEmail });
      if (refreshUser) await refreshUser();
      setEditModalVisible(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
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
        <View className="items-center mt-10 mb-8 px-6">
          <View className="relative">
            <Image
              source={{ uri: user ? `https://ui-avatars.com/api/?name=${user.username}&background=random&color=fff&size=200` : 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }}
              className="w-24 h-24 rounded-full border-2 border-red-600"
            />
            {user && (
              <TouchableOpacity
                onPress={() => setEditModalVisible(true)}
                className="absolute bottom-0 right-0 bg-red-600 p-2 rounded-full border-2 border-black"
              >
                <Settings size={14} color="white" />
              </TouchableOpacity>
            )}
          </View>

          {user ? (
            <>
              <Text className="text-white text-2xl font-bold mt-4">{user.username}</Text>
              <Text className="text-gray-400 text-sm">{user.email}</Text>
            </>
          ) : (
            <>
              <Text className="text-white text-2xl font-bold mt-4">Welcome, Guest</Text>
              <Text className="text-gray-400 text-sm text-center mt-2">Sign in to save your watchlist and sync across devices</Text>

              <View className="flex-row w-full space-x-4 mt-6">
                <TouchableOpacity
                  onPress={() => router.push('/(auth)/login')}
                  className="flex-1 bg-red-600 py-3 rounded-xl items-center flex-row justify-center"
                >
                  <LogIn size={18} color="white" />
                  <Text className="text-white font-bold ml-2">Sign In</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => router.push('/(auth)/register')}
                  className="flex-1 bg-gray-900 py-3 rounded-xl items-center flex-row justify-center border border-gray-800"
                >
                  <UserPlus size={18} color="white" />
                  <Text className="text-white font-bold ml-2">Sign Up</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        <View className="px-4">
          <Text className="text-gray-500 text-xs uppercase font-bold mb-3 tracking-widest ml-1">Account</Text>
          <MenuItem
            icon={UserIcon}
            title="Edit Profile"
            onPress={() => user ? setEditModalVisible(true) : router.push('/(auth)/login')}
          />
          <MenuItem icon={Bell} title="Notifications" />

          <Text className="text-gray-500 text-xs uppercase font-bold mt-6 mb-3 tracking-widest ml-1">Settings</Text>
          <MenuItem icon={Settings} title="App Settings" />
          <MenuItem icon={Info} title="Help & Support" />

          {user && (
            <TouchableOpacity
              onPress={handleLogout}
              className="flex-row items-center justify-center p-4 mt-8 bg-red-600/10 rounded-2xl border border-red-600/20"
            >
              <LogOut size={20} color="#FF0000" />
              <Text className="text-red-600 font-bold ml-2">Log Out</Text>
            </TouchableOpacity>
          )}
        </View>
        {/* Bottom safe area padding */}
        <View style={{ height: insets.bottom + 20 }} />
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isEditModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-gray-900 rounded-t-3xl p-6 border-t border-gray-800">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-white text-xl font-bold">Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <X size={24} color="white" />
              </TouchableOpacity>
            </View>

            <View className="space-y-4">
              <View>
                <Text className="text-gray-400 mb-2 ml-1">Username</Text>
                <TextInput
                  className="bg-gray-800 text-white p-4 rounded-xl border border-gray-700"
                  value={editUsername}
                  onChangeText={setEditUsername}
                  placeholder="Enter username"
                  placeholderTextColor="#666"
                />
              </View>

              <View className="mt-4">
                <Text className="text-gray-400 mb-2 ml-1">Email</Text>
                <TextInput
                  className="bg-gray-800 text-white p-4 rounded-xl border border-gray-700"
                  value={editEmail}
                  onChangeText={setEditEmail}
                  placeholder="Enter email"
                  placeholderTextColor="#666"
                  keyboardType="email-address"
                />
              </View>

              <TouchableOpacity
                onPress={handleUpdateProfile}
                disabled={isUpdating}
                className={`bg-red-600 py-4 rounded-xl mt-8 items-center ${isUpdating ? 'opacity-70' : ''}`}
              >
                {isUpdating ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold text-lg">Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
