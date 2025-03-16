import { Router } from 'express'
import { getAllCountries, createCountry, deleteCountry } from "../controllers/country.js"
import { authenticate } from '../middlewares/authenticate.js'

const countryRouter = Router()

countryRouter.get("/", authenticate, getAllCountries)
countryRouter.post("/", authenticate, createCountry)
countryRouter.delete("/:id", authenticate, deleteCountry)

export default countryRouter