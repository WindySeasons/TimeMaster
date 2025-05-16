import { Stack } from 'expo-router';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    View
} from 'react-native';
import QuillEditor from '../components/QuillEditor';

export default function AddTaskPage() {
    const [content, setContent] = useState(initialContent);
    return (
        <>
            <Stack.Screen
                options={{
                    title: '新建卡片',
                    headerStyle: { backgroundColor: '#25292e' },
                    headerTintColor: '#fff',
                }}
            />
            <View style={{ flex: 1, backgroundColor: '#25292e' }}>
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{ padding: 16 }}
                >
                    <QuillEditor
                        value={content}
                        onChange={setContent}
                        style={{
                            backgroundColor: '#fff',
                            borderRadius: 8,
                            marginBottom: 16,
                            minHeight: 200,
                        }}
                    />
                </ScrollView>
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
const initialContent = `<p>This is a basic example!</p>`;