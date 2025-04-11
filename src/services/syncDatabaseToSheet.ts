// src/scheduler/syncDatabaseWithSheets.ts
import cron from "node-cron";
import getAuthSheets from "../config/sheets";
import RowData from "../interfaces/RowData";
import HistoricoModel from "../models/Historico_De_Envio";

export const syncDatabaseWithSheets = async () => {
  try {
    console.log("⏳ Sincronizando...");
    const { googleSheets, auth, spreadsheetId } = await getAuthSheets();

    const sheetList = await googleSheets.spreadsheets.get({
      auth,
      spreadsheetId,
    });

    const abas = (sheetList.data.sheets ?? [])
      .map(sheet => sheet.properties?.title || "")
      .filter(title => title !== "FOLHA");

    const contadorPlanilha = new Map<string, number>();

    for (const aba of abas) {
      const response = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId,
        range: `'${aba}'`,
        valueRenderOption: "UNFORMATTED_VALUE",
        dateTimeRenderOption: "FORMATTED_STRING",
      });

      const valores = response.data.values ?? [];

      const linhasVazias: number[] = [];
      const linhasDuplicadas: number[] = [];
      const chavesVistas = new Set<string>();

      valores.slice(2).forEach((linha, index) => {
        const linhaIndex = index + 2;
        const isEmpty = linha.every(cell => cell === undefined || cell === null || String(cell).trim() === "");

        if (isEmpty) {
          linhasVazias.push(linhaIndex);
          return;
        }

        const origem = String(linha[1] ?? "");
        const destino = String(linha[2] ?? "");
        const patrimonios = linha.slice(3, 13).filter(p => p !== "" && p !== undefined).map(Number).join(",");
        const descricao = String(linha[13] ?? "");

        const chave = `${origem}-${destino}-${patrimonios}-${descricao}`;

        if (chavesVistas.has(chave)) {
          linhasDuplicadas.push(linhaIndex);
        } else {
          chavesVistas.add(chave);
        }
      });

      const linhasParaRemover = [...linhasVazias, ...linhasDuplicadas].sort((a, b) => b - a);

      if (linhasParaRemover.length > 0) {
        const sheetId = sheetList.data.sheets?.find(s => s.properties?.title === aba)?.properties?.sheetId;
        if (sheetId !== undefined) {
          const requests = linhasParaRemover.map(index => ({
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

          console.log(`🧹 ${linhasParaRemover.length} linha(s) removida(s) da aba "${aba}" (vazias ou duplicadas)`);
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

      const dados: RowData[] = valoresAtualizados.slice(2)
        .map(item => ({
          data: String(item[0] ?? ""),
          origem: String(item[1] ?? ""),
          destino: String(item[2] ?? ""),
          patrimonios: item.slice(3, 13).filter(p => p !== "" && p !== undefined).map(Number),
          descricao: String(item[13] ?? ""),
        }));

      for (const row of dados) {
        const chaveUnica = `${row.origem}-${row.destino}-${row.patrimonios.join(",")}-${row.descricao}`;
        const atual = contadorPlanilha.get(chaveUnica) || 0;
        contadorPlanilha.set(chaveUnica, atual + 1);

        const existentes = await HistoricoModel.find({
          origem: row.origem,
          destino: row.destino,
          patrimonios: row.patrimonios,
          descricao: row.descricao,
        });

        const ativos = existentes.filter(e => !e.deletado);

        if (ativos.length < contadorPlanilha.get(chaveUnica)!) {
          const deletado = existentes.find(e => e.deletado);
          if (deletado) {
            await HistoricoModel.updateOne({ _id: deletado._id }, { deletado: false });
          } else {
            await HistoricoModel.create({ ...row, deletado: false, inseridoPor: "planilha" });
          }
        }
      }
    }

    const todos = await HistoricoModel.find();

    for (const doc of todos) {
      const chaveDoc = `${doc.origem}-${doc.destino}-${doc.patrimonios.join(",")}-${doc.descricao}`;
      const totalEsperado = contadorPlanilha.get(chaveDoc) || 0;

      const iguais = await HistoricoModel.find({
        origem: doc.origem,
        destino: doc.destino,
        patrimonios: doc.patrimonios,
        descricao: doc.descricao,
        deletado: false,
      });

      if (iguais.length > totalEsperado) {
        await HistoricoModel.updateOne({ _id: doc._id }, { deletado: true });
      }
    }

    console.log("✅ Sincronização concluída.");
  } catch (error) {
    console.error("❌ Erro na sincronização:", error);
  }
};

cron.schedule("* * * * *", syncDatabaseWithSheets);
