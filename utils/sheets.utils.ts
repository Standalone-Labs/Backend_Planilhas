import { sheets_v4 } from "googleapis";
import { format, parse, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";


// função responsavel por achar o Sheet pelo titulo
export const findSheetByTitle = (sheets: sheets_v4.Schema$Sheet[], title: string) => {
    return sheets.find(sheet => sheet.properties?.title === title);
}


// função responsavel por formatar o nome da Pagina
export const formatNamePage = (data: Date): string => {
    const month = format(data, "MMMM", { locale: ptBR }).slice(0, 3).toUpperCase();
    const year = format(data, "yy");
    return `${month} ${year}`;
}

// Verifica se a string de Data e valida
export function isValidDateString(data: string): boolean {
    const parsed = parse(data, "dd/MM/yyyy", new Date());
    return isValid(parsed);
}


// função para criar a pagina com base na página folha
export const createSheetFromTemplate = async (
    googleSheets: sheets_v4.Sheets,
    spreadsheetId: string,
    folhaId: number,
    newTitle: string
) => {
    const copy = await googleSheets.spreadsheets.sheets.copyTo({
        spreadsheetId,
        sheetId: folhaId,
        requestBody: { destinationSpreadsheetId: spreadsheetId }
    })

    await googleSheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
            requests: [{
                updateSheetProperties: {
                    properties: {
                        sheetId: copy.data.sheetId!,
                        title: newTitle
                    },
                    fields: "title"
                }
            }]
        }
    })
}