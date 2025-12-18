import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/context/AuthContext';
import { router, Link } from 'expo-router';
import { Mail, Lock, User, ArrowLeft } from 'lucide-react-native';

export default function RegisterScreen() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();

    const handleRegister = async () => {
        if (!username || !email || !password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        if (username.length < 6) {
            Alert.alert('Error', 'Username must be at least 6 characters');
            return;
        }

        if (password.length < 8) {
            Alert.alert('Error', 'Password must be at least 8 characters');
            return;
        }

        setLoading(true);
        try {
            await register({ username, email, password });
            Alert.alert('Success', 'Account created successfully! Please log in.', [
                { text: 'OK', onPress: () => router.replace('/(auth)/login') }
            ]);
        } catch (error: any) {
            const message = error.response?.data?.message || 'Registration failed. Please try again.';
            Alert.alert('Registration Failed', message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-black">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="mt-4 w-10 h-10 items-center justify-center bg-gray-900 rounded-full"
                    >
                        <ArrowLeft size={20} color="white" />
                    </TouchableOpacity>

                    <View className="mt-8 mb-8">
                        <Text className="text-white text-4xl font-bold">Create Account</Text>
                        <Text className="text-gray-400 mt-2 text-lg">Join ReiStream to bookmark your favorite anime</Text>
                    </View>

                    <View className="space-y-4">
                        <View className="bg-gray-900/50 rounded-2xl flex-row items-center px-4 py-4 border border-gray-800">
                            <User size={20} color="#9ca3af" />
                            <TextInput
                                className="flex-1 ml-3 text-white text-base"
                                placeholder="Username"
                                placeholderTextColor="#6b7280"
                                value={username}
                                onChangeText={setUsername}
                                autoCapitalize="none"
                            />
                        </View>

                        <View className="bg-gray-900/50 rounded-2xl flex-row items-center px-4 py-4 border border-gray-800 mt-4">
                            <Mail size={20} color="#9ca3af" />
                            <TextInput
                                className="flex-1 ml-3 text-white text-base"
                                placeholder="Email Address"
                                placeholderTextColor="#6b7280"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>

                        <View className="bg-gray-900/50 rounded-2xl flex-row items-center px-4 py-4 border border-gray-800 mt-4">
                            <Lock size={20} color="#9ca3af" />
                            <TextInput
                                className="flex-1 ml-3 text-white text-base"
                                placeholder="Password"
                                placeholderTextColor="#6b7280"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>

                        <View className="bg-gray-900/50 rounded-2xl flex-row items-center px-4 py-4 border border-gray-800 mt-4">
                            <Lock size={20} color="#9ca3af" />
                            <TextInput
                                className="flex-1 ml-3 text-white text-base"
                                placeholder="Confirm Password"
                                placeholderTextColor="#6b7280"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry
                            />
                        </View>

                        <TouchableOpacity
                            onPress={handleRegister}
                            disabled={loading}
                            className={`bg-red-600 py-4 rounded-2xl mt-8 flex-row justify-center items-center ${loading ? 'opacity-70' : ''}`}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white font-bold text-lg">Create Account</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    <View className="flex-row justify-center mt-10 mb-10">
                        <Text className="text-gray-400">Already have an account? </Text>
                        <Link href="/(auth)/login" asChild>
                            <TouchableOpacity>
                                <Text className="text-red-600 font-bold">Sign In</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
