const mongoose = require('mongoose');
const crypto = require('crypto');
const { promisify } = require('util');

// Configure scrypt parameters for secure password hashing
const SCRYPT_PARAMS = {
  N: 16384, // CPU/memory cost parameter
  r: 8, // Block size parameter
  p: 1, // Parallelization parameter
  keylen: 64, // Derived key length
};

const scryptAsync = promisify(crypto.scrypt);
const randomBytesAsync = promisify(crypto.randomBytes);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [12, 'Password must be at least 12 characters'],
      select: false,
    },
    salt: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ['user', 'admin'],
        message: 'Invalid role specified',
      },
      default: 'user',
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.salt;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.salt;
        return ret;
      },
    },
  }
);

// Password hashing middleware
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    // Generate cryptographically secure salt
    this.salt = (await randomBytesAsync(16)).toString('hex');

    // Hash password with configured parameters
    const derivedKey = await scryptAsync(
      this.password,
      this.salt,
      SCRYPT_PARAMS.keylen,
      {
        cost: SCRYPT_PARAMS.N,
        blockSize: SCRYPT_PARAMS.r,
        parallelization: SCRYPT_PARAMS.p,
      }
    );

    this.password = derivedKey.toString('hex');
    next();
  } catch (error) {
    next(new Error('Failed to hash password: ' + error.message));
  }
});

// Password comparison method
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    const saltBuffer = Buffer.from(this.salt, 'hex');
    const storedPassword = Buffer.from(this.password, 'hex');

    const candidateHash = await scryptAsync(
      candidatePassword,
      saltBuffer,
      SCRYPT_PARAMS.keylen,
      {
        cost: SCRYPT_PARAMS.N,
        blockSize: SCRYPT_PARAMS.r,
        parallelization: SCRYPT_PARAMS.p,
      }
    );

    return crypto.timingSafeEqual(candidateHash, storedPassword);
  } catch (error) {
    console.error('Password comparison error:', error);
    return false;
  }
};

// Indexes
userSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema);
