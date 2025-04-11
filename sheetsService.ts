import {
  formatNamePage,
  findSheetByTitle,
  createSheetFromTemplate,
} from "../utils/sheets.utils";
import getAuthSheets from "../config/sheets";
import RowData from "../interfaces/RowData";
import { format, isValid, parse } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";

export const addRowToSheet = async (rowData: RowData, parsedDate: Date) => {
  const { googleSheets, auth, spreadsheetId } = await getAuthSheets();

  const sheets = await googleSheets.spreadsheets.get({ auth, spreadsheetId });
  const sheetsData = sheets.data.sheets ?? [];

  const nomeAba = formatNamePage(parsedDate);
  const folhaSheet = findSheetByTitle(sheetsData, "FOLHA");
  if (!folhaSheet) throw new Error("A aba 'FOLHA' não existe.");

  if (!findSheetByTitle(sheetsData, nomeAba)) {
    await createSheetFromTemplate(
      googleSheets,
      spreadsheetId,
      folhaSheet.properties!.sheetId!,
      nomeAba
    );
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
  while (dados.length < 13) dados.push("");
  dados.push(rowData.descricao || "");

  const response = await googleSheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${nomeAba}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [dados] },
  });

  return response.data;
};

export const getRowsFromSheet = async (data: string): Promise<RowData[]> => {
  if (!data) throw new Error("Data é obrigatória");

  const parsedDate = parse(data, "dd/MM/yyyy", new Date());
  if (!isValid(parsedDate)) throw new Error("Data inválida");

  const { googleSheets, auth, spreadsheetId } = await getAuthSheets();

  const nomeMes = format(parsedDate, "MMMM", { locale: ptBR }).slice(0, 3).toUpperCase();
  const anoAbreviado = format(parsedDate, "yy");
  const nomeAba = `${nomeMes} ${anoAbreviado}`;

  // Verifica se a aba existe
  const sheetList = await googleSheets.spreadsheets.get({
    auth,
    spreadsheetId,
  });

  const abaExiste = sheetList.data.sheets?.some(
    (sheet) => sheet.properties?.title === nomeAba
  );

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

  return valores.slice(2).map(
    (item = []): RowData => ({
      data: String(item[0] ?? ""),
      origem: String(item[1] ?? ""),
      destino: String(item[2] ?? ""),
      patrimonios: item
        .slice(3, 13)
        .filter((p) => p !== "" && p !== undefined)
        .map(Number),
      descricao: String(item[13] ?? ""),
    })
  );
};