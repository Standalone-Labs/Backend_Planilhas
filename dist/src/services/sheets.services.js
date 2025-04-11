"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const googleapis_1 = require("googleapis");
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
    const spreadsheetId = "11khlhYd4Nerhw9KR-UFQ8tXmv0UWIrZaRKHOp2l5UGw";
    return {
        auth,
        client,
        googleSheets,
        spreadsheetId
    };
};
exports.default = getAuthSheets;
