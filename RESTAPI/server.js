import express from 'express';
import mongoose, { mongo, Mongoose } from 'mongoose';
import path from 'path';
import { APP_PORT, DB_URL } from './config';
import errorHandler from './middlewares/errorHandler';
import router from './routes';

const app = express();
app.use(express.json());
global.appRoot = path.resolve(__dirname);

// mongoose
// 	.connect(DB_URL, {})
// 	.then(() => console.log('database connected'))
// 	.catch((error) => console.log(error));

mongoose.connect(DB_URL, {});
const db = mongoose.connection;
db.on('error', () => console.log('connection error!'));
db.once('open', () => {
	console.log('DB connected...');
});

app.use('/api', router);
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
	console.log('rest api');
	res.send('rest api');
});

app.use(errorHandler);

const PORT = process.env.PORT || APP_PORT;
app.listen(PORT, () => {
	console.log(`server running on PORT ${APP_PORT}`);
});
