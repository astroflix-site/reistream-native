import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/context/AuthContext';
import { router, Link } from 'expo-router';
import { Mail, Lock, ArrowLeft } from 'lucide-react-native';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            await login(email, password);
            router.replace('/(tabs)/profile');
        } catch (error: any) {
            const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
            Alert.alert('Login Failed', message);
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

                    <View className="mt-12 mb-10">
                        <Text className="text-white text-4xl font-bold">Welcome Back</Text>
                        <Text className="text-gray-400 mt-2 text-lg">Sign in to continue to ReiStream</Text>
                    </View>

                    <View className="space-y-4">
                        <View className="bg-gray-900/50 rounded-2xl flex-row items-center px-4 py-4 border border-gray-800">
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

                        <TouchableOpacity className="items-end mt-2">
                            <Text className="text-red-600 font-medium">Forgot Password?</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleLogin}
                            disabled={loading}
                            className={`bg-red-600 py-4 rounded-2xl mt-8 flex-row justify-center items-center ${loading ? 'opacity-70' : ''}`}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white font-bold text-lg">Sign In</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    <View className="flex-row justify-center mt-auto mb-10">
                        <Text className="text-gray-400">Don't have an account? </Text>
                        <Link href="/(auth)/register" asChild>
                            <TouchableOpacity>
                                <Text className="text-red-600 font-bold">Sign Up</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
