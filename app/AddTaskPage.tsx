import { Button, Input } from '@rneui/themed';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Text as RNText,
    ScrollView,
    StyleSheet, TextInput, TouchableOpacity,
    View
} from 'react-native';
import { Card } from 'react-native-paper';
import QuillEditor from '../components/QuillEditor';
import { AppDataSource, globalCurrentTaskId } from './database';
import { Task } from './entities/Task';
import { addTask, updateTask } from './services/TaskService';

export default function AddTaskPage() {
    const [content, setContent] = useState('');
    const [inputValue, setInputValue] = useState('');
    const [rating, setRating] = useState(2);
    const [nextProject, setNextProject] = useState('');
    const router = useRouter();
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMsg, setSnackbarMsg] = useState('');
    const [loading, setLoading] = useState(false);

    // 浮层提示
    const [centerTip, setCenterTip] = useState('');
    const [centerTipVisible, setCenterTipVisible] = useState(false);
    const showCenterTip = (msg: string, duration = 1200) => {
        setCenterTip(msg);
        setCenterTipVisible(true);
        setTimeout(() => setCenterTipVisible(false), duration);
    };

    // “下一个项目”输入框ref
    const nextProjectInputRef = useRef<TextInput>(null);

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

    // 添加卡片按钮逻辑
    const handleAddCard = async () => {
        if (loading) return;
        if (!nextProject.trim()) {
            showCenterTip('请填写下一个项目名称', 1500);
            // 自动聚焦到输入框（先 blur 再 focus，保证多次都能聚焦）
            if (nextProjectInputRef.current) {
                nextProjectInputRef.current.blur();
                setTimeout(() => {
                    nextProjectInputRef.current?.focus();
                }, 80);
            }
            return;
        }
        if (typeof globalCurrentTaskId === 'undefined' || globalCurrentTaskId === null) return;
        setLoading(true);
        try {
            if (!AppDataSource.isInitialized) await AppDataSource.initialize();
            const repo = AppDataSource.getRepository(Task);
            // 1. 查询当前任务
            const task = await repo.findOneBy({ id: globalCurrentTaskId });
            if (!task) { setLoading(false); return; }
            const now = Math.floor(Date.now() / 1000);
            // 2. 更新当前任务
            const duration = now - (task.start_time || now);
            await updateTask(task.id, {
                end_time: now,
                duration,
                reflection: content,
                rating: rating,
            });
            // 3. 插入下一个项目
            const newTask = await addTask({
                project_name: nextProject,
                start_time: now,
                pre_project_id: task.id,
            });
            // 4. 更新meta表和全局变量
            await AppDataSource.query(`UPDATE meta SET value = ? WHERE key = 'current_task_id'`, [newTask.id.toString()]);
            import('./database').then(mod => { mod.globalCurrentTaskId = newTask.id; });
            // 5. 清空输入框
            setNextProject('');
            showCenterTip('卡片添加成功！', 900);
            setTimeout(() => {
                setCenterTipVisible(false);
                router.replace('/(tabs)/cardLibrary');
            }, 900);
        } catch (e) {
            setLoading(false);
            showCenterTip('添加卡片失败', 1500);
            console.error('添加卡片失败', e);
        }
        setLoading(false);
    };

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
                            onChange={val => setContent(val)}
                            style={{
                                backgroundColor: '#fff',
                                borderRadius: 8,
                                marginBottom: 2, // 更紧凑
                                minHeight: 400,
                            }}
                        />
                        <Input
                            ref={nextProjectInputRef}
                            containerStyle={{ marginTop: 0, marginBottom: 0, paddingHorizontal: 0 }}
                            inputContainerStyle={{ borderBottomWidth: 0, borderWidth: 0, elevation: 0, backgroundColor: 'transparent', paddingHorizontal: 0 }}
                            inputStyle={{ fontSize: 14, color: '#25292e', backgroundColor: '#fff', borderRadius: 0, paddingHorizontal: 0, minHeight: 50, width: '100%' }}
                            placeholder="下一个项目，用/分级（必填）"
                            value={nextProject}
                            onChangeText={setNextProject}
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
                            onPress={handleAddCard}
                            loading={loading}
                            disabled={loading}
                        />
                    </View>
                </ScrollView>
            </View>
            {centerTipVisible && (
                <View style={{
                    position: 'absolute',
                    top: '45%',
                    left: 0,
                    right: 0,
                    alignItems: 'center',
                    zIndex: 999,
                }} pointerEvents="none">
                    <View style={{
                        backgroundColor: centerTip === '卡片添加成功！' ? '#25292e' : '#b71c1c',
                        paddingHorizontal: 32,
                        paddingVertical: 18,
                        borderRadius: 16,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.18,
                        shadowRadius: 8,
                        minWidth: 180,
                        alignItems: 'center',
                    }}>
                        <RNText style={{ color: '#fff', fontSize: 17, fontWeight: 'bold', letterSpacing: 1 }}>{centerTip}</RNText>
                    </View>
                </View>
            )}
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