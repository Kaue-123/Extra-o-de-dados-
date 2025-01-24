import { AppDataSource } from "../db/data-source";
import { DadosProcesso } from '../entity/DadosProcesso'
import { extractData, extractHeader } from '../services/headerCalculo'
import { extractProviment } from "../services/provimentoCalculo"
import { extractResume } from "../services/resumoCalculo"
import { dateFromPtToEn, readFiles } from '../utils/util';
import { ResumoCalculo } from "../entity/ResumoCalculo"
import { ProvimentoGeral } from "../entity/provimentoGeral"
import { join } from 'path'
import { SaveTimeEntity } from "../entity/SaveAt";
import "reflect-metadata"
import "dotenv/config"

export const processDataInitialize = async () => {
    try {
        const filesList = readFiles(process.env.REPORT_DIR);

        if (filesList.length > 0) {
            filesList.forEach(async file => {
                const rawData = await extractData(join(process.env.REPORT_DIR, file));
                //const rawData = readFileSync('C:\\Users\\kaue\\Desktop\\Tsc\\planilhas1\\anderson.txt', { encoding: 'utf8', flag: 'r' });
                const header = extractHeader(rawData);
                const dataAjuizamento = dateFromPtToEn(header.dataAjuizamento);
                const dataLiquidacao = dateFromPtToEn(header.dataLiquidacao);
                const periodoCalculo = dateFromPtToEn(header.periodoCalculo);

                const dadosProcesso = new DadosProcesso();
                dadosProcesso.calculo = header.calculo;
                if (dataAjuizamento) {
                    dadosProcesso.dataAjuizamento = new Date(dataAjuizamento);
                }
                if (dataLiquidacao) {
                    dadosProcesso.dataAjuizamento = new Date(dataLiquidacao);
                }
                if (periodoCalculo) {
                    dadosProcesso.dataAjuizamento = new Date(periodoCalculo);
                }
                dadosProcesso.reclamado = header.reclamado;
                dadosProcesso.reclamante = header.reclamante;
                dadosProcesso.processo = header.processo;

                console.log(dadosProcesso.reclamante);

                await AppDataSource.manager.query("DELETE FROM resumo_calculo WHERE dadosProcessoId = (SELECT id FROM dados_processo WHERE processo = ? LIMIT 1)", dadosProcesso.processo as any);
                await AppDataSource.manager.query("DELETE FROM provimento_geral WHERE dadosProcessoId = (SELECT id FROM dados_processo WHERE processo = ? LIMIT 1)", dadosProcesso.processo as any);
                await AppDataSource.manager.query("DELETE FROM dados_processo WHERE processo = ?", dadosProcesso.processo as any);

                await AppDataSource.manager.save(dadosProcesso);

                const saveTime = new SaveTimeEntity()
                saveTime.dadosProcesso = dadosProcesso;
                await AppDataSource.manager.save(saveTime);

                const resume = extractResume(rawData);
                let index = 1;
                if (resume.length > 0) {
                    for (let row of resume) {
                        let resumoCalculo = new ResumoCalculo();

                        resumoCalculo.descricao = row.descricao;
                        resumoCalculo.valor = row.valorCorrigido;
                        resumoCalculo.juros = row.juros;
                        resumoCalculo.total = row.total;
                        resumoCalculo.ordem = index;
                        resumoCalculo.dadosProcesso = dadosProcesso;
                        await AppDataSource.manager.save(resumoCalculo);
                        index++;
                    }
                }
                const provi = extractProviment(rawData);
                index = 1;
                if (provi.length > 1) {
                    for (let row of provi) {
                        let dadosProvi = new ProvimentoGeral()

                        dadosProvi.descricao = row.Descricao;
                        dadosProvi.valor = row.Valor;
                        dadosProvi.tipo = row.Tipo;
                        dadosProvi.dadosProcesso = dadosProcesso;
                        dadosProvi.ordem = index;

                        await AppDataSource.manager.save(dadosProvi);
                        index++;
                    }
                }
                console.log(dadosProcesso.reclamante + ' finalizado');
            })
        }
    } catch (error) {
        console.log(error)
    }
}