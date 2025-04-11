"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = require("./dotenv");
const connectDatabase = async () => {
    try {
        await mongoose_1.default.connect(dotenv_1.env.mongoUri);
    }
    catch (error) {
        console.error("Erro ao conectar ao MongoDB");
    }
};
exports.connectDatabase = connectDatabase;
