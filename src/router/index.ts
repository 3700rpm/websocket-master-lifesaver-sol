import express from 'express';
import TokenLogger from '../database/logger';

const router = express.Router();

router.get('/', (req, res) => {
  res.send('Hello World!');
});

router.get('/tokens', async (req, res) => {
  try {
        // query params limit
    const limit = req.query.limit || 10;
    // TokenLogger
    const tokens = await TokenLogger.find().sort({
      updatedAt: -1,
    }).limit(Number(limit));
    res.json(tokens);
  } catch (error) {
    res.status(500).json({ message: `[Something went wrong get /tokens]` });
  }
});

export default router;