import { AppDataSource } from "../database";
import { Task } from "../entities/Task";

// 添加任务
export const addTask = async (task: Partial<Task>) => {
    try {
        const taskRepository = AppDataSource.getRepository(Task);
        const newTask = taskRepository.create(task);
        await taskRepository.save(newTask);
        console.log("Task added successfully:", newTask);
        return newTask;
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
