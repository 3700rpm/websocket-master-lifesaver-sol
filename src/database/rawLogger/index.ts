// Mongoose Logger Schema
import mongoose from 'mongoose';

const rawLoggerSchema = new mongoose.Schema({
  tokenAddress: {
    type: String,
    required: true,
    unique: true
  },
  ticker: {
    type: String,
    required: true,
  },
  holders: {
    type: Array,
    required: false
  },
  lpMint: {
    type: String,
    required: false
  },
}, {
  timestamps: true
});

const RawTokenLogger = mongoose.model('RawLogger', rawLoggerSchema);

export default RawTokenLogger;