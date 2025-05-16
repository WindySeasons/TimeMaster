import DataPickerView from '@/components/DataPickerView';
import ProjectView from '@/components/ProjectView';
import TaskCard from '@/components/TaskCard';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Task } from '../entities/Task';
import { getTasksByTimeRange } from '../services/TaskService';

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
                const data = await getTasksByTimeRange(start, end);
                setTasks(data);
            } else {
                setTasks([]);
            }
        } catch (e) {
            setTasks([]);
        }
    };

    const onRangeChange = (range: { startDate: Date | null; endDate: Date | null }) => {
        setDateRange(range);
        fetchTasks(range);
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
                        onPress={() => router.push('/TimeChartPage')}
                    >
                        <Text>时间统计</Text>
                    </Button>
                    <Button
                        icon={() => <Icon name="robot-happy-outline" size={24} color="#000" />}
                        mode="contained"
                        style={[styles.iconButton, { backgroundColor: '#f5f5f5' }]} // 极简主义浅灰背景
                        labelStyle={{ fontSize: 12, color: '#000' }} // 黑色字体
                        onPress={() => router.push('/FeelChartPage')}
                    >
                        <Text>体验统计</Text>
                    </Button>
                </View>

                {tasks.map(task => (
                    <TaskCard
                        key={task.id}
                        starRating={task.rating || 1}
                        taskName={task.project_name}
                        dueDate={task.end_time ? new Date(task.end_time * 1000).toLocaleString() : ''}
                        duration={task.duration ? formatDuration(task.duration) : ''}
                        taskThoughts={task.reflection || ''}
                        leftContent={() => <Text>📋</Text>}
                    />
                ))}

            </ScrollView>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
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

