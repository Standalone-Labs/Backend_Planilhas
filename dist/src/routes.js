"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const RowsController_1 = __importDefault(require("./controllers/RowsController"));
const routes = express_1.default.Router();
routes.get("/getmonth", RowsController_1.default.getAll);
routes.get("/getday", RowsController_1.default.get);
routes.post("/addrow", RowsController_1.default.post);
exports.default = routes;
