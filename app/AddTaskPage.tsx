import { Button, Input } from '@rneui/themed';
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
    const [rating, setRating] = useState(1);

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
                                marginBottom: 2, // 更紧凑
                                minHeight: 400,
                            }}
                        />
                        <Input
                            containerStyle={{ marginTop: 0, marginBottom: 0, paddingHorizontal: 0 }}
                            inputContainerStyle={{ borderBottomWidth: 0, borderWidth: 0, elevation: 0, backgroundColor: 'transparent', paddingHorizontal: 0 }}
                            inputStyle={{ fontSize: 14, color: '#25292e', backgroundColor: '#fff', borderRadius: 0, paddingHorizontal: 0, minHeight: 50, width: '100%' }}
                            placeholder="下一个项目，用/分级，非必填"
                            leftIconContainerStyle={{}}
                            rightIconContainerStyle={{}}
                            errorMessage={undefined}
                            renderErrorMessage={false}
                        />
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginTop: 0,
                                marginBottom: 8,
                                paddingVertical: 8,
                                paddingHorizontal: 12,
                                backgroundColor: 'rgba(120,180,255,0.08)',
                                borderRadius: 0,
                                shadowColor: '#ffd33d',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.10,
                                shadowRadius: 8,
                                gap: 6,
                            }}
                        >
                            <RNText style={{ color: '#25292e', fontSize: 10, fontWeight: 'bold', marginRight: 8, fontFamily: 'serif', letterSpacing: 1 }}>你享受这段时间吗：</RNText>
                            {[1, 2, 3].map(star => (
                                <TouchableOpacity
                                    key={star}
                                    onPress={() => setRating(star)}
                                    style={{ marginHorizontal: 2, borderRadius: 12, padding: 2, backgroundColor: rating === star ? '#ffd33d33' : 'transparent' }}
                                    activeOpacity={0.7}
                                >
                                    <RNText style={{ fontSize: 28, color: rating >= star ? '#ffd33d' : '#ccc', textShadowColor: rating >= star ? '#ffd33d55' : 'transparent', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }}>
                                        ★
                                    </RNText>
                                </TouchableOpacity>
                            ))}
                            <RNText style={{ fontSize: 22, marginLeft: 10, fontFamily: 'serif', textShadowColor: '#ffd33d44', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }}>
                                {rating === 1 ? '😞' : rating === 2 ? '😐' : '😄'}
                            </RNText>
                        </View>
                    </Card>
                    <View style={{ alignItems: 'center', marginTop: 16 }}>
                        <Button
                            title="添加卡片"
                            buttonStyle={{ backgroundColor: '#f5f5f5', borderRadius: 3 }}
                            containerStyle={{ width: '100%', marginHorizontal: 50, marginVertical: 10 }}
                            titleStyle={{ color: '#000', fontSize: 20 }}
                            onPress={() => { /* 添加卡片逻辑 */ }}
                        />
                    </View>
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