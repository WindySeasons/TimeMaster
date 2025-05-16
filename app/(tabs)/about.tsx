import { addTask, getTasks, updateTask } from '@/app/services/TaskService'; // 从 TaskService 引入任务相关函数
import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { AppDataSource } from '../database';

export default function AboutScreen() {


    const handleAddTask = async () => {
        // 随机生成 project_name（从预设列表中随机选择）
        const projectNames = ['项目A', '项目B', '项目C', '项目D'];
        const randomProjectName = projectNames[Math.floor(Math.random() * projectNames.length)];

        // 随机生成 rating（1 到 3 之间的整数）
        const randomRating = Math.floor(Math.random() * 3) + 1;

        // 随机生成 duration（以秒为单位，范围 1800 到 7200 秒）
        const randomDuration = (Math.floor(Math.random() * (7200 - 1800 + 1)) + 1800) * 1000;

        // 随机生成 end_time（当前时间 + duration 秒）
        const currentTime = Math.floor(Date.now()); // 秒
        const randomEndTime = currentTime + randomDuration; // 秒
        await addTask({
            project_name: randomProjectName,
            start_time: currentTime,
            end_time: randomEndTime,
            duration: randomDuration,
            reflection: '这是一个随机生成的任务',
            pre_project_id: undefined,
            rating: randomRating,
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

    const handleResetTasksTable = async () => {
        await AppDataSource.query('DROP TABLE IF EXISTS tasks;');
        await AppDataSource.query(`
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_name TEXT NOT NULL,
                start_time INTEGER NOT NULL,
                end_time INTEGER,
                duration INTEGER,
                reflection TEXT,
                pre_project_id INTEGER,
                rating INTEGER CHECK(rating >= 1 AND rating <= 3)
            );
        `);
        console.log('Tasks table reset');
    };

    const handleImportTestTasks = async () => {
        try {
            const tasks = require('../data/test-tasks.json');
            for (const task of tasks) {
                await addTask(task);
            }
            console.log('测试数据已批量导入');
        } catch (e) {
            console.error('导入测试数据失败', e);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.text}>About screen</Text>
            <Button title="添加任务" onPress={handleAddTask} />
            <Button title="获取任务" onPress={handleGetTasks} />
            <Button title="更新任务" onPress={handleUpdateTask} />
            <Button title="重建任务表（开发用）" onPress={handleResetTasksTable} />
            <Button title="批量导入测试数据" onPress={handleImportTestTasks} />
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
