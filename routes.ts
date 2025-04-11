import express from "express";
import RowsController from "./controllers/RowsController";
import { syncDatabaseWithSheets } from "./services/syncDatabaseToSheet";



const routes = express.Router();

routes.get("/getmonth", RowsController.getAll);
routes.get("/getday", RowsController.get);
routes.post("/addrow", RowsController.post);

export default routes;