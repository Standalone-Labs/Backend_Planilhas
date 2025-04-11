"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sheets_services_1 = __importDefault(require("../services/sheets.services"));
// Obtendo metadata da planilha
const metadataController = async (req, res) => {
    const { googleSheets, auth, spreadsheetId } = await (0, sheets_services_1.default)();
    const metadata = await googleSheets.spreadsheets.get({
        auth,
        spreadsheetId
    });
    res.status(200).send(metadata.data);
};
exports.default = metadataController;
