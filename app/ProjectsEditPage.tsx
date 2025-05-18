import { BottomSheet, ButtonGroup, ListItem } from '@rneui/themed';
import { Stack } from 'expo-router';
import React, { useRef } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { Button as PaperButton, Dialog as PaperDialog, Portal } from 'react-native-paper';
import Animated from 'react-native-reanimated';
import ProjectInputView from '../components/ProjectInputView';
import { ProjectService } from './services/ProjectService';

const screenWidth = Dimensions.get('window').width;

export default function ProjectsEditPage() {
    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const buttons = ['创建', '删除', '修改', '排序'];
    const [isSheetVisible, setIsSheetVisible] = React.useState(false);
    const [name, setName] = React.useState('');
    const [desc, setDesc] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');

    // 项目列表数据
    const [projectList, setProjectList] = React.useState<{ id: number; name: string; serial_number: number; description?: string }[]>([]);

    // 打开创建弹窗
    React.useEffect(() => {
        // 页面初始 selectedIndex=0，但不弹出 ProjectInputView
        if (selectedIndex === 0 && !firstRenderRef.current) {
            setIsSheetVisible(true);
        }
    }, [selectedIndex]);

    // 首次渲染时不弹出 bottom sheet
    const firstRenderRef = React.useRef(true);
    React.useEffect(() => {
        firstRenderRef.current = false;
    }, []);

    // 仅点击“创建”按钮时弹出 ProjectInputView
    const handleButtonGroupPress = (idx: number) => {
        setSelectedIndex(idx);
        if (idx === 0) setIsSheetVisible(true);
    };

    // 提交创建
    const handleCreate = async () => {
        if (!name.trim()) {
            setError('项目名称必填');
            return;
        }
        setLoading(true);
        setError('');
        try {
            // 查询最大 serial_number
            const projects = await ProjectService.getAllProjects();
            let maxSerial = 0;
            if (projects.length > 0) {
                maxSerial = Math.max(...projects.map(p => p.serial_number));
            }
            const newProject = await ProjectService.createProject(name.trim(), maxSerial + 1, desc.trim() || undefined);
            console.log('创建成功:', newProject);
            setIsSheetVisible(false);
            setName('');
            setDesc('');
        } catch (e) {
            setError('创建失败');
        }
        setLoading(false);
    };

    // 页面加载和每次弹窗关闭后刷新项目列表
    React.useEffect(() => {
        (async () => {
            const data = await ProjectService.getAllProjects();
            setProjectList(data);
            console.log('projectList:', projectList);
        })();
    }, [isSheetVisible]);

    // 拖拽排序后的数据同步到 state
    const handleDragEnd = ({ data }: { data: typeof projectList }) => {
        setProjectList(data);
        // 这里可以根据 data 顺序更新 serial_number 并同步到数据库（如需持久化排序）
    };

    // 删除项目
    const handleDeleteProject = async (id: number) => {
        await ProjectService.deleteProject(id);
        const data = await ProjectService.getAllProjects();
        setProjectList(data);
    };

    // 编辑相关状态
    const [editSheetVisible, setEditSheetVisible] = React.useState(false);
    const [editProject, setEditProject] = React.useState<{ id: number; name: string; description?: string } | null>(null);
    const [editName, setEditName] = React.useState('');
    const [editDesc, setEditDesc] = React.useState('');
    // 编辑确认弹窗状态
    const [editConfirmVisible, setEditConfirmVisible] = React.useState(false);
    // 记录当前待确认编辑的 item id
    const [pendingEditId, setPendingEditId] = React.useState<number | null>(null);
    // 编辑弹窗提交时弹出确认弹窗，先关闭 BottomSheet，避免遮挡
    const handleEditSheetSubmit = () => {
        if (editProject) {
            setEditSheetVisible(false);
            setTimeout(() => {
                setPendingEditId(editProject.id);
                setEditConfirmVisible(true);
            }, 250); // 延迟，确保 BottomSheet 已关闭
        }
    };
    // 取消编辑确认时可选返回编辑弹窗
    const handleEditConfirmCancel = () => {
        setEditConfirmVisible(false);
        setPendingEditId(null);
        setTimeout(() => {
            setEditSheetVisible(true);
        }, 200);
    };
    // 确认编辑
    const handleEditConfirmOk = async () => {
        if (!editProject) return;
        setLoading(true);
        setError('');
        try {
            await ProjectService.updateProject(editProject.id, {
                name: editName.trim(),
                description: editDesc.trim() || undefined,
            });
            setEditSheetVisible(false);
            setEditProject(null);
            setEditConfirmVisible(false);
            setPendingEditId(null);
            // 复原该 ListItem
            if (pendingEditId && swipeableRefs.current[pendingEditId]) {
                swipeableRefs.current[pendingEditId]?.close();
            }
            const data = await ProjectService.getAllProjects();
            setProjectList(data);
        } catch (e) {
            setError('修改失败');
        }
        setLoading(false);
    };
    // 取消编辑
    const handleEditConfirmCancel2 = () => {
        setEditConfirmVisible(false);
        setPendingEditId(null);
    };

    // 所有 Swipeable 的 ref，key 为 item.id
    const swipeableRefs = useRef<{ [id: string]: Swipeable | null }>({});
    // 当前已打开的 Swipeable id
    const [openSwipeableId, setOpenSwipeableId] = React.useState<string | null>(null);

    // 滑动删除提示 Banner
    const [showSwipeTip, setShowSwipeTip] = React.useState(false);
    // 是否已自动演示过滑动
    const [hasShownSwipeDemo, setHasShownSwipeDemo] = React.useState(false);
    // 首次有数据时自动滑开第一个ListItem
    React.useEffect(() => {
        if (projectList.length > 0 && !hasShownSwipeDemo) {
            const firstId = String(projectList[0].id);
            setTimeout(() => {
                const ref = swipeableRefs.current[firstId];
                if (ref && typeof ref.openRight === 'function') {
                    ref.openRight();
                    setHasShownSwipeDemo(true);
                }
            }, 500); // 延迟，确保ref已挂载
        }
    }, [projectList, hasShownSwipeDemo]);
    // 用户滑动任意 ListItem 时关闭自动演示
    const handleAnySwipe = () => {
        if (!hasShownSwipeDemo) setHasShownSwipeDemo(true);
        if (showSwipeTip) setShowSwipeTip(false);
    };

    // 删除确认弹窗状态
    const [deleteConfirmVisible, setDeleteConfirmVisible] = React.useState(false);
    const [pendingDeleteId, setPendingDeleteId] = React.useState<number | null>(null);
    // 删除按钮点击
    const handleDeletePress = (id: number) => {
        setPendingDeleteId(id);
        setDeleteConfirmVisible(true);
    };
    // 确认删除
    const handleDeleteConfirm = async () => {
        if (pendingDeleteId == null) return;
        await ProjectService.deleteProject(pendingDeleteId);
        const data = await ProjectService.getAllProjects();
        setProjectList(data);
        setDeleteConfirmVisible(false);
        setPendingDeleteId(null);
    };
    // 取消删除
    const handleDeleteCancel = () => {
        setDeleteConfirmVisible(false);
        setPendingDeleteId(null);
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Stack.Screen
                options={{
                    title: '项目编辑',
                    headerStyle: {
                        backgroundColor: '#25292e', // 设置与页面背景相同的颜色
                    },
                    headerTintColor: '#fff', // 设置字体为白色
                }}
            />
            <View style={styles.container}>
                {false && showSwipeTip && (
                    <View style={styles.swipeTipBanner}>
                        <Text style={styles.swipeTipText}>提示：向左滑动项目可编辑或删除 👈</Text>
                        <Text style={styles.swipeTipClose} onPress={() => setShowSwipeTip(false)}>×</Text>
                    </View>
                )}
                <ButtonGroup
                    onPress={handleButtonGroupPress}
                    selectedIndex={selectedIndex}
                    buttons={buttons}
                    containerStyle={{ marginBottom: 24, width: screenWidth * 0.95, alignSelf: 'center', borderRadius: 8 }}
                    buttonStyle={{ backgroundColor: '#25292e' }}
                    selectedButtonStyle={{ backgroundColor: '#ffd33d' }}
                    selectedTextStyle={{ color: '#25292e', fontWeight: 'bold' }}
                    textStyle={{ color: '#fff', fontSize: 16 }}
                />
                <View style={{ flex: 1, width: '100%', marginBottom: 16 }}>
                    <DraggableFlatList
                        data={projectList}
                        keyExtractor={item => String(item.id)}
                        onDragEnd={handleDragEnd}
                        renderItem={({ item, drag, isActive }: RenderItemParams<typeof projectList[0]>) => {
                            return (
                                <Swipeable
                                    ref={ref => { swipeableRefs.current[item.id] = ref; }}
                                    renderRightActions={(progress, dragX, swipeable) => (
                                        <View style={{ flexDirection: 'row', height: '100%' }}>
                                            <View style={{ backgroundColor: '#409eff', height: '100%', width: 80, justifyContent: 'center', alignItems: 'center' }}>
                                                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }} onPress={() => {
                                                    setEditProject({ id: item.id, name: item.name, description: item.description });
                                                    setEditName(item.name);
                                                    setEditDesc(item.description || '');
                                                    setEditSheetVisible(true);
                                                }}>编辑</Text>
                                            </View>
                                            <View style={{ backgroundColor: '#ff4d4f', height: '100%', width: 80, justifyContent: 'center', alignItems: 'center' }}>
                                                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }} onPress={() => handleDeletePress(item.id)}>删除</Text>
                                            </View>
                                        </View>
                                    )}
                                    overshootRight={false}
                                    onSwipeableOpen={() => {
                                        // 关闭其它已打开的 Swipeable
                                        Object.entries(swipeableRefs.current).forEach(([id, ref]) => {
                                            if (id !== String(item.id) && ref) ref.close();
                                        });
                                        setOpenSwipeableId(String(item.id));
                                        handleAnySwipe(); // 用户滑动时关闭提示
                                    }}
                                    onSwipeableClose={() => {
                                        if (openSwipeableId === String(item.id)) {
                                            setOpenSwipeableId(null);
                                        }
                                    }}
                                >
                                    <AnimatedListItem item={item} drag={drag} isActive={isActive} progress={undefined} />
                                </Swipeable>
                            );
                        }}
                        ListEmptyComponent={<View style={{ height: 40 }} />}
                        contentContainerStyle={{ paddingBottom: 8 }}
                    />
                </View>
                <BottomSheet isVisible={isSheetVisible} onBackdropPress={() => setIsSheetVisible(false)}>
                    <ProjectInputView
                        name={name}
                        setName={setName}
                        desc={desc}
                        setDesc={setDesc}
                        error={error}
                        loading={loading}
                        onSubmit={handleCreate}
                    />
                </BottomSheet>
                {/* 编辑弹窗 */}
                <BottomSheet isVisible={editSheetVisible} onBackdropPress={() => setEditSheetVisible(false)}>
                    <ProjectInputView
                        name={editName}
                        setName={setEditName}
                        desc={editDesc}
                        setDesc={setEditDesc}
                        error={error}
                        loading={loading}
                        onSubmit={handleEditSheetSubmit}
                    />
                </BottomSheet>
                {/* 删除确认弹窗（极简风格） */}
                <Portal>
                    <PaperDialog
                        visible={deleteConfirmVisible}
                        onDismiss={handleDeleteCancel}
                        style={{ backgroundColor: '#25292e', borderRadius: 16 }}
                    >
                        <PaperDialog.Title style={{ color: '#ffd33d', textAlign: 'center', fontWeight: 'bold', fontSize: 18, marginBottom: 0 }}>
                            删除项目？
                        </PaperDialog.Title>
                        <PaperDialog.Content>
                            <Text style={{ fontSize: 15, color: '#fff', textAlign: 'center', marginBottom: 0 }}>
                                确定要删除？
                            </Text>
                        </PaperDialog.Content>
                        <PaperDialog.Actions style={{ justifyContent: 'center', marginBottom: 4 }}>
                            <PaperButton
                                mode="text"
                                onPress={handleDeleteCancel}
                                style={{ borderRadius: 8, marginRight: 12 }}
                                labelStyle={{ color: '#ffd33d', fontWeight: 'bold', fontSize: 16 }}
                            >
                                取消
                            </PaperButton>
                            <PaperButton
                                mode="contained"
                                onPress={handleDeleteConfirm}
                                style={{ backgroundColor: '#ff4d4f', borderRadius: 8 }}
                                labelStyle={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}
                            >
                                删除
                            </PaperButton>
                        </PaperDialog.Actions>
                    </PaperDialog>
                </Portal>
                {/* 编辑确认弹窗（极简风格） */}
                <Portal>
                    <PaperDialog
                        visible={editConfirmVisible}
                        onDismiss={handleEditConfirmCancel2}
                        style={{ backgroundColor: '#25292e', borderRadius: 16 }}
                    >
                        <PaperDialog.Title style={{ color: '#ffd33d', textAlign: 'center', fontWeight: 'bold', fontSize: 18, marginBottom: 0 }}>
                            保存修改？
                        </PaperDialog.Title>
                        <PaperDialog.Content>
                            <Text style={{ fontSize: 15, color: '#fff', textAlign: 'center', marginBottom: 0 }}>
                                确认保存对该项目的修改？
                            </Text>
                        </PaperDialog.Content>
                        <PaperDialog.Actions style={{ justifyContent: 'center', marginBottom: 4 }}>
                            <PaperButton
                                mode="text"
                                onPress={handleEditConfirmCancel2}
                                style={{ borderRadius: 8, marginRight: 12 }}
                                labelStyle={{ color: '#ffd33d', fontWeight: 'bold', fontSize: 16 }}
                            >
                                取消
                            </PaperButton>
                            <PaperButton
                                mode="contained"
                                onPress={handleEditConfirmOk}
                                style={{ backgroundColor: '#409eff', borderRadius: 8 }}
                                labelStyle={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}
                            >
                                保存
                            </PaperButton>
                        </PaperDialog.Actions>
                    </PaperDialog>
                </Portal>
            </View>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#25292e',
    },
    text: {
        color: '#fff',
    },
    swipeTipBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffd33d',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        margin: 12,
        justifyContent: 'space-between',
    },
    swipeTipText: {
        color: '#25292e',
        fontWeight: 'bold',
        fontSize: 15,
    },
    swipeTipClose: {
        color: '#25292e',
        fontWeight: 'bold',
        fontSize: 20,
        marginLeft: 12,
        paddingHorizontal: 4,
    },
});

// AnimatedListItem 组件，宽度受 progress 控制
const AnimatedListItem = ({ item, drag, isActive, progress }: { item: any, drag: () => void, isActive: boolean, progress: any }) => {
    // 这里 progress 需要从 Swipeable 传递，但 r-n-gesture-handler 没有直接暴露
    // 用 Animated.View 包裹 ListItem，并让其 minWidth: 80, flex: 1, overflow: 'visible'
    return (
        <Animated.View style={{ flex: 1, minWidth: 80, backgroundColor: 'transparent', overflow: 'visible' }}>
            <ListItem
                key={item.id}
                bottomDivider
                containerStyle={{ backgroundColor: isActive ? '#ffe066' : '#fff', minWidth: 80, flex: 1, overflow: 'visible' }}
                onLongPress={drag}
                style={{ flex: 1 }}
            >
                <ListItem.Content>
                    <ListItem.Title style={{ color: '#25292e', fontWeight: 'bold' }}>{item.name}</ListItem.Title>
                    {item.description ? (
                        <ListItem.Subtitle style={{ color: '#888', fontSize: 13 }}>{item.description}</ListItem.Subtitle>
                    ) : null}
                </ListItem.Content>
                <ListItem.Chevron color="#ffd33d" />
            </ListItem>
        </Animated.View>
    );
};

