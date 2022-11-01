import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import { APP_PORT, DB_URL } from './config';
import router from './routes';

const app = express();
app.use(express.json());

app.use('/api', router);

app.get('/', (req, res) => {
	console.log('rest api');
	res.send('rest api');
});

const PORT = process.env.PORT || APP_PORT;
app.listen(PORT, () => {
	console.log(`server running on PORT ${APP_PORT}`);
});
