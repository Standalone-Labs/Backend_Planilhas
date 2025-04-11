"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Historico_De_Envio_1 = require("../models/Historico_De_Envio");
class RowController {
    constructor() {
        this.post = async (req, res) => {
            const { data, destino, origem, patrimonios, descricao } = req.body;
            await Historico_De_Envio_1.HistoricoModel.create({
                data, destino, origem, patrimonios, descricao
            });
            res.status(200).json(req.body);
        };
        this.get = async (req, res) => {
            const data = req.body.data;
            if (!data) {
                res.status(400).json({ erro: "Parâmetro 'data' é obrigatório" });
                return;
            }
            try {
                const registros = await Historico_De_Envio_1.HistoricoModel.find({
                    data,
                    ativo: true
                });
                if (registros.length <= 0) {
                    res.status(404).json({ message: "Não foram encontrados envios para planilha neste dia..." });
                    return;
                }
                res.status(200).json(registros);
            }
            catch (error) {
                res.status(500).json({ erro: "Erro ao buscar registros", detalhes: error });
            }
        };
        this.getAll = async (req, res) => {
            const data = req.body.data;
            if (!data) {
                res.status(400).json({ erro: "Parâmetro 'data' é obrigatório" });
                return;
            }
            try {
                const mesEAno = data.slice(3); // ex: "04/2025"
                const registros = await Historico_De_Envio_1.HistoricoModel.find({
                    data: new RegExp(mesEAno), // busca parcial por "/04/2025"
                    ativo: true
                });
                if (registros.length <= 0) {
                    res.status(404).json({ message: "Não foram encontrados envios para planilha neste mês..." });
                    return;
                }
                res.status(200).json(registros);
            }
            catch (error) {
                res.status(500).json({ erro: "Erro ao buscar registros", detalhes: error });
            }
        };
        this.delete = async (req, res) => {
            res.status(404).json({
                message: "Não disponivel"
            });
        };
        this.update = async (req, res) => {
            res.status(404).json({
                message: "Não disponivel"
            });
        };
    }
}
exports.default = new RowController();
