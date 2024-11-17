export interface RugCheckTokenDetails {
  mint: string;
  tokenProgram: string;
  creator: string;
  token: Token;
  token_extensions: null | TokenExtensions;
  tokenMeta: TokenMeta;
  topHolders: Holder[];
  freezeAuthority: null | string;
  mintAuthority: null | string;
  risks: Risk[];
  score: number;
  fileMeta: FileMeta;
  lockerOwners: Record<string, any>;
  lockers: Record<string, any>;
  lpLockers: null | any;
  markets: Market[];
  totalMarketLiquidity: number;
  totalLPProviders: number;
  rugged: boolean;
  tokenType: string;
  transferFee: TransferFee;
  knownAccounts: KnownAccounts;
  events: any[];
  verification: null | any;
  detectedAt: string;
}

export interface Market {
  pubkey: string;
  marketType: string;
  mintA: string;
  mintB: string;
  mintLP: string;
  liquidityA: string;
  liquidityB: string;
  mintAAccount: MintAccount;
  mintBAccount: MintAccount;
  mintLPAccount: MintAccount;
  liquidityAAccount: LiquidityAccount;
  liquidityBAccount: LiquidityAccount;
  lp: LPDetails;
}

export interface MintAccount {
  mintAuthority: string | null;
  supply: number;
  decimals: number;
  isInitialized: boolean;
  freezeAuthority: string | null;
}

export interface LiquidityAccount {
  mint: string;
  owner: string;
  amount: number;
  delegate: string | null;
  state: number;
  delegatedAmount: number;
  closeAuthority: string | null;
}

export interface LPDetails {
  baseMint: string;
  quoteMint: string;
  lpMint: string;
  quotePrice: number;
  basePrice: number;
  base: number;
  quote: number;
  reserveSupply: number;
  currentSupply: number;
  quoteUSD: number;
  baseUSD: number;
  pctReserve: number;
  pctSupply: number;
  holders: Holder[];
  totalTokensUnlocked: number;
  tokenSupply: number;
  lpLocked: number;
  lpUnlocked: number;
  lpLockedPct: number;
  lpLockedUSD: number;
  lpMaxSupply: number;
  lpCurrentSupply: number;
  lpTotalSupply: number;
}

export interface Holder {
  address: string;
  amount: number;
  decimals: number;
  pct: number;
  uiAmount: number;
  uiAmountString: string;
  owner: string;
  insider: boolean;
}


export interface Token {
  mintAuthority: null | string;
  supply: number;
  decimals: number;
  isInitialized: boolean;
  freezeAuthority: null | string;
}

export interface TokenExtensions {
  // Extend as needed
}

export interface TokenMeta {
  name: string;
  symbol: string;
  uri: string;
  mutable: boolean;
  updateAuthority: string;
}

export interface Holder {
  address: string;
  amount: number;
  decimals: number;
  pct: number;
  uiAmount: number;
  uiAmountString: string;
  owner: string;
  insider: boolean;
}

export interface Risk {
  name: string;
  value: string;
  description: string;
  score: number;
  level: string;
}

export interface FileMeta {
  description: string;
  name: string;
  symbol: string;
  image: string;
}

export interface TransferFee {
  pct: number;
  maxAmount: number;
  authority: string;
}

export interface KnownAccounts {
  [key: string]: KnownAccount;
}

export interface KnownAccount {
  name: string;
  type: string;
}

const rugCheckReport = async (tokenAddress: string) => {
  try {
    const resultFromRugcheck = await fetch(`https://api.rugcheck.xyz/v1/tokens/${tokenAddress}/report`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!resultFromRugcheck) {
      throw new Error('No rug risk data found');
    }
    const data = await resultFromRugcheck.json() as RugCheckTokenDetails;
    return data;
  } catch (error) {
    console.log('Unable to fetch rugcheck data:', error);
    throw '[rugCheckReport] Unable to fetch rugcheck data';
  }
}

export default rugCheckReport;