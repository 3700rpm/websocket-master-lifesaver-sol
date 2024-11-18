import express from 'express';
import TokenLogger from '../database/logger';
import rugCheckReport from '../rugcheck/fullReport';
import { hasInsiderSnipe } from '../utils/verifyToken';

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
      createdAt: -1,
    }).limit(Number(limit));
    res.json(tokens);
  } catch (error) {
    res.status(500).json({ message: `[Something went wrong get /tokens]` });
  }
});

router.get('/update-token-holders', async (req, res) => {
  try {
    const tokenAddress = req.query.token;
    if (!tokenAddress) {
      res.status(400).json({ message: 'Token address is required' });
    } else if (typeof tokenAddress === 'string') {
      // revalidate
      const rugCheckReportRaw = await rugCheckReport(tokenAddress);
      const insiderData = await hasInsiderSnipe(rugCheckReportRaw);

      const payloadToSave = {
        isHolderBotted: insiderData.length > 0 ? true : false,
        botters: insiderData,
      }

      await TokenLogger.updateOne({
        tokenAddress: tokenAddress,
      }, payloadToSave);
      
      res.json({ message: 'Token holders updated' });
    } else {
      res.status(400).json({ message: 'Token address must be a string' });
    }
  } catch (error) {
    res.status(500).json({ message: `[Something went wrong update /update-token-holders]` });
  }
});

export default router;