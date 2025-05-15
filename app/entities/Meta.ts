import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity("meta")
export class Meta {
    @PrimaryColumn({ type: "text" })
    key?: string;

    @Column({ type: "text" })
    value?: string;
}
