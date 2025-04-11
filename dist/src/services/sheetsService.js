"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRowsFromSheet = exports.addRowToSheet = void 0;
const sheets_utils_1 = require("../utils/sheets.utils");
const sheets_1 = __importDefault(require("../config/sheets"));
const date_fns_1 = require("date-fns");
const pt_BR_1 = require("date-fns/locale/pt-BR");
const addRowToSheet = async (rowData, parsedDate) => {
    const { googleSheets, auth, spreadsheetId } = await (0, sheets_1.default)();
    const sheets = await googleSheets.spreadsheets.get({ auth, spreadsheetId });
    const sheetsData = sheets.data.sheets ?? [];
    const nomeAba = (0, sheets_utils_1.formatNamePage)(parsedDate);
    const folhaSheet = (0, sheets_utils_1.findSheetByTitle)(sheetsData, "FOLHA");
    if (!folhaSheet)
        throw new Error("A aba 'FOLHA' não existe.");
    if (!(0, sheets_utils_1.findSheetByTitle)(sheetsData, nomeAba)) {
        await (0, sheets_utils_1.createSheetFromTemplate)(googleSheets, spreadsheetId, folhaSheet.properties.sheetId, nomeAba);
    }
    await googleSheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${nomeAba}!A1`,
        valueInputOption: "RAW",
        requestBody: { values: [[nomeAba]] },
    });
    const dados = [
        rowData.data,
        rowData.origem,
        rowData.destino,
        ...rowData.patrimonios,
    ];
    while (dados.length < 13)
        dados.push("");
    dados.push(rowData.descricao || "");
    const response = await googleSheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${nomeAba}`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [dados] },
    });
    return response.data;
};
exports.addRowToSheet = addRowToSheet;
const getRowsFromSheet = async (data) => {
    if (!data)
        throw new Error("Data é obrigatória");
    const parsedDate = (0, date_fns_1.parse)(data, "dd/MM/yyyy", new Date());
    if (!(0, date_fns_1.isValid)(parsedDate))
        throw new Error("Data inválida");
    const { googleSheets, auth, spreadsheetId } = await (0, sheets_1.default)();
    const nomeMes = (0, date_fns_1.format)(parsedDate, "MMMM", { locale: pt_BR_1.ptBR }).slice(0, 3).toUpperCase();
    const anoAbreviado = (0, date_fns_1.format)(parsedDate, "yy");
    const nomeAba = `${nomeMes} ${anoAbreviado}`;
    // Verifica se a aba existe
    const sheetList = await googleSheets.spreadsheets.get({
        auth,
        spreadsheetId,
    });
    const abaExiste = sheetList.data.sheets?.some((sheet) => sheet.properties?.title === nomeAba);
    if (!abaExiste) {
        throw new Error(`A aba "${nomeAba}" não existe na planilha.`);
    }
    const sheetResponse = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId,
        range: `'${nomeAba}'`, // <- nome com aspas simples para suportar espaços
        valueRenderOption: "UNFORMATTED_VALUE",
        dateTimeRenderOption: "FORMATTED_STRING",
    });
    const valores = sheetResponse.data.values ?? [];
    return valores.slice(2).map((item = []) => ({
        data: String(item[0] ?? ""),
        origem: String(item[1] ?? ""),
        destino: String(item[2] ?? ""),
        patrimonios: item
            .slice(3, 13)
            .filter((p) => p !== "" && p !== undefined)
            .map(Number),
        descricao: String(item[13] ?? ""),
    }));
};
exports.getRowsFromSheet = getRowsFromSheet;
