import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import { APP_PORT, DB_URL } from './config';

const app = express();

app.listen(3000, () => {
	console.log(`server running on PORT:${APP_PORT}`);
});
