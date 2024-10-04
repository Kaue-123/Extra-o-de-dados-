import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm"
import { ResumoCalculo } from "./ResumoCalculo"
import { ProvimentoGeral } from "./provimentoGeral"

@Entity()
export class DadosProcesso {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    processo: string

    @Column()
    calculo: string

    @Column()
    reclamante: string

    @Column()
    reclamado: string

    @Column({ type: 'date', nullable: true} )
    periodoCalculo: Date

    @Column( { type: 'date', nullable: true} )
    dataAjuizamento: Date

    @Column( { type: 'date', nullable: true} ) 
    dataLiquidacao: Date
    
    @OneToMany(() => ResumoCalculo, resumoCalculo => resumoCalculo.dadosProcesso)
    reclamanteResumoCalculo: ResumoCalculo[]

    @OneToMany(() => ProvimentoGeral, ProvimentoGeral => ProvimentoGeral.dadosProcesso)
    reclamanteProvimento: ProvimentoGeral[]

}