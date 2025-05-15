import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("tasks")
export class Task {
    @PrimaryGeneratedColumn()
    id: number = 0;


    @Column({ type: "text", nullable: false })
    project_name: string = "DEFAULT";

    @Column({ type: "integer", nullable: false })
    start_time: number = 0;

    @Column({ type: "integer", nullable: true })
    end_time?: number;

    @Column({ type: "integer", nullable: true })
    duration?: number;

    @Column({ type: "text", nullable: true })
    reflection?: string;

    @Column({ type: "integer", nullable: true })
    pre_project_id?: number;

    @Column({ type: "integer", nullable: true })
    rating?: number;
}
