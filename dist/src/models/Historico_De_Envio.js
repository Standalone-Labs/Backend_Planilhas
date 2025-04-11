"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const HistoricoSchema = new mongoose_1.Schema({
    data: { type: String, required: true },
    origem: { type: String, required: true },
    destino: { type: String, required: true },
    patrimonios: [{ type: String }],
    descricao: { type: String, required: false },
    deletado: { type: Boolean, default: false },
    inseridoPor: { type: String }
}, {
    timestamps: true,
    versionKey: false
});
const HistoricoModel = (0, mongoose_1.model)('historicoenvios', HistoricoSchema);
exports.default = HistoricoModel;
