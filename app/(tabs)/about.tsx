import { initializeDatabase } from '@/app/database';
import { addTask, getTasks, updateTask } from '@/app/services/TaskService'; // 从 TaskService 引入任务相关函数
import React, { useEffect } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function AboutScreen() {
    useEffect(() => {
        // 初始化数据库
        initializeDatabase();
    }, []);

    const handleAddTask = async () => {
        await addTask({
            project_name: '测试项目',
            start_time: Date.now(), // 使用时间戳存储当前时间
            end_time: Date.now() + 3600000, // 一小时后
            duration: 3600, // 持续时间以秒为单位
            reflection: '这是一个测试任务',
            pre_project_id: undefined, // 无前置项目
            rating: 3,
        });
        console.log('Task added');
    };

    const handleGetTasks = async () => {
        const tasks = await getTasks();
        const formattedTasks = tasks.map(task => ({
            ...task,
            start_time: new Date(task.start_time * 1000).toISOString(), // 转换为 ISO 时间格式
            end_time: task.end_time ? new Date(task.end_time * 1000).toISOString() : null, // 处理可能为 null 的值
        }));
        console.log('Tasks:', formattedTasks);
    };

    const handleUpdateTask = async () => {
        await updateTask(1, { project_name: '更新后的任务名称' });
        console.log('Task updated');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.text}>About screen</Text>
            <Button title="添加任务" onPress={handleAddTask} />
            <Button title="获取任务" onPress={handleGetTasks} />
            <Button title="更新任务" onPress={handleUpdateTask} />
        </View>
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
