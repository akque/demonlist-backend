import mongoose from "mongoose"
import AutoIncrementFactory from "mongoose-sequence";

const database = 'mongodb://localhost:27017/demonlist'

const connection = mongoose.createConnection(database, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

connection.on('connected', () => {
  console.log("Connected to database");
});

connection.on('error', (err) => {
  console.error(`Database connection error: ${err}`);
  process.exit(1);
});

const AutoIncrement = AutoIncrementFactory(connection)

export { AutoIncrement, connection }