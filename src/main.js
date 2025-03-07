import express from 'express';
import route from './routes/route.js';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import CORS from 'cors';

const app = express();
const port = 3000;
const database = 'mongodb://localhost:27017/demonlist'

mongoose.connect(database)
.then(() => console.log("Connected to database"))
.catch((err) => console.log(`Error ${err}`));

app.use(express.json())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(CORS())
app.use('/', route)
app.listen(port)