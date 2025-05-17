import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "project" })
export class Project {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "text" })
    name!: string;

    @Column({ type: "integer" })
    serial_number!: number;

    @Column({ type: "text", nullable: true })
    description?: string;
}
