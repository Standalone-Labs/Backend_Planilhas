import express from "express";
import cors from "cors";
import routes from "./routes";
import Application from "./interfaces/Application";
import { connectDatabase } from "./config/connection";
import initGoogleSheets from "./config/sheets";
import "./services/syncDatabaseToSheet"
import { syncDatabaseWithSheets } from "./services/syncDatabaseToSheet";


class App implements Application {
    constructor(public app: express.Application = express()){
        connectDatabase();
        initGoogleSheets();
        syncDatabaseWithSheets();
        this.middlewares();
        this.routes();
        
     
    }

    middlewares = (): void => {
        
        this.app.use(express.json());
        this.app.use(cors());
    }

    routes = (): void => {
        this.app.use('/', routes);
    }
}


export default new App().app;