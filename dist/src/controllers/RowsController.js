"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Historico_De_Envio_1 = __importDefault(require("../models/Historico_De_Envio"));
const date_fns_1 = require("date-fns");
const sheetsService_1 = require("../services/sheetsService");
class RowController {
    post = async (req, res) => {
        const { data, destino, origem, patrimonios, descricao, inseridoPor, } = req.body;
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
            res
                .status(400)
                .json({ error: "Não é possível enviar mais que 10 patrimônios" });
            return;
        }
        const result = await (0, sheetsService_1.addRowToSheet)({ data, origem, destino, patrimonios, descricao }, parsedDate);
        await Historico_De_Envio_1.default.create({
            data,
            destino,
            origem,
            patrimonios,
            inseridoPor,
            descricao,
        });
        res.status(200).json(result);
    };
    get = async (req, res) => {
        const data = req.body.data;
        try {
            const registros = await Historico_De_Envio_1.default.find({
                data,
                deletado: false,
            });
            if (registros.length < 1) {
                res.status(500).json({
                    erro: "Não existe registro neste dia...",
                });
                return;
            }
            res.status(200).json(registros);
            return;
        }
        catch (error) {
            res.status(500).json({
                erro: "Erro ao buscar registro do dia...",
            });
        }
    };
    getAll = async (req, res) => {
        const { data } = req.body;
        const [dia, mes, ano] = data.split("/");
        const chaveMesAno = `${mes}/${ano}`;
        try {
            const registros = await Historico_De_Envio_1.default.find({
                data: { $regex: new RegExp(`^\\d{2}/${chaveMesAno}`) },
                deletado: false,
            });
            res.json(registros);
        }
        catch (err) {
            res.status(500).json({ error: "Erro ao buscar registros do mês" });
        }
    };
    delete = async (req, res) => {
        res.status(404).json({
            message: "Não disponivel",
        });
    };
    update = async (req, res) => {
        res.status(404).json({
            message: "Não disponivel",
        });
    };
}
exports.default = new RowController();
