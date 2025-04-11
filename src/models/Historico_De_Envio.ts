import { Schema, model, Document } from "mongoose";

export interface HistoricoEnvio extends Document{
    data: string,
    origem: string,
    destino: string,
    patrimonios: string[],
    descricao: string,
    inseridoPor: string,
    createdAt?: Date,
    deletado: boolean
}

const HistoricoSchema = new Schema<HistoricoEnvio>({
    data: { type: String, required: true },
    origem: { type: String, required: true },
    destino: { type: String, required: true },
    patrimonios: [{type: String}],
    descricao: { type: String, required: false },
    deletado: { type: Boolean, default: false },
    inseridoPor: { type: String }
}, {
    timestamps: true,
    versionKey: false
})

const HistoricoModel = model<HistoricoEnvio>('historicoenvios', HistoricoSchema);
export default HistoricoModel