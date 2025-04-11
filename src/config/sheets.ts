import { google } from "googleapis";
import { JWT } from "google-auth-library";
import SheetsAuth from "../interfaces/SheetsAuth";
import { env } from "./dotenv";


const getAuthSheets = async (): Promise<SheetsAuth>  => {
    const auth = new google.auth.GoogleAuth({
        keyFile: "credentials.json",
        scopes: ["https://www.googleapis.com/auth/spreadsheets"]
    })

    const client = (await auth.getClient()) as JWT;

    const googleSheets = google.sheets({
        version: "v4",
        auth: client
    })

    const spreadsheetId = env.spreadsheetId;

    return{
        auth,
        client,
        googleSheets,
        spreadsheetId
    }
}




export default getAuthSheets;