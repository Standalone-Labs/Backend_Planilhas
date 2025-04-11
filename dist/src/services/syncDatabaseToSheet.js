"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const sheets_1 = __importDefault(require("../config/sheets"));
const Historico_De_Envio_1 = __importDefault(require("../models/Historico_De_Envio"));
const syncDatabaseWithSheets = async () => {
    try {
        console.log("⏳ Sincronizando...");
        const { googleSheets, auth, spreadsheetId } = await (0, sheets_1.default)();
        const sheetList = await googleSheets.spreadsheets.get({
            auth,
            spreadsheetId,
        });
        const abas = (sheetList.data.sheets ?? [])
            .map(sheet => sheet.properties?.title || "")
            .filter(title => title !== "FOLHA");
        const registrosPlanilha = new Set();
        for (const aba of abas) {
            const response = await googleSheets.spreadsheets.values.get({
                auth,
                spreadsheetId,
                range: `'${aba}'`,
                valueRenderOption: "UNFORMATTED_VALUE",
                dateTimeRenderOption: "FORMATTED_STRING",
            });
            const valores = response.data.values ?? [];
            const linhasParaRemover = [];
            const chavesDetectadas = new Set();
            valores.slice(2).forEach((linha, index) => {
                const isEmpty = linha.every(cell => cell === undefined || cell === null || String(cell).trim() === "");
                if (isEmpty) {
                    linhasParaRemover.push(index + 2);
                    return;
                }
                const origem = String(linha[1] ?? "").trim();
                const destino = String(linha[2] ?? "").trim();
                const patrimonios = linha.slice(3, 13)
                    .filter(p => p !== "" && p !== undefined)
                    .map(Number);
                const chaveUnica = `${origem}-${destino}-${patrimonios.join(",")}`;
                if (chavesDetectadas.has(chaveUnica)) {
                    linhasParaRemover.push(index + 2);
                }
                else {
                    chavesDetectadas.add(chaveUnica);
                }
            });
            if (linhasParaRemover.length > 0) {
                const sheetId = sheetList.data.sheets?.find(s => s.properties?.title === aba)?.properties?.sheetId;
                if (sheetId !== undefined) {
                    const requests = linhasParaRemover.sort((a, b) => b - a).map(index => ({
                        deleteDimension: {
                            range: {
                                sheetId,
                                dimension: "ROWS",
                                startIndex: index,
                                endIndex: index + 1
                            }
                        }
                    }));
                    await googleSheets.spreadsheets.batchUpdate({
                        auth,
                        spreadsheetId,
                        requestBody: { requests }
                    });
                    console.log(`🧹 ${linhasParaRemover.length} linha(s) removida(s) da aba "${aba}"`);
                }
            }
            const atualizada = await googleSheets.spreadsheets.values.get({
                auth,
                spreadsheetId,
                range: `'${aba}'`,
                valueRenderOption: "UNFORMATTED_VALUE",
                dateTimeRenderOption: "FORMATTED_STRING",
            });
            const valoresAtualizados = atualizada.data.values ?? [];
            const dados = valoresAtualizados.slice(2).map(item => ({
                data: String(item[0] ?? ""),
                origem: String(item[1] ?? ""),
                destino: String(item[2] ?? ""),
                patrimonios: item.slice(3, 13).filter(p => p !== "" && p !== undefined).map(Number),
                descricao: String(item[13] ?? ""),
            }));
            for (const row of dados) {
                const chaveUnica = `${row.origem}-${row.destino}-${row.patrimonios.join(",")}`;
                registrosPlanilha.add(chaveUnica);
                const existe = await Historico_De_Envio_1.default.findOne({
                    origem: row.origem,
                    destino: row.destino,
                    patrimonios: row.patrimonios,
                });
                if (!existe) {
                    await Historico_De_Envio_1.default.create({ ...row, deletado: false });
                }
                else if (existe.deletado) {
                    await Historico_De_Envio_1.default.updateOne({ _id: existe._id }, { deletado: false });
                }
            }
        }
        const todos = await Historico_De_Envio_1.default.find();
        for (const doc of todos) {
            const chaveDoc = `${doc.origem}-${doc.destino}-${doc.patrimonios.join(",")}`;
            if (!registrosPlanilha.has(chaveDoc) && !doc.deletado) {
                await Historico_De_Envio_1.default.updateOne({ _id: doc._id }, { deletado: true });
            }
        }
        console.log("✅ Sincronização concluída.");
    }
    catch (error) {
        console.error("❌ Erro na sincronização:", error);
    }
};
node_cron_1.default.schedule("*/30 * * * *", syncDatabaseWithSheets);
