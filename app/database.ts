import * as SQLite from "expo-sqlite";
import "reflect-metadata"; // 必须导入以支持 TypeORM 装饰器
import { DataSource } from "typeorm";
import { Task } from "./entities/Task"; // 引入 Task 实体

// 配置 TypeORM 数据源
export const AppDataSource = new DataSource({
    type: "expo", // 使用 Expo 的 SQLite 驱动
    driver: SQLite,
    database: "app.db", // 数据库名称
    entities: [Task], // 注册实体
    synchronize: true, // 自动同步数据库结构（开发环境使用）
});

// 初始化数据库
export const initializeDatabase = async () => {
    try {
        await AppDataSource.initialize();

        // 删除旧的 tasks 表（如果存在）
        await AppDataSource.query(`DROP TABLE IF EXISTS tasks;`);

        // 创建新的 tasks 表
        await AppDataSource.query(`
            CREATE TABLE tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_name TEXT NOT NULL,
                start_time INTEGER NOT NULL,
                end_time INTEGER ,
                duration INTEGER ,
                reflection TEXT,
                pre_project_id INTEGER,
                rating INTEGER CHECK(rating >= 1 AND rating <= 3)
            );
        `);

        console.log("Database initialized successfully");
    } catch (error) {
        console.error("Error initializing database:", error);
        throw error;
    }
};



