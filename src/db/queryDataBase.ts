import { AppDataSource } from "./data-source";

export const queryDataFormat = async () => {
    const query = `
    SELECT 
        d.calculo AS 'Código',
        d.reclamante AS 'Reclamante',
        d.reclamado AS 'Reclamada',
        d.processo AS 'Número do processo',
        d.periodoCalculo AS 'Período cálculo',
        DATE_FORMAT(d.dataAjuizamento, '%d/%m/%Y') AS 'Data do ajuizamento',
        DATE_FORMAT(d.dataLiquidacao, '%d/%m/%Y') AS 'Data da liquidação',
        r.descricao AS 'Verbas',
        REPLACE(FORMAT(SUM(r.valor), 2), '.', ',') AS 'Valor corrigido',
        REPLACE(FORMAT(SUM(r.juros), 2), '.', ',') AS 'Juros',
        REPLACE(FORMAT(SUM(r.total), 2), '.', ',') AS 'Valor Total'
    FROM 
        calculo.resumo_calculo r
    INNER JOIN 
        calculo.dados_processo d 
        ON r.dadosProcessoId = d.id
    GROUP BY 
        d.calculo,
        d.reclamante,
        d.reclamado,
        d.processo,
        d.periodoCalculo,
        d.dataAjuizamento,
        d.dataLiquidacao,
        r.descricao
`;

const result = await AppDataSource.manager.query(query)
return result
}