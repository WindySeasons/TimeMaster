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
            name: '测试任务',
            start_time: new Date().toISOString(),
            end_time: new Date().toISOString(),
            duration: 60,
            reflection: '这是一个测试任务',
            rating: 5,
        });
        console.log('Task added');
    };

    const handleGetTasks = async () => {
        const tasks = await getTasks();
        console.log('Tasks:', tasks);
    };

    const handleUpdateTask = async () => {
        await updateTask(1, { name: '更新后的任务名称' });
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
