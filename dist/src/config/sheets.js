"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const googleapis_1 = require("googleapis");
const dotenv_1 = require("./dotenv");
const getAuthSheets = async () => {
    const auth = new googleapis_1.google.auth.GoogleAuth({
        keyFile: "credentials.json",
        scopes: ["https://www.googleapis.com/auth/spreadsheets"]
    });
    const client = (await auth.getClient());
    const googleSheets = googleapis_1.google.sheets({
        version: "v4",
        auth: client
    });
    const spreadsheetId = dotenv_1.env.spreadsheetId;
    return {
        auth,
        client,
        googleSheets,
        spreadsheetId
    };
};
exports.default = getAuthSheets;
