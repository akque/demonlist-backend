import mongoose from 'mongoose'
import AutoIncrementFactory from 'mongoose-sequence'
import dotenv from 'dotenv'

dotenv.config()

const connection = mongoose.createConnection(process.env.MONGODB_URL, {
	useNewUrlParser: true,
	useUnifiedTopology: true
})

connection.on('connected', () => {
	console.log('Connected to database')
})

connection.on('error', err => {
	console.error(`Database connection error: ${err}`)
	process.exit(1)
})

const AutoIncrement = AutoIncrementFactory(connection)

export { AutoIncrement, connection }
