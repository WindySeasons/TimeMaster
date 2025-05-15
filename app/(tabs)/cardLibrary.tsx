import DataPickerView from '@/components/DataPickerView';
import ProjectView from '@/components/ProjectView';
import TaskCard from '@/components/TaskCard';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function CardLibraryScreen() {
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = () => {
        setRefreshing(true);
        // 模拟数据刷新
        setTimeout(() => {
            setRefreshing(false);
        }, 2000); // 2秒后停止刷新
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#25292e' }}>
            <ScrollView
                contentContainerStyle={[styles.container]} // 设置背景颜色

                nestedScrollEnabled={true}

                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >

                <ProjectView>

                </ProjectView>

                <DataPickerView />

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

                <TaskCard
                    starRating={3}
                    taskName="学习学习嘻嘻嘻离开家离开家离开家"
                    dueDate="2023-11-15 14:00"
                    duration="90分钟"
                    taskThoughts="Need to finish the state management section before moving on"
                    leftContent={() => <Text>📱</Text>}
                />
                <TaskCard
                    starRating={2}
                    taskName="Write Documentation"
                    dueDate="2023-11-20 09:30"
                    duration="45分钟"
                    taskThoughts="API reference needs updating with the new endpoints"
                    leftContent={() => <Text>📝</Text>}
                />
                <TaskCard
                    starRating={1}
                    taskName="Team Meeting"
                    dueDate="2023-11-10 10:00"
                    duration="120分钟"
                    taskThoughts="Prepare quarterly roadmap presentation"
                    leftContent={() => <Text>👥</Text>}
                />

                <TaskCard
                    starRating={3}
                    taskName="学习学习嘻嘻嘻离开家离开家离开家"
                    dueDate="2023-11-15 14:00"
                    duration="90分钟"
                    taskThoughts="Need to finish the state management section before moving on"
                    leftContent={() => <Text>📱</Text>}
                />
                <TaskCard
                    starRating={2}
                    taskName="Write Documentation"
                    dueDate="2023-11-20 09:30"
                    duration="45分钟"
                    taskThoughts="API reference needs updating with the new endpoints"
                    leftContent={() => <Text>📝</Text>}
                />
                <TaskCard
                    starRating={1}
                    taskName="Team Meeting"
                    dueDate="2023-11-10 10:00"
                    duration="120分钟"
                    taskThoughts="Prepare quarterly roadmap presentation"
                    leftContent={() => <Text>👥</Text>}
                />
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

