import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";

@Entity()
export class ChatMessageEntity {
  /** 用户ID，主键自增 */
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar" })
  @Index()
  sessionId!: string;

  /** 对话名称 */
  @Column({ type: "varchar" })
  name!: string;

  /** 对话内容 */
  @Column({ type: "text" })
  message!: string;

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
