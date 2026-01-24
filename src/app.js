import express from 'express'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import CORS from 'cors'
import dotenv from 'dotenv'
import route from './app/route.js'
import './utils/check-ban.js'

dotenv.config()

if (!process.env.NODE_ENV) {
	throw new Error('Environment variable NODE_ENV is not set')
}

const app = express()

app.use(express.json())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(
	CORS({
		origin: process.env.ORIGIN_URL,
		credentials: true
	})
)
app.use(`/`, route)

app.listen(process.env.APPLICATION_PORT, () => {
	console.log('Server running on port ' + process.env.APPLICATION_PORT)
})

process.on('unhandledRejection', err => {
	console.error(`Unhandled Rejection: ${err}`)
})
