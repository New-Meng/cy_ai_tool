import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { CodeViewListEntity } from "./CodeViewListEntity";

@Entity()
export class ViewProjectEntity {
  /** 项目ID，主键自增 */
  @PrimaryGeneratedColumn()
  id!: number;

  // git 对应的唯一id
  @Column({ unique: true, type: "varchar" })
  projectId!: string;

  /** 项目名称 */
  @Column({ type: "varchar" })
  projectName!: string;

  // 关联的 CodeView 记录列表，一个项目对应多条记录
  @OneToMany(() => CodeViewListEntity, (codeView) => codeView.project)
  codeViews!: CodeViewListEntity[];

  @Column({ type: "varchar" })
  projectPath!: string;

  /** 创建时间 */
  @CreateDateColumn()
  createTime!: Date;

  /** 更新时间 */
  @UpdateDateColumn()
  updateTime!: Date;
}
