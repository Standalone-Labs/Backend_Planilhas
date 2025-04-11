import mongoose from "mongoose";
import { env } from "./dotenv";

export const connectDatabase = async () => {
    try {
        await mongoose.connect(env.mongoUri);
    } catch (error) {
        console.error("Erro ao conectar ao MongoDB");
    }
}