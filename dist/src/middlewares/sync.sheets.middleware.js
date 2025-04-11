"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Historico_De_Envio_1 = require("../models/Historico_De_Envio");
const syncPlanilha = async (req, res, next) => {
    const rows = req.body.rowData;
    if (!rows || !Array.isArray(rows)) {
        res.status(400).json({ erro: "rowData ausente ou inválido" });
        return;
    }
    // Agrupa quantas vezes cada linha aparece na planilha
    const agrupado = new Map();
    for (const row of rows) {
        const key = JSON.stringify({
            data: row.data,
            origem: row.origem,
            destino: row.destino,
            patrimonios: row.patrimonios
        });
        if (!agrupado.has(key))
            agrupado.set(key, []);
        agrupado.get(key)?.push(row);
    }
    // Inativa registros que não estão mais na planilha
    const database = await Historico_De_Envio_1.HistoricoModel.find();
    const keysPlanilha = Array.from(agrupado.keys());
    for (const registro of database) {
        const keyDB = JSON.stringify({
            data: registro.data,
            origem: registro.origem,
            destino: registro.destino,
            patrimonios: [...registro.patrimonios]
        });
        if (!keysPlanilha.includes(keyDB) && registro.ativo) {
            await Historico_De_Envio_1.HistoricoModel.updateOne({ _id: registro._id }, { $set: { ativo: false } });
        }
    }
    // Sincroniza a quantidade exata de registros ativos
    for (const [key, registrosPlanilha] of agrupado.entries()) {
        const dados = JSON.parse(key);
        const existentes = await Historico_De_Envio_1.HistoricoModel.find({
            data: dados.data,
            origem: dados.origem,
            destino: dados.destino,
            patrimonios: dados.patrimonios
        });
        const ativos = existentes.filter(e => e.ativo);
        const inativos = existentes.filter(e => !e.ativo);
        const totalNecessario = registrosPlanilha.length;
        if (ativos.length < totalNecessario) {
            const faltam = totalNecessario - ativos.length;
            // Reativa alguns inativos se existirem
            for (let i = 0; i < Math.min(faltam, inativos.length); i++) {
                await Historico_De_Envio_1.HistoricoModel.updateOne({ _id: inativos[i]._id }, { $set: { ativo: true } });
            }
            // Se ainda faltarem, cria novos
            const aindaFaltam = faltam - inativos.length;
            for (let i = 0; i < aindaFaltam; i++) {
                await Historico_De_Envio_1.HistoricoModel.create({ ...dados, ativo: true });
            }
        }
        else if (ativos.length > totalNecessario) {
            const sobram = ativos.length - totalNecessario;
            for (let i = 0; i < sobram; i++) {
                await Historico_De_Envio_1.HistoricoModel.updateOne({ _id: ativos[i]._id }, { $set: { ativo: false } });
            }
        }
    }
    next();
};
exports.default = syncPlanilha;
