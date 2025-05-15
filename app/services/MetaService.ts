import { AppDataSource } from "../database";
import { Meta } from "../entities/Meta";

export class MetaService {
    static async getValue(key: string): Promise<string | null> {
        const repo = AppDataSource.getRepository(Meta);
        const meta = await repo.findOneBy({ key });
        return meta && meta.value !== undefined ? meta.value : null;
    }

    static async setValue(key: string, value: string): Promise<void> {
        const repo = AppDataSource.getRepository(Meta);
        await repo.save({ key, value });
    }

    static async deleteKey(key: string): Promise<void> {
        const repo = AppDataSource.getRepository(Meta);
        await repo.delete({ key });
    }

    static async getAll(): Promise<Meta[]> {
        const repo = AppDataSource.getRepository(Meta);
        return repo.find();
    }
}
