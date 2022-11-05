import dotenv from 'dotenv';

dotenv.config();

export const { APP_PORT, APP_URL, DB_URL, DEBUG_MODE, JWT_SECRET, REFRESH_TOKEN } = process.env;
