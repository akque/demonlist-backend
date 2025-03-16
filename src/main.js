import express from 'express';
import route from './routes/route.js';
import bodyParser from 'body-parser';
import CORS from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3000;

// mongoose.connect(database, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// })
//   .then(() => console.log("Connected to database"))
//   .catch((err) => {
//     console.error(`Database connection error: ${err}`)
//     process.exit(1)
//   })

app.use(express.json())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(CORS())
app.use('/', route)
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})

process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err}`);
});