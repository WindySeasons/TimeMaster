import { Input } from '@rneui/themed';
import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Text as RNText,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { Card } from 'react-native-paper';
import QuillEditor from '../components/QuillEditor';
import { AppDataSource, globalCurrentTaskId } from './database';
import { Task } from './entities/Task';

export default function AddTaskPage() {
    const [content, setContent] = useState(initialContent);
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        const fetchTask = async () => {
            if (!globalCurrentTaskId) return;
            try {
                if (!AppDataSource.isInitialized) await AppDataSource.initialize();
                const repo = AppDataSource.getRepository(Task);
                const task = await repo.findOneBy({ id: globalCurrentTaskId });
                if (task) {
                    const now = Math.floor(Date.now() / 1000);
                    const usedSeconds = now - (task.start_time || now);
                    const days = Math.floor(usedSeconds / 86400);
                    const hours = Math.floor((usedSeconds % 86400) / 3600);
                    const minutes = Math.floor((usedSeconds % 3600) / 60);
                    let timeStr = '';
                    if (days > 0) timeStr += `${days}天`;
                    if (hours > 0) timeStr += `${hours}小时`;
                    if (minutes > 0) timeStr += `${minutes}分钟`;
                    if (!timeStr) timeStr = '0分钟';
                    setInputValue(`当前项目：${task.project_name}  ${timeStr}`);
                }
            } catch (e) {
                setInputValue('当前项目');
            }
        };
        fetchTask();
    }, []);

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
                    nestedScrollEnabled={false}
                >

                    <Card>

                        <Input
                            containerStyle={{}}
                            disabledInputStyle={{ backgroundColor: "#fff" }}
                            inputContainerStyle={{ borderBottomWidth: 0, borderWidth: 0, elevation: 0, backgroundColor: 'transparent' }}
                            inputStyle={{ fontSize: 9, lineHeight: 18, paddingVertical: 2, paddingHorizontal: 4, color: '#25292e' }}
                            leftIconContainerStyle={{}}
                            rightIcon={
                                <TouchableOpacity
                                    style={{
                                        paddingHorizontal: 14,
                                        paddingVertical: 6,
                                        borderRadius: 999,
                                        borderWidth: 1.5,
                                        borderColor: '#25292e',
                                        backgroundColor: 'rgba(255,255,255,0.7)',
                                        shadowColor: '#25292e',
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.12,
                                        shadowRadius: 6,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginRight: 2,
                                    }}
                                    activeOpacity={0.7}
                                    onPress={() => { /* 这里可加修改逻辑 */ }}
                                >
                                    <RNText style={{
                                        color: '#25292e',
                                        fontWeight: '600',
                                        fontSize: 15,
                                        fontFamily: 'serif',
                                        letterSpacing: 2,
                                        textShadowColor: '#ffd33d44',
                                        textShadowOffset: { width: 0, height: 1 },
                                        textShadowRadius: 2,
                                    }}>修改</RNText>
                                </TouchableOpacity>
                            }
                            rightIconContainerStyle={{ marginRight: 0 }}
                            value={inputValue}
                            placeholder={undefined}
                            errorMessage={undefined}
                            renderErrorMessage={false}
                            editable={false}
                        />
                        <QuillEditor
                            value={content}
                            onChange={setContent}
                            style={{
                                backgroundColor: '#fff',
                                borderRadius: 8,
                                marginBottom: 16,
                                minHeight: 280,
                            }}
                        />
                    </Card>
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