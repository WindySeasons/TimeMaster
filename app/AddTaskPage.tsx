import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Button, Input, Slider } from '@rneui/themed';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Keyboard,
    Text as RNText,
    ScrollView,
    StyleSheet, TextInput, TouchableOpacity,
    View
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Card, List, RadioButton } from 'react-native-paper';
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
    const [expanded, setExpanded] = React.useState(true);
    const [checked, setChecked] = React.useState(''); // 初始为未选中


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
    const bottomSheetRef = useRef<BottomSheet>(null);
    const snapPoints = React.useMemo(() => ['80%'], []); // 原为32%，现改为60%

    const [duration, setDuration] = useState(0); // 新增duration状态，单位：分钟
    const [sliderValue, setSliderValue] = useState(0); // 新增sliderValue状态，单位：分钟

    const [currentTask, setCurrentTask] = useState<Task | null>(null); // 新增：当前任务对象

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
                    // 计算总分钟数
                    const totalMinutes = Math.max(1, Math.floor(usedSeconds / 60));
                    setDuration(totalMinutes);
                    setSliderValue(totalMinutes);
                    setCurrentTask(task); // 保存当前任务到state
                }
            } catch (e) {
                setInputValue('当前项目');
                setDuration(0);
                setSliderValue(0);
                setCurrentTask(null);
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
            let updateObj: any = {
                reflection: content,
                rating: rating,
            };
            if (currentTask && currentTask.end_time) {
                updateObj.duration = currentTask.duration;
                updateObj.end_time = currentTask.end_time;
            } else {
                const now = Math.floor(Date.now() / 1000);
                const duration = now - (task.start_time || now);
                updateObj.duration = duration;
                updateObj.end_time = now;
            }
            // 2. 更新当前任务
            await updateTask(task.id, updateObj);
            // 3. 插入下一个项目
            const newTask = await addTask({
                project_name: nextProject,
                start_time: updateObj.end_time,
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

    // 底部弹窗开关状态
    const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

    // 修改按钮点击事件
    const handleModifyPress = () => {
        setIsBottomSheetOpen(true);
        setTimeout(() => {
            bottomSheetRef.current?.expand();
        }, 10);
    };

    // 新增：用于“修改项目名称”输入框的受控变量
    const [modifyProjectName, setModifyProjectName] = useState('');

    // 提交按钮逻辑（覆盖handleAddCard）
    const handleBottomSheetSubmit = async () => {
        if (loading) return;
        setLoading(true);
        try {
            let updated = false;
            let newDuration = 0;
            let newEndTime = currentTask?.end_time || 0;
            if (currentTask) {
                if (checked === 'first') {
                    newDuration = 0;
                    newEndTime = currentTask.start_time || 0;
                } else {
                    newDuration = sliderValue * 60; // 分钟转秒
                    newEndTime = (currentTask.start_time || 0) + newDuration;
                }
                setCurrentTask({ ...currentTask, duration: newDuration, end_time: newEndTime });
            }
            if (modifyProjectName.trim() && globalCurrentTaskId) {
                if (!AppDataSource.isInitialized) await AppDataSource.initialize();
                const repo = AppDataSource.getRepository(Task);
                const task = await repo.findOneBy({ id: globalCurrentTaskId });
                if (task) {
                    await updateTask(task.id, { project_name: modifyProjectName.trim() });
                    task.project_name = modifyProjectName.trim();
                    if (currentTask) {
                        currentTask.project_name = task.project_name;
                    }
                    showCenterTip('项目名称修改成功！', 500);
                    updated = true;
                }
            }
            // 正确关闭 BottomSheet
            if (currentTask) {
                setInputValue(`当前项目：${currentTask.project_name}  ${formatMinutesToDHMS(Math.floor(newDuration / 60))}`);
            }
            bottomSheetRef.current?.close();
            setIsBottomSheetOpen(false);
            if (!updated) {
                // showCenterTip('未做任何修改，已关闭', 900);
            }
        } catch (e) {
            showCenterTip('项目名称修改失败', 1500);
            bottomSheetRef.current?.close();
            setIsBottomSheetOpen(false);
        }
        setLoading(false);
    };

    // 工具函数：分钟转天小时分钟字符串
    function formatMinutesToDHMS(mins: number) {
        if (!mins || mins <= 0) return '0分钟';
        const days = Math.floor(mins / 1440);
        const hours = Math.floor((mins % 1440) / 60);
        const minutes = mins % 60;
        let str = '';
        if (days > 0) str += `${days}天`;
        if (hours > 0) str += `${hours}小时`;
        if (minutes > 0 || (!days && !hours)) str += `${minutes}分钟`;
        return str;
    }

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
        <GestureHandlerRootView style={{ flex: 1 }}>
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
                                onPress={handleModifyPress}
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
                            {rating === 1 ? '🥶' : rating === 2 ? '🙂' : '😍'}
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
            <BottomSheet
                ref={bottomSheetRef}
                index={isBottomSheetOpen ? 0 : -1}
                snapPoints={snapPoints}
                enablePanDownToClose
                onClose={() => setIsBottomSheetOpen(false)}
                backgroundStyle={{ backgroundColor: '#fff', borderTopLeftRadius: 18, borderTopRightRadius: 18 }}
                handleIndicatorStyle={{ backgroundColor: '#ffd33d', width: 48, height: 6, borderRadius: 3 }}
                style={{ zIndex: 200 }}
                backdropComponent={props => (
                    <BottomSheetBackdrop
                        {...props}
                        appearsOnIndex={0}
                        disappearsOnIndex={-1}
                        pressBehavior="close"
                    />
                )}
            >
                <BottomSheetScrollView style={{ padding: 18 }} showsVerticalScrollIndicator={true}>
                    <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <RNText style={{ fontSize: 16, color: '#25292e', fontWeight: 'bold', fontFamily: 'serif', letterSpacing: 1.2 }}>
                            {inputValue.replace(/^当前项目：/, '')}
                        </RNText>
                        <RNText style={{ fontSize: 15, color: '#888', fontFamily: 'serif', marginLeft: 12 }}>
                            {(() => {
                                // 提取duration字符串
                                const match = inputValue.match(/(\d+天)?(\d+小时)?(\d+分钟)?$/);
                                return match ? match[0] : '';
                            })()}
                        </RNText>
                    </View>
                    <List.Section >
                        <List.Accordion
                            title="修改名称"
                        >
                            <Input
                                placeholder="在此处输入新名称,不修改就不用输"
                                value={modifyProjectName}
                                onChangeText={setModifyProjectName}
                                inputStyle={{ fontSize: 15, color: '#25292e', backgroundColor: '#fff', borderRadius: 6, paddingHorizontal: 8 }}
                                containerStyle={{ paddingHorizontal: 0, marginHorizontal: 0 }}
                                inputContainerStyle={{ borderBottomWidth: 0, borderWidth: 1, borderColor: '#eee', borderRadius: 6, backgroundColor: '#fafafa' }}
                                errorMessage={undefined}
                                renderErrorMessage={false}
                            />
                        </List.Accordion>
                        <List.Accordion
                            title="缩短时间并将时间归入你的下一个记录项目"
                        >
                            <View style={{ padding: 12 }}>
                                <RNText style={{ fontSize: 15, color: '#25292e', marginBottom: 8 }}>
                                    缩短到 <RNText style={{ color: '#1976d2', fontWeight: 'bold' }}>{formatMinutesToDHMS(sliderValue)}</RNText> 分钟
                                </RNText>
                                <Slider
                                    value={sliderValue}
                                    onValueChange={setSliderValue}
                                    maximumValue={duration}
                                    minimumValue={0}
                                    step={1}
                                    allowTouchTrack
                                    trackStyle={{ height: 5, backgroundColor: 'transparent' }}
                                    thumbStyle={{ height: 20, width: 20, backgroundColor: '#ffd33d' }}
                                />
                            </View>
                        </List.Accordion>
                        <List.Accordion
                            title="中断记录，重新开始"
                        >
                            <TouchableOpacity
                                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}
                                activeOpacity={0.7}
                                onPress={() => setChecked(checked === 'first' ? '' : 'first')}
                            >
                                <RadioButton
                                    value="first"
                                    status={checked === 'first' ? 'checked' : 'unchecked'}
                                    onPress={() => setChecked(checked === 'first' ? '' : 'first')}
                                />
                                <RNText style={{ fontSize: 15, color: '#25292e', marginLeft: 4 }}>
                                    确定归零
                                </RNText>
                            </TouchableOpacity>
                            <RNText style={{ fontSize: 8, color: '#888', marginLeft: 8 }}>
                                *适用于记录中断了很长时间，从现在开始重新开始记录的情况，归零后请立刻提供新卡片，否则不生效
                            </RNText>
                        </List.Accordion>
                    </List.Section>
                    <View style={{ alignItems: 'center', marginTop: 24, marginBottom: 8 }}>
                        <Button
                            title="提交"
                            buttonStyle={{ backgroundColor: '#4caf50', borderRadius: 6, width: '100%', minHeight: 48 }}
                            titleStyle={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}
                            containerStyle={{ width: '100%', maxWidth: 420 }}

                            onPress={handleBottomSheetSubmit}
                            loading={loading}
                            disabled={loading}
                        />
                    </View>
                </BottomSheetScrollView>
            </BottomSheet>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#25292e',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 16,
    },
    subtitle: {
        fontSize: 18,
        color: '#fff',
        marginBottom: 12,
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#25292e',
        marginBottom: 16,
    },
    button: {
        backgroundColor: '#ffd33d',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
        marginTop: 8,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#25292e',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
    },
    chip: {
        backgroundColor: '#e3f2fd',
        borderRadius: 16,
        paddingVertical: 8,
        paddingHorizontal: 16,
        margin: 4,
        borderWidth: 1,
        borderColor: '#90caf9',
    },
    chipText: {
        fontSize: 14,
        color: '#1976d2',
        fontWeight: 'bold',
    },
    projectList: {
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
    },
    projectItem: {
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
    },
    bottomSheetContent: {
        padding: 18,
    },
    bottomSheetTitle: {
        fontSize: 16,
        color: '#25292e',
        fontWeight: 'bold',
        fontFamily: 'serif',
        letterSpacing: 1.2,
    },
    bottomSheetSubtitle: {
        fontSize: 15,
        color: '#888',
        fontFamily: 'serif',
        marginLeft: 12,
    },
    bottomSheetSection: {
        marginBottom: 16,
    },
    bottomSheetAccordion: {
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        marginBottom: 8,
    },
    bottomSheetAccordionTitle: {
        fontSize: 14,
        color: '#25292e',
        fontWeight: 'bold',
    },
    bottomSheetAccordionIcon: {
        color: '#ffd33d',
    },
});
