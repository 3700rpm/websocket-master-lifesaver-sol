interface RugRisk {
  name: string;
  value: string;
  description: string;
  score: number;
  level: string;
}

interface TokenMetaRugCheck {
  name: string;
  symbol: string;
}

export interface RugCheckMinSummary {
  tokenMeta: TokenMetaRugCheck;
  risks: RugRisk[];
}
const rugCheck = async (tokenAddress: string) => {
  try {
    const response = await fetch(`https://api.rugcheck.xyz/v1/tokens/${tokenAddress}/report`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json() as RugCheckMinSummary;
    const tokenMetaRugCheck: TokenMetaRugCheck = data.tokenMeta;
    const rugRisk: RugRisk[] = data.risks;

    if (rugRisk && rugRisk.length > 0 && tokenMetaRugCheck) {
      return {
        tokenMeta: tokenMetaRugCheck,
        risks: rugRisk,
      };
    } else {
      console.log('No rug risk data found');
    }

  } catch (error) {
    console.error('Unable to fetch rugcheck data:', error);
  }
}

export { rugCheck };