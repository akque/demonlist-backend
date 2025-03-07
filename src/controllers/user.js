import User from '../model/user.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const saltRounds = 10;

export const UserRegister = async (req, res, next) => {
  try {
    const { username, password } = req.body

    bcrypt.hash(password, saltRounds, async function(err, hash) {
      if (err) {
        return res.status(400).send({ error: 'Internal error. Account not created' })
      } else {
        const hashedPassword = hash
        const user = await User.create({ username, password: hashedPassword })
        if (user) {
          return res.status(201).send({ data: user, message: 'Account created successfully' })
        } else {
          return res.status(409).send({ error: 'Account not created. Username is already in use' })
        }
      }
    });
  } catch (error) {
    next(error)
  }
}

export const UserGet = async (req, res, next) => {
  try {
    const { authorization } = req.headers
    const token = authorization.replace('Bearer ', '')
    const payload = jwt.verify(token, process.env.PRIVATE_KEY)
    const user = await User.findById(payload.id)

    if (!user) {
      return res.status(404).send({ error: 'User not found' })
    } else {
      return res.status(200).send({ data: user })
    }
  } catch (error) {
    next(error)
  }
}

export const UserLogin = async (req, res, next) => {
  try {
    const { username, password } = req.body

    const user = await User.findOne({ username })

    if (user) {
      const hashedPassword = user.password
      bcrypt.compare(password, hashedPassword, async function(err, result) {
        if (err) {
          return res.status(400).send({ error: 'Internal error. Account not created' })
        } else {
          if (result) {
            const token = jwt.sign({ id: user._id }, process.env.PRIVATE_KEY, { expiresIn: '30d'})
            return res.status(200).send({ token: token, message: 'Logged in successfully' })
          } else {
            return res.status(403).send({ error: 'Login failed. Password is incorrect' })
          }
        }
      });
    } else {
      return res.status(404).send({ error: 'Login failed. User not found' })
    }
  } catch (error) {
    next(error)
  }
}

export const UserForceBan = async (req, res, next) => {
  try {
    const { id, action } = req.body

    const { authorization } = req.headers
    const token = authorization.replace('Bearer ', '')
    const payload = jwt.verify(token, process.env.PRIVATE_KEY)
    const user_admin = await User.findById(payload.id)
    if (user_admin.permissions < 2) return res.status(403).send({ error: 'No permissions to do this' })

    const user = await User.findById(id)

    if (!user) return res.status(404).send({ error: 'User not found' })

    if (id == user_admin.id) return res.status(400).send({ error: 'You cannot ban yourself' })

    if (user.permissions >= user_admin.permissions) return res.status(403).send({ error: 'You cannot ban this user' })

    if (action) {
      user.isBanned = true
      await user.save()
    } else {
      user.isBanned = false
      await user.save()
    }

    return res.status(200).send({ data: user, message: action ? `User ${user} banned successfully` : `User ${user} unbanned successfully`})
  } catch (error) {
    next(error)
  }
}