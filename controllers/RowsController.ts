import Controller from "../interfaces/Controller";
import { Request, Response } from "express";
import HistoricoModel from "../models/Historico_De_Envio";
import RowData from "../interfaces/RowData";
import { isValid, parse } from "date-fns";
import { addRowToSheet } from "../services/sheetsService";

class RowController implements Controller {
  post = async (req: Request, res: Response) => {
    const {
      data,
      destino,
      origem,
      patrimonios,
      descricao,
      inseridoPor,
    }: RowData = req.body;

    if (!data || !origem || !destino || !Array.isArray(patrimonios)) {
      res.status(400).json({ error: "Dados inválidos" });
      return;
    }

    const parsedDate = parse(data, "dd/MM/yyyy", new Date());
    if (!isValid(parsedDate)) {
      res.status(400).json({ error: "Data inválida" });
      return;
    }

    if (patrimonios.length > 10) {
      res
        .status(400)
        .json({ error: "Não é possível enviar mais que 10 patrimônios" });
      return;
    }

    const result = await addRowToSheet(
      { data, origem, destino, patrimonios, descricao },
      parsedDate
    );

    

    await HistoricoModel.create({
      data,
      destino,
      origem,
      patrimonios,
      inseridoPor,
      descricao,
    });

    res.status(200).json(result);
  };

  get = async (req: Request, res: Response) => {
    const data = req.body.data;

 
    try {
      const registros = await HistoricoModel.find({
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
    } catch (error) {
      res.status(500).json({
        erro: "Erro ao buscar registro do dia...",
      });
    }
  };

  getAll = async (req: Request, res: Response) => {
    const { data } = req.body;

    const [dia, mes, ano] = data.split("/");
    const chaveMesAno = `${mes}/${ano}`;

    try {
      const registros = await HistoricoModel.find({
        data: { $regex: new RegExp(`^\\d{2}/${chaveMesAno}`) },
        deletado: false,
      });

      res.json(registros);
    } catch (err) {
      res.status(500).json({ error: "Erro ao buscar registros do mês" });
    }
  };

  delete = async (req: Request, res: Response) => {
    res.status(404).json({
      message: "Não disponivel",
    });
  };

  update = async (req: Request, res: Response) => {
    res.status(404).json({
      message: "Não disponivel",
    });
  };
}

export default new RowController();
