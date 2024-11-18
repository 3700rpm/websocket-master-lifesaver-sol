// Mongoose Logger Schema
import mongoose from 'mongoose';

const loggerSchema = new mongoose.Schema({
  tokenAddress: {
    type: String,
    required: true,
    unique: true
  },
  ticker: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false
  },
  image: {
    type: String,
    required: false
  },
  social: {
    type: {
      twitter: String,
      telegram: String,
      website: String
    },
    required: false
  },
  isPumpfunToken: {
    type: Boolean,
    required: true
  },
  isPumpFunBundled: {
    type: String,
    required: false
  },
  pumpFunActionPlan: {
    type: String,
    required: false
  },
  isTryingToFakePumpFun: {
    type: Boolean,
    required: false
  },
  isImmediateBondingCurveCompleted: {
    type: Boolean,
    required: false,
  },
  amountOfTimeCompletingBondingCurve: {
    type: Number,
    required: false,
    default: 0
  },
  isHolderBotted: {
    type: Boolean,
    required: false
  },
  botters: {
    type: Array,
    required: false
  },
  tokenIsBundler: {
    type: Boolean,
    required: false
  },
  bundlerPlatform: {
    type: String,
    required: false
  },
  lpLockedPercentage: {
    type: Number,
    required: false
  },
  risk: {
    type: String,
    required: true
  },
  tokenFreeAuthority: {
    type: String,
    required: false
  },
  tokenIsMintAuthority: {
    type: String,
    required: false
  },
  lpMint: {
    type: String,
    required: false
  },
}, {
  timestamps: true
});

interface Botter {
  botterAddress: string;
  amount: number;
  percentage: number;
}

const TokenLogger = mongoose.model('TokenLogger', loggerSchema);

export default TokenLogger;