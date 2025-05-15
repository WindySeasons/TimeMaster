import { Stack } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function FeelChartPage() {
    return (
        <>
            <Stack.Screen
                options={{
                    title: '体验',
                    headerStyle: {
                        backgroundColor: '#25292e', // 设置与页面背景相同的颜色
                    },
                    headerTintColor: '#fff', // 设置字体为白色
                }}
            />
            <View style={styles.container}>
                <Text style={styles.text}>Feel Chart Page</Text>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#25292e', // 页面背景颜色
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        color: '#fff', // 文本颜色
    },
});