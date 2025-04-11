"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRows = exports.addRow = void 0;
const sheets_utils_1 = require("../utils/sheets.utils");
const sheets_services_1 = __importDefault(require("../services/sheets.services"));
const date_fns_1 = require("date-fns");
const locale_1 = require("date-fns/locale");
const addRow = async (req, res, next) => {
    const { googleSheets, auth, spreadsheetId } = await (0, sheets_services_1.default)();
    const { data, origem, destino, patrimonios, descricao } = req.body;
    const values = [[data, origem, destino, ...patrimonios]];
    const sheets = await googleSheets.spreadsheets.get({ auth, spreadsheetId });
    const sheetsData = sheets.data.sheets ?? [];
    try {
        if (!data || !origem || !destino || !Array.isArray(patrimonios)) {
            res.status(400).json({ error: "Dados inválidos" });
            return;
        }
        const parsedDate = (0, date_fns_1.parse)(data, "dd/MM/yyyy", new Date());
        if (!(0, date_fns_1.isValid)(parsedDate)) {
            res.status(400).json({ error: "Data inválida" });
            return;
        }
        if (patrimonios.length > 10) {
            res.status(400).json({ error: "Não é possível enviar mais que 10 patrimônios" });
            return;
        }
        const nomeAba = (0, sheets_utils_1.formatNamePage)(parsedDate);
        const folhaSheet = (0, sheets_utils_1.findSheetByTitle)(sheetsData, "FOLHA");
        if (!folhaSheet) {
            res.status(400).json({ error: "A aba 'FOLHA' não existe." });
            return;
        }
        if (!(0, sheets_utils_1.findSheetByTitle)(sheetsData, nomeAba)) {
            await (0, sheets_utils_1.createSheetFromTemplate)(googleSheets, spreadsheetId, folhaSheet.properties.sheetId, nomeAba);
        }
        await googleSheets.spreadsheets.values.update({
            spreadsheetId,
            range: `${nomeAba}!A1`,
            valueInputOption: "RAW",
            requestBody: { values: [[nomeAba]] }
        });
        // Prepara os valores garantindo 13 colunas antes da descrição
        const dados = [data, origem, destino, ...patrimonios];
        while (dados.length < 13)
            dados.push("");
        dados.push(descricao || ""); // coluna N
        const values = [dados];
        const row = await googleSheets.spreadsheets.values.append({
            spreadsheetId,
            range: `${nomeAba}`,
            valueInputOption: "USER_ENTERED",
            requestBody: { values }
        });
        req.body.rowData = row.data;
        next();
    }
    catch (error) {
        console.error("Erro ao adicionar linha:", error);
        res.status(500).json({ error: "Erro interno no servidor" });
    }
};
exports.addRow = addRow;
const getRows = async (req, res, next) => {
    try {
        const { googleSheets, auth, spreadsheetId } = await (0, sheets_services_1.default)();
        const { data } = req.body;
        if (!data) {
            res.status(400).json({ error: "Data é obrigatória" });
            return;
        }
        const parsedDate = (0, date_fns_1.parse)(data, "dd/MM/yyyy", new Date());
        if (!(0, date_fns_1.isValid)(parsedDate)) {
            res.status(400).json({ error: "Data inválida" });
            return;
        }
        const nomeMes = (0, date_fns_1.format)(parsedDate, "MMMM", { locale: locale_1.ptBR }).slice(0, 3).toUpperCase();
        const anoAbreviado = (0, date_fns_1.format)(parsedDate, "yy");
        const nomeAba = `${nomeMes} ${anoAbreviado}`;
        const getRows = await googleSheets.spreadsheets.values.get({
            auth,
            spreadsheetId,
            range: nomeAba,
            valueRenderOption: "UNFORMATTED_VALUE",
            dateTimeRenderOption: "FORMATTED_STRING"
        });
        req.body.rowData = getRows.data.values?.slice(2).map((item) => ({
            data: String(item[0]),
            origem: String(item[1]),
            destino: String(item[2]),
            patrimonios: item.slice(3, 13).filter(p => p !== "").map(p => Number(p)),
            descricao: String(item[13] || "")
        }));
        next();
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ error: "Erro ao consultar tabela" });
        return;
    }
};
exports.getRows = getRows;
