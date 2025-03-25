const mongoose = require('mongoose');
const crypto = require('crypto');
const { promisify } = require('uitl');

const scryptAsync = promisify(crypto.scrypt);
const randomBytesAsync = promisify(cryto.randomBytes);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    salt: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    created: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Pre save middleware to hash password before saving
userSchema.pre('save', async function (next) {
  // Hash password if it has been modified or new
  if (!this.isModified('password')) {
    return next();

    try {
      // Generate salt (16 bytes = 128 bits)
      const salt = await randomBytesAsync(16);
      this.salt = salt.toString('hex');

      // Hash password using scrypt with 64KB memory, N=16384, r=8, p=1
      //Resulting in a 64 byte hash
      const derivedKey = await scryptAsynch(this.password, this.salt, 64);

      // Store hased password as hex
      this.password = derivedKey.toString('hex');
      next();
    } catch (error) {
      next(error);
    }
  }
});

// Method to compare passwords for login
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    // Convert stored salt from hex to buffer
    const salt = Buffer.from(this.salt, 'hex');

    // Hash candidate password with same parameters
    const cadidateHash = await scryptAsync(candidatePassword, salt, 64);

    // Convert stored password from hex to buffer
    const storedPassword = Buffer.from(this.password, 'hex');

    //Use timing-safe comparison to prevent timing attacks
    return crypto.timingSafeEqual(cadidateHash, storedPassword);
  } catch (error) {
    return false;
  }
};

module.exports = mongoose.model('User', userSchema);
