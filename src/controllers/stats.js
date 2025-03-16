import User from "../model/user.js"

export const getTopPlayers = async (req, res, next) => {
  try {
    const players = await User.find({}).sort({ score: -1 }).select("username score place").limit(100)
    res.status(200).json({ data: players })
  } catch (error) {
    next(error)
  }
}

export const getTopCountries = async (req, res, next) => {
  try {
    const countries = await User.aggregate([
      { $group: { _id: "$country", totalScore: { $sum: "$score" } } },
      { $sort: { totalScore: -1 } }
    ])
    res.status(200).json({ data: countries })
  } catch (error) {
    next(error)
  }
}

export const getPlayersInCountry = async (req, res, next) => {
  try {
    const { country } = req.params
    const players = await User.find({ country }).sort({ score: -1 }).select("username score place")
    res.status(200).json({ data: players })
  } catch (error) {
    next(error)
  }
}

export const updatePlayerPlaces = async () => {
  try {
    const users = await User.find({}).sort({ score: -1 })

    for (let i = 0; i < users.length; i++) {
      users[i].place = i + 1
      await users[i].save()
    }
  } catch (error) {
    console.error("Error updating player places:", error)
  }
}