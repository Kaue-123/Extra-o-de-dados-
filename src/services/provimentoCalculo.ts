type IProvimento = {
    Descricao: string;
    Valor: number;
    Tipo?: string;
};

const convertParenthesesToNumber = (value) => {
    const match = value.match(/\(([^)]+)\)/);
    const endsWithNumberOrPorcent = /\(\s*\d+(\.\d+)?\s*%\s*\)/.test(value.trim());
    if (match && !endsWithNumberOrPorcent) {
        const num = parseFloat(match[1].replace('.', '').replace(',', '.'));
        if (isNaN(num)) {
            return value;
        }
        return -num
    }
    return value
}

export const extractProviment = (text: string): IProvimento[] => {
    const beginWord = "VERBAS";
    const beginWordSub = "Descrição de Créditos e Descontos do Reclamante";
    const endWord = "Critério de Cálculo e Fundamentação Legal";
    const stopToggle = "Líquido Devido ao Reclamante"

    const tableArray: Array<any> = text.replace(/\n/g, '|')
        .replace(/ {3,}/g, '')
        .split('|')
        .filter(v => v.trim() !== "")
        .map(v => {
            const trimmedValue = v.trim()

            const num = parseFloat(v.trim()
            .replace(/\./g, '')
            .replace(/\,/g, '.'));
            if (isNaN(num)) {
                return convertParenthesesToNumber(trimmedValue);
            } else {
                return num
            }

        });
    const initialIndex = tableArray.indexOf(beginWord);
    const initialIndexSub = tableArray.indexOf(beginWordSub)
    
    const endIndex = tableArray
        .findIndex(item => item
            .toString().
            trim()
            .toLocaleLowerCase()
            .includes(endWord.toLocaleLowerCase()));

    const startIndex = initialIndex !== -1 ? initialIndex : initialIndexSub;
    if (startIndex === -1) {
        return [];
    }
    const x = tableArray.slice(startIndex, endIndex);
    const finalArray: Array<[string, number]> = [];
    let tempArray: [string, number] | null = null;

    x.forEach((item, index) => {
        if (typeof item === 'string' && (index + 1 < x.length) && typeof x[index + 1] === 'number') {
            tempArray = [item, x[index + 1] as number];
            finalArray.push(tempArray);
        }
    });
    // Adicionar alternancia a cada dois elementos para separa-los em dois arrays para as tabelas.
    const provimentoArr: IProvimento[] = [];
    let toggle = true;
    let stopToggleFound = false;

    finalArray.forEach((item, index) => {
        const provimento: IProvimento = {
            Descricao: item[0],
            Valor: item[1]
        }

        if (provimento.Descricao.includes(stopToggle)) {
            stopToggleFound = true;
        }
        if (!stopToggleFound) {
            if (index % 2 < 1) {
                provimento.Tipo = "reclamante"
            } else {
                provimento.Tipo = "reclamada"
            }
        } else {
            provimento.Tipo = "reclamante"
        }
        provimentoArr.push(provimento)
    });
    console.log(provimentoArr)
    return provimentoArr;
}