import { Entity, PrimaryGeneratedColumn, Column,JoinColumn, ManyToOne} from "typeorm"
import { DadosProcesso } from "./DadosProcesso"

@Entity()
export class provimentoGeral {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    descricao: string

    @Column("double")
    valor: number
    
    @ManyToOne(() => DadosProcesso)
    @JoinColumn({ name: 'dadosProcessoId' })
    dadosProcesso: DadosProcesso;
  
  }