import DataPickerView from '@/components/DataPickerView';
import ProjectView from '@/components/ProjectView';
import TaskCard from '@/components/TaskCard';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';
import Animated from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Task } from '../entities/Task';
import { getTasksByTimeRange } from '../services/TaskService';


const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function CardLibraryScreen() {
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);
    const [tasks, setTasks] = useState<Task[]>([]);

    // 默认时间范围为今天
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [dateRange, setDateRange] = useState<{ startDate: Date | null; endDate: Date | null }>({
        startDate: today,
        endDate: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1),
    });

    const fetchTasks = async (range = dateRange) => {
        try {
            if (range.startDate && range.endDate) {
                const start = Math.floor(range.startDate.getTime() / 1000);
                const end = Math.floor(range.endDate.getTime() / 1000);
                console.log('Fetching tasks from', start, 'to', end);
                const data = await getTasksByTimeRange(start, end);
                console.log('Fetched tasks:', data);
                setTasks(data);
            } else {
                setTasks([]);
            }
        } catch (e) {
            setTasks([]);
        }
    };

    const onRangeChange = (range: { startDate: Date | null; endDate: Date | null }) => {
        // 自动补全：startDate设为0点，endDate设为23:59:59.999
        let { startDate, endDate } = range;
        if (startDate) {
            startDate = new Date(startDate);
            startDate.setHours(0, 0, 0, 0);
        }
        if (endDate) {
            endDate = new Date(endDate);
            endDate.setHours(23, 59, 59, 999);
        }
        setDateRange({ startDate, endDate });
        fetchTasks({ startDate, endDate });
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchTasks();
        setTimeout(() => {
            setRefreshing(false);
        }, 2000);
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            fetchTasks();
        }, [dateRange])
    );

    // 工具函数：将秒数格式化为“xx天xx小时xx分钟”
    function formatDuration(seconds: number) {
        if (!seconds || isNaN(seconds)) return '';
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        let result = '';
        if (days > 0) result += `${days}天`;
        if (hours > 0) result += `${hours}小时`;
        if (minutes > 0) result += `${minutes}分钟`;
        if (!result) result = '0分钟';
        return result;
    }

    // 获取 DataPickerView 当前按钮上的字（即日期范围字符串）
    function getDateRangeTitle() {
        if (!dateRange.startDate || !dateRange.endDate) return '';
        const start = dateRange.startDate;
        const end = dateRange.endDate;
        // 格式：2024-05-01 ~ 2024-05-20
        const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        return `${fmt(start)} ~ ${fmt(end)}`;
    }
    const dateRangeTitle = getDateRangeTitle();

    return (
        <View style={{ flex: 1, backgroundColor: '#25292e' }}>
            <ScrollView
                contentContainerStyle={[styles.container]}
                nestedScrollEnabled={true}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >

                <ProjectView>

                </ProjectView>

                <DataPickerView
                    startDate={dateRange.startDate}
                    endDate={dateRange.endDate}
                    onRangeChange={onRangeChange}
                />

                <View style={styles.buttonRow}>
                    <Button
                        icon={() => <Icon name="head-snowflake" size={24} color="#000" />}
                        mode="contained"
                        style={[styles.iconButton, { backgroundColor: '#f5f5f5' }]} // 极简主义浅灰背景
                        labelStyle={{ fontSize: 12, color: '#000' }} // 黑色字体
                        onPress={() => router.push('/InpressionPage')}
                    >
                        <Text>我的感悟</Text>
                    </Button>
                    <Button
                        icon={() => <Icon name="chart-pie" size={24} color="#000" />}
                        mode="contained"
                        style={[styles.iconButton, { backgroundColor: '#f5f5f5' }]} // 极简主义浅灰背景
                        labelStyle={{ fontSize: 12, color: '#000' }} // 黑色字体
                        onPress={() => router.push({ pathname: '/TimeChartPage', params: { tasks: JSON.stringify(tasks), dateRangeTitle } })}
                    >
                        <Text>时间统计</Text>
                    </Button>
                    <Button
                        icon={() => <Icon name="robot-happy-outline" size={24} color="#000" />}
                        mode="contained"
                        style={[styles.iconButton, { backgroundColor: '#f5f5f5' }]} // 极简主义浅灰背景
                        labelStyle={{ fontSize: 12, color: '#000' }} // 黑色字体
                        onPress={() => router.push({ pathname: '/FeelChartPage', params: { tasks: JSON.stringify(tasks), dateRangeTitle } })}
                    >
                        <Text>体验统计</Text>
                    </Button>
                </View>

                {tasks.map(task => (
                    <TaskCard
                        key={task.id}
                        starRating={task.rating || 1}
                        taskName={task.project_name}
                        dueDate={task.end_time ? new Date(task.end_time * 1000).toLocaleString(undefined, { hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''}
                        duration={task.duration ? formatDuration(task.duration) : ''}
                        taskThoughts={task.reflection || ''}
                        leftContent={() => <Text>📋</Text>}
                    />
                ))}

            </ScrollView>
            <AnimatedPressable
                style={{
                    position: 'absolute',
                    right: 18,
                    bottom: 28,
                    backgroundColor: 'rgba(37,41,46,0.92)', // 深色半透明
                    borderRadius: 28,
                    width: 56,
                    height: 56,
                    justifyContent: 'center',
                    alignItems: 'center',
                    elevation: 8,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.25,
                    shadowRadius: 8,
                    borderWidth: 2,
                    borderColor: '#fff', // 白色描边
                }}
                onPress={() => {
                    router.push('/AddTaskPage');
                }}
            >
                <Icon name="plus" size={32} color="#ffd33d" />
            </AnimatedPressable>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        //flexGrow: 1,
        padding: 16,
        backgroundColor: '#25292e',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 16,
    },
    iconButton: {
        flex: 1,
        marginHorizontal: 4,
        fontSize: 5, // 缩小按钮字体
    },
});

