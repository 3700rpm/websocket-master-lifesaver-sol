interface BloxRouteNewLiquidityPool {
  slot: string;
  pool: PoolDetails;
  timestamp: string;
}

interface PoolDetails {
  pool: string;
  poolAddress: string;
  token1Reserves: string;
  token1MintAddress: string;
  token1MintSymbol: string;
  token2Reserves: string;
  token2MintAddress: string;
  token2MintSymbol: string;
  openTime: string;
  poolType: string;
  liquidityPoolKeys: LiquidityPoolKeys;
}

interface LiquidityPoolKeys {
  id: string;
  baseMint: string;
  quoteMint: string;
  lpMint: string;
  version: number;
  programID: string;
  authority: string;
  baseVault: string;
  quoteVault: string;
  lpVault: string;
  openOrders: string;
  targetOrders: string;
  withdrawQueue: string;
  marketVersion: number;
  marketProgramID: string;
  marketID: string;
  marketAuthority: string;
  marketBaseVault: string;
  marketQuoteVault: string;
  marketBids: string;
  marketAsks: string;
  marketEventQueue: string;
  tradeFeeRate: string; 
}

export { BloxRouteNewLiquidityPool, PoolDetails, LiquidityPoolKeys };