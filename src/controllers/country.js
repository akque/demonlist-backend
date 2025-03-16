import Country from "../model/country.js";

export const getAllCountries = async (req, res, next) => {
  try {
    const userAdmin = await User.findById(req.user)
    if (userAdmin.role < 2) return res.status(403).send({ error: 'Insufficient permissions to perform this action' })

    const countries = await Country.find().sort({ name: 1 })
    return res.status(200).json({ data: countries })
  } catch (error) {
    next(error)
  }
};

export const createCountry = async (req, res, next) => {
  try {
    const userAdmin = await User.findById(req.user)
    if (userAdmin.role < 2) return res.status(403).send({ error: 'Insufficient permissions to perform this action' })

    const { name } = req.body
    if (!name) {
      return res.status(400).json({ error: "Country name is required" })
    }

    const existingCountry = await Country.findOne({ name })
    if (existingCountry) {
      return res.status(400).json({ error: "Country already exists" })
    }

    const country = await Country.create({ name })
    return res.status(201).json({ data: country, message: "Country created successfully" })
  } catch (error) {
    next(error)
  }
};

export const deleteCountry = async (req, res, next) => {
  try {
    const userAdmin = await User.findById(req.user)
    if (userAdmin.role < 2) return res.status(403).send({ error: 'Insufficient permissions to perform this action' })
      
    const { id } = req.params
    const country = await Country.findByIdAndDelete(id)
    if (!country) {
      return res.status(404).json({ error: "Country not found" })
    }
    return res.status(200).json({ message: "Country deleted successfully" })
  } catch (error) {
    next(error)
  }
};