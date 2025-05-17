import * as SQLite from "expo-sqlite";
import "reflect-metadata"; // 必须导入以支持 TypeORM 装饰器
import { DataSource } from "typeorm";
import { Meta } from "./entities/Meta"; // 引入 Meta 实体
import { Project } from "./entities/Project"; // 引入 Project 实体
import { Task } from "./entities/Task"; // 引入 Task 实体

// 配置 TypeORM 数据源
export const AppDataSource = new DataSource({
    type: "expo", // 使用 Expo 的 SQLite 驱动
    driver: SQLite,
    database: "app.db", // 数据库名称
    entities: [Task, Meta, Project], // 注册实体，添加 Project
    synchronize: true, // 自动同步数据库结构（开发环境使用）
});

const CURRENT_DB_VERSION = 3; // 当前数据库版本号，已更新为3

// 全局变量保存当前任务ID
export let globalCurrentTaskId: number | null = null;

// 初始化数据库
export const initializeDatabase = async () => {
    try {
        await AppDataSource.initialize();

        // 1. 创建 meta 表（如不存在）
        await AppDataSource.query(`
            CREATE TABLE IF NOT EXISTS meta (
                key TEXT PRIMARY KEY,
                value TEXT
            );
        `);

        // 1.1 初始化 current_task_id（如不存在）
        const currentTaskIdResult = await AppDataSource.query(`SELECT value FROM meta WHERE key = 'current_task_id';`);
        if (currentTaskIdResult.length === 0) {
            await AppDataSource.query(`INSERT OR IGNORE INTO meta (key, value) VALUES ('current_task_id', '1');`);
            globalCurrentTaskId = 1;
        } else {
            const val = currentTaskIdResult[0].value;
            globalCurrentTaskId = val === null || val === undefined ? null : Number(val);
        }

        // 2. 获取当前数据库版本号
        const result = await AppDataSource.query(`SELECT value FROM meta WHERE key = 'db_version';`);
        let dbVersion = result.length > 0 ? parseInt(result[0].value, 10) : 0;

        // 3. 逐步升级数据库结构
        if (dbVersion < 1) {
            // v1: 创建 tasks 表
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
            dbVersion = 1;
        }
        // v2: 创建 project 表
        if (dbVersion < 2) {
            await AppDataSource.query(`
                CREATE TABLE IF NOT EXISTS project (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    serial_number INTEGER NOT NULL
                );
            `);
            dbVersion = 2;
        }
        // v3: project 表添加描述字段
        if (dbVersion < 3) {
            await AppDataSource.query(`ALTER TABLE project ADD COLUMN description TEXT;`);
            dbVersion = 3;
        }
        // 未来如有 v4 升级，可在此添加
        // if (dbVersion < 4) { ... }

        // 4. 更新 meta 表中的 db_version
        await AppDataSource.query(`INSERT OR REPLACE INTO meta (key, value) VALUES ('db_version', ?);`, [CURRENT_DB_VERSION.toString()]);

        console.log("Database initialized and migrated successfully");
    } catch (error) {
        console.error("Error initializing database:", error);
        throw error;
    }
};



