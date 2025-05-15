import * as SQLite from "expo-sqlite";
import "reflect-metadata"; // 必须导入以支持 TypeORM 装饰器
import { DataSource } from "typeorm";
import { Meta } from "./entities/Meta"; // 引入 Meta 实体
import { Task } from "./entities/Task"; // 引入 Task 实体

// 配置 TypeORM 数据源
export const AppDataSource = new DataSource({
    type: "expo", // 使用 Expo 的 SQLite 驱动
    driver: SQLite,
    database: "app.db", // 数据库名称
    entities: [Task, Meta], // 注册实体
    synchronize: true, // 自动同步数据库结构（开发环境使用）
});

const CURRENT_DB_VERSION = 1; // 当前数据库版本号，可根据需要递增

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
        // 未来如有 v2、v3 升级，可在此添加
        // if (dbVersion < 2) { ... }

        // 4. 更新 meta 表中的 db_version
        await AppDataSource.query(`INSERT OR REPLACE INTO meta (key, value) VALUES ('db_version', ?);`, [CURRENT_DB_VERSION.toString()]);

        console.log("Database initialized and migrated successfully");
    } catch (error) {
        console.error("Error initializing database:", error);
        throw error;
    }
};



