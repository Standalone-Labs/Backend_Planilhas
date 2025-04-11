// src/config/env.ts
import dotenv from 'dotenv';
dotenv.config();

export const env = {
  mongoUri: process.env.MONGO_URI || '',
  spreadsheetId: process.env.spreadsheetId || ''
};
