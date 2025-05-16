import { AppDataSource } from "../database";
import { Task } from "../entities/Task";

// 添加任务
export const addTask = async (task: Partial<Task>) => {
    try {
        const newTask: Partial<Task> = {
            ...task,
            start_time: task.start_time ? Math.floor(task.start_time) : 0, // 转换为秒级时间戳
            end_time: task.end_time ? Math.floor(task.end_time) : undefined, // 确保与 TypeORM 类型兼容
        };

        const taskRepository = AppDataSource.getRepository(Task);
        const createdTask = taskRepository.create(newTask);
        return await taskRepository.save(createdTask);
    } catch (error) {
        console.error("Error adding task:", error);
        throw error;
    }
};

// 获取所有任务
export const getTasks = async () => {
    try {
        const taskRepository = AppDataSource.getRepository(Task);
        const tasks = await taskRepository.find();
        console.log("Tasks fetched successfully:", tasks);
        return tasks;
    } catch (error) {
        console.error("Error fetching tasks:", error);
        throw error;
    }
};

// 按时间范围获取任务
export const getTasksByTimeRange = async (start: number, end: number) => {
    try {
        const taskRepository = AppDataSource.getRepository(Task);
        // 查询 end_time 在 [start, end] 区间的任务
        const tasks = await taskRepository.createQueryBuilder('task')
            .where('task.start_time >= :start', { start })
            .andWhere('task.start_time <= :end', { end })
            .orderBy('task.end_time', 'DESC')
            .getMany();
        return tasks;
    } catch (error) {
        console.error("Error fetching tasks by time range:", error);
        throw error;
    }
};

// 更新任务
export const updateTask = async (id: number, updates: Partial<Task>) => {
    try {
        const taskRepository = AppDataSource.getRepository(Task);
        await taskRepository.update(id, updates);
        console.log("Task updated successfully");
    } catch (error) {
        console.error("Error updating task:", error);
        throw error;
    }
};

// 删除任务
export const deleteTask = async (id: number) => {
    try {
        const taskRepository = AppDataSource.getRepository(Task);
        await taskRepository.delete(id);
        console.log("Task deleted successfully");
    } catch (error) {
        console.error("Error deleting task:", error);
        throw error;
    }
};
