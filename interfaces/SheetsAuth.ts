import { GoogleAuth, JWT, OAuth2Client } from "google-auth-library";
import { sheets_v4 } from "googleapis";

interface SheetsAuth {
    auth: GoogleAuth;
    client: JWT | OAuth2Client;
    googleSheets: sheets_v4.Sheets;
    spreadsheetId: string;
}

export default SheetsAuth;