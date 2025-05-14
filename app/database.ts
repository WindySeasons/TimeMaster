import * as SQLite from 'expo-sqlite';

// 打开或创建数据库（异步操作）
const dbPromise = SQLite.openDatabaseAsync('app.db');

// 导出一个函数来获取数据库实例
export const getDatabase = async () => {
    return await dbPromise;
};

// 初始化数据库表
export const initializeDatabase = async () => {
    const db = await dbPromise;

    // 创建表（如果不存在）
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            end_time TEXT NOT NULL,
            duration INTEGER NOT NULL,
            reflection TEXT,
            rating INTEGER CHECK(rating >= 1 AND rating <= 5)
        );
    `);



    console.log('Database initialized successfully');
};

export const addTask = async (task: {
    name: string;
    start_time: string; // 新增字段
    end_time: string;
    duration: number;
    reflection?: string;
    rating?: number;
}) => {
    try {
        const db = await dbPromise;
        await db.runAsync(
            `INSERT INTO tasks (name, start_time, end_time, duration, reflection, rating) VALUES (?, ?, ?, ?, ?, ?);`,
            [
                task.name,
                task.start_time, // 新增字段
                task.end_time,
                task.duration,
                task.reflection ?? null,
                task.rating ?? null
            ]
        );
        console.log('Task added successfully');
    } catch (error) {
        console.error('Database insert error:', error);
        throw error;
    }
};

export const getTasks = async () => {
    try {
        const db = await dbPromise;
        const result = await db.getAllAsync(`SELECT * FROM tasks;`);
        return result;
    } catch (error) {
        console.error('Failed to fetch tasks:', error);
        throw error;
    }
};

export const updateTask = async (id: number, updates: Partial<{
    name: string;
    start_time: string; // 新增字段
    end_time: string;
    duration: number;
    reflection: string;
    rating: number;
}>) => {
    try {
        const db = await dbPromise;
        const fields = Object.keys(updates).map(k => `${k} = ?`).join(', ');
        const values = Object.values(updates);
        await db.runAsync(
            `UPDATE tasks SET ${fields} WHERE id = ?;`,
            [...values, id]
        );
        console.log('Task updated successfully');
    } catch (error) {
        console.error('Update failed:', error);
        throw error;
    }
};

export const modifyDatabaseSchema = async () => {
    const db = await dbPromise;

    // 检查表结构
    const result = await db.getAllAsync(`PRAGMA table_info(tasks);`);
    const columns = result.map((row: any) => row.name);

    // 动态添加新字段
    if (!columns.includes('new_column')) {
        await db.execAsync(`ALTER TABLE tasks ADD COLUMN new_column TEXT DEFAULT '';`);
        console.log('Added new_column to tasks table');
    }
};

