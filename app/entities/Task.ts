import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("tasks")
export class Task {
    @PrimaryGeneratedColumn()
    id: number = 0;

    @Column({ type: "text", nullable: false })
    name: string = "";

    @Column({ type: "text", nullable: false })
    start_time: string = "";

    @Column({ type: "text", nullable: false })
    end_time: string = "";

    @Column({ type: "integer", nullable: false })
    duration: number = 0;

    @Column({ type: "text", nullable: true })
    reflection?: string;

    @Column({ type: "integer", nullable: true })
    rating?: number;
}
