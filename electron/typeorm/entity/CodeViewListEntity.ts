import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { ViewProjectEntity } from "./ViewProjectEntity";

@Entity()
export class CodeViewListEntity {
  /** 记录ID，主键自增 */
  @PrimaryGeneratedColumn()
  id!: number;

  // 对应的项目id (外键字段)
  @Column({ type: "varchar" })
  projectId!: string;

  // 关联的项目实体，多个 CodeView 记录对应一个项目
  @ManyToOne(() => ViewProjectEntity, (project) => project.codeViews)
  @JoinColumn({ name: "projectId", referencedColumnName: "projectId" })
  project!: ViewProjectEntity;

  // 项目名称
  @Column({ type: "varchar" })
  projectName!: string;

  // view时的路径
  @Column({ type: "varchar" })
  projectPath!: string;

  // view的hash
  @Column({ type: "varchar" })
  viewHash!: string;

  // ai view结果
  @Column({ type: "varchar" })
  viewResult!: string;

  /** 是否删除 */
  @Column({ type: "boolean", default: false })
  isDelete!: boolean;

  /** 创建时间 */
  @CreateDateColumn()
  createTime!: Date;

  /** 更新时间 */
  @UpdateDateColumn()
  updateTime!: Date;
}
