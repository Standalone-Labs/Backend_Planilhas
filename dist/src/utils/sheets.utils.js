"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSheetFromTemplate = exports.formatNamePage = exports.findSheetByTitle = void 0;
exports.isValidDateString = isValidDateString;
const date_fns_1 = require("date-fns");
const locale_1 = require("date-fns/locale");
// função responsavel por achar o Sheet pelo titulo
const findSheetByTitle = (sheets, title) => {
    return sheets.find(sheet => sheet.properties?.title === title);
};
exports.findSheetByTitle = findSheetByTitle;
// função responsavel por formatar o nome da Pagina
const formatNamePage = (data) => {
    const month = (0, date_fns_1.format)(data, "MMMM", { locale: locale_1.ptBR }).slice(0, 3).toUpperCase();
    const year = (0, date_fns_1.format)(data, "yy");
    return `${month} ${year}`;
};
exports.formatNamePage = formatNamePage;
// Verifica se a string de Data e valida
function isValidDateString(data) {
    const parsed = (0, date_fns_1.parse)(data, "dd/MM/yyyy", new Date());
    return (0, date_fns_1.isValid)(parsed);
}
// função para criar a pagina com base na página folha
const createSheetFromTemplate = async (googleSheets, spreadsheetId, folhaId, newTitle) => {
    const copy = await googleSheets.spreadsheets.sheets.copyTo({
        spreadsheetId,
        sheetId: folhaId,
        requestBody: { destinationSpreadsheetId: spreadsheetId }
    });
    await googleSheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
            requests: [{
                    updateSheetProperties: {
                        properties: {
                            sheetId: copy.data.sheetId,
                            title: newTitle
                        },
                        fields: "title"
                    }
                }]
        }
    });
};
exports.createSheetFromTemplate = createSheetFromTemplate;
