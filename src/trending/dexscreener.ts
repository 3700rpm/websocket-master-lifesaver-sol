[{
  "url": "https://example.com",
  "chainId": "text",
  "tokenAddress": "text",
  "amount": 0,
  "totalAmount": 0,
  "icon": "https://example.com",
  "header": "https://example.com",
  "description": "text",
  "links": [
    {
      "type": "text",
      "label": "text",
      "url": "https://example.com"
    }
  ]
}]

interface DexScreenerLatestBoostedToken {
  url: string;
  chainId: string;
  tokenAddress: string;
  amount: number;
  totalAmount: number;
  icon: string | null;
  header: string | null;
  description: string | null;
  links: {
    type: string;
    label: string;
    url: string;
  }[] | null;
}
const dexscreenerTrending = async () => {
  try {
    const response = await fetch('https://api.dexscreener.com/token-boosts/latest/v1', {
      method: 'GET',
      headers: {},
    });
    const data = await response.json() as DexScreenerLatestBoostedToken[];
    console.log(data);
  } catch (error) {
    console.error('Unable to fetch dexscreener data:', error);
  }
}

const start = async () => {
  try {
    await dexscreenerTrending();

    setInterval(dexscreenerTrending, 5000);
  } catch (error) {
    console.error('Error fetching dexscreener data:', error);
  }
}

start();