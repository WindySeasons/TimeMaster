import { Repository } from "typeorm";
import { AppDataSource } from "../database";
import { Project } from "../entities/Project";

export class ProjectService {
    private static getRepo(): Repository<Project> {
        return AppDataSource.getRepository(Project);
    }

    static async createProject(name: string, serial_number: number, description?: string): Promise<Project | null> {
        try {
            const repo = this.getRepo();
            const project = repo.create({ name, serial_number, description });
            return await repo.save(project);
        } catch (e) {
            console.error('createProject error:', e);
            return null;
        }
    }

    static async getAllProjects(): Promise<Project[]> {
        try {
            return await this.getRepo().find({ order: { serial_number: "ASC" } });
        } catch (e) {
            console.error('getAllProjects error:', e);
            return [];
        }
    }

    static async getProjectById(id: number): Promise<Project | null> {
        try {
            return await this.getRepo().findOneBy({ id });
        } catch (e) {
            console.error('getProjectById error:', e);
            return null;
        }
    }

    static async updateProject(id: number, data: Partial<Project>): Promise<Project | null> {
        try {
            const repo = this.getRepo();
            const project = await repo.findOneBy({ id });
            if (!project) return null;
            repo.merge(project, data);
            return await repo.save(project);
        } catch (e) {
            console.error('updateProject error:', e);
            return null;
        }
    }

    static async deleteProject(id: number): Promise<boolean> {
        try {
            const repo = this.getRepo();
            const result = await repo.delete(id);
            return (result.affected ?? 0) > 0;
        } catch (e) {
            console.error('deleteProject error:', e);
            return false;
        }
    }
}
