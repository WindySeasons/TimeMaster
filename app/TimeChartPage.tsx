import { Stack } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function TimeChartPage() {
    return (
        <>
            <Stack.Screen options={{ title: '统计' }} />
            <View style={styles.container}>
                <Text style={styles.text}>Time Chart Page</Text>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#25292e',
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        color: '#fff',
    },
});