import { Button, Input } from '@rneui/themed';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Keyboard,
    Text as RNText,
    ScrollView,
    StyleSheet, TextInput, TouchableOpacity,
    View
} from 'react-native';
import { Card } from 'react-native-paper';
import QuillEditor from '../components/QuillEditor';
import { AppDataSource, globalCurrentTaskId } from './database';
import { Task } from './entities/Task';
import { ProjectService } from './services/ProjectService';
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

    // 下一个项目选择浮层相关
    const [showProjectList, setShowProjectList] = useState(false);
    const [allProjects, setAllProjects] = useState<{ id: number; name: string; serial_number: number }[]>([]);
    const [filteredProjects, setFilteredProjects] = useState<typeof allProjects>([]);

    // 输入框聚焦时加载项目列表（每次都强制刷新，保证编辑后能实时更新）
    const handleNextProjectFocus = async () => {
        setShowProjectList(true);
        try {
            const projects = await ProjectService.getAllProjects();
            const sorted = projects.sort((a, b) => a.serial_number - b.serial_number);
            setAllProjects(sorted);
            setFilteredProjects(
                nextProject.trim()
                    ? sorted.filter(p => p.name.toLowerCase().startsWith(nextProject.trim().toLowerCase()))
                    : sorted
            );
        } catch (e) {
            setAllProjects([]);
            setFilteredProjects([]);
        }
    };
    // 标记是否点击了Chip
    const chipClickRef = useRef(false);
    // 输入框失焦时关闭浮层（仅非点击Chip时才关闭，且不与Chip延迟冲突）
    const handleNextProjectBlur = () => {
        if (chipClickRef.current) {
            // 如果是点击Chip导致的失焦，不做任何关闭，交由handleSelectProject延迟关闭
            return;
        }
        setTimeout(() => {
            setShowProjectList(false);
        }, 1020);
    };
    // 输入时动态筛选
    const handleNextProjectChange = (text: string) => {
        setNextProject(text);
        if (showProjectList) {
            setFilteredProjects(
                text.trim()
                    ? allProjects.filter(p => p.name.toLowerCase().startsWith(text.trim().toLowerCase()))
                    : allProjects
            );
        }
    };
    // 选择项目
    const handleSelectProject = (name: string) => {
        chipClickRef.current = true;
        Keyboard.dismiss(); // 先收起输入法
        setNextProject(name); // 自动填充到输入框
        // 延迟关闭浮层，给输入法收起留出时间
        setTimeout(() => {
            setShowProjectList(false);
        }, 1350); // 1350ms，体验更流畅
    };

    // 防抖函数
    const debounce = (fn: (...args: any[]) => void, delay = 700) => {
        let timer: ReturnType<typeof setTimeout> | null = null;
        return (...args: any[]) => {
            if (timer) clearTimeout(timer);
            timer = setTimeout(() => fn(...args), delay);
        };
    };
    const debouncedEditProjects = React.useMemo(() => debounce(() => {
        router.push('/ProjectsEditPage');
    }), [router]);

    return (
        <>
            <Stack.Screen
                options={{
                    title: '新建卡片',
                    headerStyle: { backgroundColor: '#25292e' },
                    headerTintColor: '#fff',
                }}
            />

            <ScrollView
                style={{ flex: 1, backgroundColor: '#25292e' }}
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
                            minHeight: 350,
                        }}
                    />
                    {/* 项目选择Chip流式浮层（显示在“下一个项目”输入框正上方，底边紧贴输入框上界） */}
                    <View style={{ position: 'relative' }}>
                        <Input
                            ref={nextProjectInputRef}
                            containerStyle={{ marginTop: 0, marginBottom: 0, paddingHorizontal: 0 }}
                            inputContainerStyle={{ borderBottomWidth: 0, borderWidth: 0, elevation: 0, backgroundColor: 'transparent', paddingHorizontal: 0 }}
                            inputStyle={{ fontSize: 14, color: '#25292e', backgroundColor: '#fff', borderRadius: 0, paddingHorizontal: 0, minHeight: 50, width: '100%' }}
                            placeholder="下一个项目，用/分级（必填）"
                            value={nextProject}
                            onChangeText={handleNextProjectChange}
                            onFocus={handleNextProjectFocus}
                            onBlur={handleNextProjectBlur}
                            leftIconContainerStyle={{}}
                            rightIconContainerStyle={{}}
                            errorMessage={undefined}
                            renderErrorMessage={false}
                        />
                        {showProjectList && (
                            <View
                                style={{
                                    position: 'absolute',
                                    left: 0,
                                    right: 0,
                                    bottom: '100%', // 紧贴Input上界
                                    marginBottom: 6, // 与输入框间距（可调）
                                    maxHeight: 200,
                                    backgroundColor: '#fff',
                                    borderRadius: 8,
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.12,
                                    shadowRadius: 8,
                                    zIndex: 999,
                                    borderWidth: 1,
                                    borderColor: '#eee',
                                    overflow: 'hidden',
                                    padding: 10,
                                    flexDirection: 'column',
                                    justifyContent: 'flex-end',
                                }}
                            >
                                <ScrollView
                                    style={{ maxHeight: 200 }}
                                    contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start' }}
                                    keyboardShouldPersistTaps="handled"
                                >
                                    {filteredProjects.length > 0 ? filteredProjects.map(p => (
                                        <TouchableOpacity
                                            key={p.id}
                                            onPress={() => handleSelectProject(p.name)}
                                            activeOpacity={0.7}
                                            style={{
                                                backgroundColor: '#f5f5f5',
                                                borderRadius: 16,
                                                paddingHorizontal: 14,
                                                paddingVertical: 7,
                                                margin: 5,
                                                borderWidth: 1,
                                                borderColor: '#e0e0e0',
                                                shadowColor: '#000',
                                                shadowOffset: { width: 0, height: 1 },
                                                shadowOpacity: 0.06,
                                                shadowRadius: 2,
                                            }}
                                        >
                                            <RNText style={{ fontSize: 14, color: '#25292e' }}>{p.name}</RNText>
                                        </TouchableOpacity>
                                    )) : (
                                        <View style={{ padding: 16, alignItems: 'center', width: '100%' }}>
                                            <RNText style={{ color: '#888', fontSize: 14 }}>无匹配项目</RNText>
                                        </View>
                                    )}
                                    {/* 编辑预设项目Chip */}
                                    <TouchableOpacity
                                        key="edit-preset-projects"
                                        onPress={debouncedEditProjects}
                                        activeOpacity={0.7}
                                        style={{
                                            backgroundColor: '#e3f2fd',
                                            borderRadius: 16,
                                            paddingHorizontal: 14,
                                            paddingVertical: 7,
                                            margin: 5,
                                            borderWidth: 1,
                                            borderColor: '#90caf9',
                                            shadowColor: '#000',
                                            shadowOffset: { width: 0, height: 1 },
                                            shadowOpacity: 0.06,
                                            shadowRadius: 2,
                                        }}
                                    >
                                        <RNText style={{ fontSize: 14, color: '#1976d2', fontWeight: 'bold' }}>编辑预设项目</RNText>
                                    </TouchableOpacity>
                                </ScrollView>
                            </View>
                        )}
                    </View>
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