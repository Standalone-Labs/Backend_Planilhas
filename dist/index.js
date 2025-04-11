"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./src/app"));
const porta = 3000;
app_1.default.listen((porta), (error) => {
    if (error) {
        console.log(error);
    }
    else {
        console.log(`Servidor rodando http://localhost:${porta}`);
    }
});
