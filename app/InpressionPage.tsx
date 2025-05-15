import { Stack } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function InpressionPage() {
    return (<>
        <Stack.Screen options={{ title: '感悟' }} />
        <View style={styles.container}>
            <Text style={styles.text}>Inpression Page</Text>
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