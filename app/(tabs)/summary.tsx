import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function SummaryScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Summary screen</Text>
        </View>
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