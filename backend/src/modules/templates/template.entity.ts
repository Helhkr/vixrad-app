import { Column, Entity, Index, PrimaryColumn } from "typeorm";

export enum TemplateStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

@Entity({ name: "templates" })
@Index(["modality", "region", "version"], { unique: true })
export class TemplateEntity {
  @PrimaryColumn({ type: "varchar", length: 64 })
  id!: string;

  @Column({ type: "varchar", length: 32 })
  modality!: string;

  @Column({ type: "varchar", length: 64 })
  region!: string;

  @Column({ type: "text", name: "base_text" })
  baseText!: string;

  @Column({ type: "varchar", length: 16 })
  version!: string;

  @Column({ type: "enum", enum: TemplateStatus, default: TemplateStatus.ACTIVE })
  status!: TemplateStatus;
}
