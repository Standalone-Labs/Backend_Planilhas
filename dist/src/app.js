"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = __importDefault(require("./routes"));
const connection_1 = require("./config/connection");
const sheets_1 = __importDefault(require("./config/sheets"));
require("./services/syncDatabaseToSheet");
class App {
    app;
    constructor(app = (0, express_1.default)()) {
        this.app = app;
        (0, connection_1.connectDatabase)();
        (0, sheets_1.default)();
        this.middlewares();
        this.routes();
    }
    middlewares = () => {
        this.app.use(express_1.default.json());
        this.app.use((0, cors_1.default)());
    };
    routes = () => {
        this.app.use('/', routes_1.default);
    };
}
exports.default = new App().app;
