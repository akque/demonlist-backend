import User from '../model/user.js'
import Demon from '../model/demon.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import rateLimit from 'express-rate-limit';
import dayjs from 'dayjs';
import { body, validationResult } from 'express-validator';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.PRIVATE_KEY) {
  throw new Error('Environment variable PRIVATE_KEY must be set');
}

const saltRounds = 10;

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts. Please try again later.' },
});

export const validateUser = [
  body('username')
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long'),
  body('email')
    .isEmail()
    .withMessage('Invalid email format'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

export const validateLogin = [
  body('username')
    .notEmpty()
    .withMessage('Username is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

export const validateBan = [
  body('id')
    .notEmpty()
    .withMessage('User ID is required'),
  body('months')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Months must be a positive integer'),
  body('permanent')
    .optional()
    .isBoolean()
    .withMessage('Permanent must be a boolean')
];

export const UserRegister = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { username, password } = req.body
    
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username is already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    await User.create({ username, password: hashedPassword });

    return res.status(201).json({ message: 'Account created successfully' });
  } catch (error) {
    next(error)
  }
}

export const UserAuthMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user).select('-password')
    if (!user) {
      return res.status(404).send({ error: 'User not found' })
    } else {
      return res.status(200).send({ data: user })
    }
  } catch (error) {
    next(error)
  }
}

export const UserGetById = async (req, res, next) => {
  try {
    const { id } = req.params

    const user = await User.findById(id).select('-password')
    if (!user) {
      return res.status(404).send({ error: 'User not found' })
    } else {
      const list = await Demon.find({ _id: user.records.map((r) => r.demon_id) }).sort({ place: 1 })
      return res.status(200).send({ data: { user, hardest: list[0]?.name }})
    }
  } catch (error) {
    next (error)
  }
}

export const UserLogin = [
  loginLimiter,
  async (req, res, next) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { username, password } = req.body
      const user = await User.findOne({ username })
      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }

      if (user.banned) {
        if (user.ban_expire) {
          const banExpires = dayjs(user.ban_expire)
          if (dayjs().isBefore(banExpires)) {
            return res.status(403).json({ error: 'Your account is temporarily banned' })
          } else {
            user.banned = false
            user.ban_expire = null
            await user.save()
          }
        } else {
          return res.status(403).json({ error: 'Your account is permanently banned' })
        }
      }

      const isMatch = bcrypt.compare(password, user.password)
      if (!isMatch) {
        return res.status(403).json({ error: 'Incorrect password' })
      }

      const token = jwt.sign({ id: user._id }, process.env.PRIVATE_KEY, { expiresIn: '30d' })

      return res.status(200).json({ data: token, message: 'Logged in successfully' })
    } catch (error) {
      next(error)
    }
  }
]

export const UserForceBan = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { id, months, permanent } = req.body
    const adminUser = await User.findById(req.user)

    if (!adminUser || adminUser.role < 1) {
      return res.status(403).json({ error: 'Insufficient permissions to perform this action' })
    }
    if (id === adminUser._id) {
      return res.status(400).json({ error: 'You cannot ban yourself' })
    }

    const targetUser = await User.findById(id)
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' })
    }
    if (targetUser.permissions >= adminUser.permissions) {
      return res.status(403).json({ error: 'You cannot ban this user' })
    }

    let banned = false
    let ban_expire = null
    if (permanent === true) {
      banned = true
    } else if (months && months > 0) {
      banned = true
      ban_expire = dayjs().add(months, 'month').toDate()
    } else {
      ban_expire = false
    }

    targetUser.banned = banned
    targetUser.ban_expire = ban_expire
    await targetUser.save()

    const message = banned
    ? permanent
      ? `User ${targetUser.username} permanently banned`
      : `User ${targetUser.username} banned for ${months} month(s)`
    : `User ${targetUser.username} unbanned successfully`

    return res.status(200).json({ message })
  } catch (error) {
    next(error)
  }
}