import { Nft, Sft } from "@metaplex-foundation/js";
import TokenLogger from "../../database/logger";
import { BloxRouteNewLiquidityPool } from "../../interfaces/bloxRouteNewWebSocket";
import rugCheckReport, { Holder, RugCheckTokenDetails } from "../../rugcheck/fullReport";
import { getWhitelistAccountInfoOwner, isMintFreezeAuthorityDisabled } from "../metaplexChecker";
import KNOWN_TOKENS from "../tokens/knownTokens";
import RawTokenLogger from "../../database/rawLogger";

const verifyToken = async (payloadFromBloxRoute: BloxRouteNewLiquidityPool) => {
  try {
    const tokenLogger = TokenLogger;
    let tokenAddress = ''
    const tokenIsNative = payloadFromBloxRoute.pool.token1MintAddress === 'So11111111111111111111111111111111111111112' ? true : false;
  // console.log('result.params.result', result.params.result);
    tokenAddress = tokenIsNative ? payloadFromBloxRoute.pool.token2MintAddress : payloadFromBloxRoute.pool.token1MintAddress;
    const rugCheckReportRaw = await rugCheckReport(tokenAddress);
    const checkFromMetaplex = await isMintFreezeAuthorityDisabled(rugCheckReportRaw.mint);

    console.log('rugCheckReportRaw', rugCheckReportRaw.topHolders);

    const tokenJson = checkFromMetaplex?.json as any;

    const isTokenBullshitResult = await isTokenBullshit(checkFromMetaplex);
    const rugCheckVerifierResult = rugCheckVerifier(rugCheckReportRaw, payloadFromBloxRoute);
    const insiderData = await hasInsiderSnipe(rugCheckReportRaw);
    // isFakePumpFunToken(payload.pool.liquidityPoolKeys.baseMint);
    const IS_PUMPFUN_OR_IS_SELF_MADE_TOKEN = rugCheckVerifierResult ? true : false;

    const IS_TRYING_TO_FAKE_PUMPFUN = rugCheckVerifierResult && rugCheckVerifierResult.pumpFunTokenType === 'FAKE_PUMP_FUN' ? true : false;
    const IS_IMMEDIATE_BONDING_CURVE_COMPLETED = rugCheckVerifierResult && rugCheckVerifierResult.effectiveTimeOfBondingCurve === 'IMMEDIATE_BONDING_CURVE_COMPLETED' ? true : false;
    
    const payload = {
      tokenAddress,
      ticker: rugCheckReportRaw.tokenMeta.symbol,
      description: tokenJson?.description || 'No Description',
      image: tokenJson.image || 'No Image',
      social: {
        twitter: tokenJson.twitter,
        telegram: tokenJson.telegram,
        website: tokenJson.website,
      },
      isPumpfunToken: IS_PUMPFUN_OR_IS_SELF_MADE_TOKEN,
      pumpFunActionPlan: rugCheckVerifierResult?.effectiveTimeOfBondingCurve,
      isPumpFunBundled: rugCheckVerifierResult?.pumpFunTokenType,
      isTryingToFakePumpFun: IS_TRYING_TO_FAKE_PUMPFUN,
      isImmediateBondingCurveCompleted: IS_IMMEDIATE_BONDING_CURVE_COMPLETED,
      amountOfTimeCompletingBondingCurve: rugCheckVerifierResult?.timeDifference,
      isHolderBotted: insiderData.length > 0 ? true : false,
      botters: insiderData,
      tokenIsBundler: isTokenBullshitResult?.isPassCreationCheck ? false : true,
      bundlerPlatform: isTokenBullshitResult?.bundlerPlatform,
      lpLockedPercentage: rugCheckReportRaw.markets ? rugCheckReportRaw.markets[0].lp.lpLockedPct : 0,
      risk: 'UNDEFINED',
      tokenFreeAuthority: checkFromMetaplex?.mint?.freezeAuthorityAddress === null ? 'NULL' : 'THREAT',
      tokenIsMintAuthority: checkFromMetaplex?.mint?.mintAuthorityAddress === null ? 'NULL' : 'THREAT',
      lpMint: payloadFromBloxRoute.pool.poolAddress
    }
    await tokenLogger.findOneAndUpdate({
      tokenAddress: payload.tokenAddress,
    }, {
      ...payload,
    }, {
      upsert: true,
      new: true,
    }).exec();

    await RawTokenLogger.findOneAndUpdate({
      tokenAddress: payload.tokenAddress,
    }, {
      holders: rugCheckReportRaw.topHolders.map((holder) => {
        return {
          owner: holder.owner,
          amount: holder.amount,
          percentage: holder.pct,
        }
      }),
    }, {
      upsert: true,
      new: true,
    }).exec();
    
    return payload;
  } catch (error) {
    console.error('[verifyToken] ❌ Unable to fetch rugcheck data:', error);
  }
}

const rugCheckVerifier = (rugCheckReportRaw: RugCheckTokenDetails, payloadFromBloxRoute: BloxRouteNewLiquidityPool) => {
  const isPumpFunToken = rugCheckReportRaw.mint.includes('pump') ? true : false;
  if (isPumpFunToken) {
    return checkForPumpFunToken(rugCheckReportRaw, payloadFromBloxRoute);
  } else {
    console.log('Not a pump fun token -> CODE later TODO');
    // return 'SELF_MADE_TOKEN';
    return undefined
  }
};

const checkForPumpFunToken = (rugCheckReportRaw: RugCheckTokenDetails, payloadFromBloxRoute: BloxRouteNewLiquidityPool) => {
  const PUMP_FUN_MINT_AUTHORITY = 'TSLvdd1pWpHVjahSpsvCXUbgwsL3JAcvokwaKt1eokM';
  const isPumpFunTokenMint = rugCheckReportRaw.creator === PUMP_FUN_MINT_AUTHORITY ? true : false;
  const isPumpFunTokenUpdateAuthority = rugCheckReportRaw.tokenMeta.updateAuthority === PUMP_FUN_MINT_AUTHORITY ? true : false;
  const isBundledSwapPumpFunCreation = !isPumpFunTokenMint && isPumpFunTokenUpdateAuthority ? true : false;

  let resultFrom: { timeDifference: number, effectiveTimeOfBondingCurve: string | null } | undefined = undefined;
  let pumpFunTokenType = '';
  if (isPumpFunTokenMint && isPumpFunTokenUpdateAuthority) {
    resultFrom = checkIfImmediateBondingCurveCompleted(rugCheckReportRaw, payloadFromBloxRoute);
    console.log('✅ PROPER_PUMP_FUN_TOKEN');
    pumpFunTokenType =  'PROPER_PUMP_FUN_TOKEN';
  } else if (isBundledSwapPumpFunCreation) {
    resultFrom = checkIfImmediateBondingCurveCompleted(rugCheckReportRaw, payloadFromBloxRoute);
    console.log('❌ BUNDLED_SWAP_PUMP_FUN_CREATION');
    pumpFunTokenType =  'BUNDLED_SWAP_PUMP_FUN_CREATION';
  } else {
    resultFrom = undefined;
    console.log('❌ FAKE_PUMP_FUN')
    pumpFunTokenType =  'FAKE_PUMP_FUN';
  }

  return {
    ...resultFrom,
    pumpFunTokenType,
  }
}
const PUMP_FUN_AUTHRORITY = '39azUYFWPz3VHgKCf3VChUwbpURdCHRxjWVowf5jUJjg';

const isCopyCatToken = (rugCheckReportRaw: RugCheckTokenDetails) => {
  const isCopyCat = KNOWN_TOKENS.includes(rugCheckReportRaw.tokenMeta.symbol.toUpperCase()) ? true : false;
  return isCopyCat;
}

const checkIfImmediateBondingCurveCompleted = (rugCheckReportRaw: RugCheckTokenDetails, payloadFromBloxRoute: BloxRouteNewLiquidityPool) => {
  // usually a immediate bonding curve completed less than few minutes after mint is considered rugpull
  const timeDetected = rugCheckReportRaw.detectedAt;
  // convert to timestamp
  const timeDetectedTimestamp = new Date(timeDetected).getTime();
  const lastAddedToRaydium = new Date(payloadFromBloxRoute.timestamp).getTime();
  const timeDifference = lastAddedToRaydium - timeDetectedTimestamp;
  let effectiveTimeOfBondingCurve: string | null = null;
  console.log('✨ timeDifference', timeDifference);
  if (timeDifference < 600000) {
    // return 'IMMEDIATE_BONDING_CURVE_COMPLETED';
    console.log('❌ IMMEDIATE_BONDING_CURVE_COMPLETED - GET RUGGED IMMEDIATELY');
    effectiveTimeOfBondingCurve = 'IMMEDIATE_BONDING_CURVE_COMPLETED';
  } else {
    // return 'NOT_IMMEDIATE_BONDING_CURVE_COMPLETED';
    console.log('✅ NOT_IMMEDIATE_BONDING_CURVE_COMPLETED')
    effectiveTimeOfBondingCurve = 'NOT_IMMEDIATE_BONDING_CURVE_COMPLETED';
  }

  return {
    timeDifference,
    effectiveTimeOfBondingCurve, 
  }
}

const BlacklistCreator = [
  'https://tools.smithii.io/token-creator/solana',
  'https://www.dexlab.space',
  'https://slerf.tools',
]
const isTokenBullshit = async (checkFromMetaplex: Sft | Nft | null) => {
  try {
    if (checkFromMetaplex) {
      console.log('✅ Token is not bullshit yet');
      const tokenJson = checkFromMetaplex.json as any;
      let isTwitterCheckPassed = false;
      if (tokenJson.twitter) {
        const twitterLinkExample = 'https://x.com'
        const checkIfLinkBullshit = !tokenJson.twitter.includes(twitterLinkExample) ? true : false;

        if (checkIfLinkBullshit) {
          console.log('❌ Token Twitter is bullshit');
        } else {
          console.log('✅ Token Twitter is not bullshit');
          isTwitterCheckPassed = true;
        }
      }

      let isPassCreationCheck = false;
      let bundlerPlatform = '';
      if (tokenJson.creator) {
        const checkIfCreatorBullshit = BlacklistCreator.includes(tokenJson.creator.site) ? true : false;
        if (checkIfCreatorBullshit) {
          console.log('❌ Token Creator is created on bundler platform');
          bundlerPlatform = tokenJson.creator.site;
          isPassCreationCheck = false;
        } else {
          console.log('✅ Token Creator Platform is not bullshit at this point');
          isPassCreationCheck = true;
          bundlerPlatform = 'UNKNOWN_SELF';
        }
      } else if (tokenJson.createdOn) {
        const checkIfCreatedOnBullshit = BlacklistCreator.includes(tokenJson.createdOn) ? true : false;
        if (checkIfCreatedOnBullshit) {
          console.log('❌ Token Creator is created on bundler platform');
          bundlerPlatform = tokenJson.createdOn;
          isPassCreationCheck = false;
        } else {
          console.log('✅ Token Creator is not bullshit at this point');
          bundlerPlatform = 'UNKNOWN_SELF';
          isPassCreationCheck = true;
        }

        if (tokenJson.createdOn === 'https://pump.fun') {
          console.log('✅ Token Creator is created on Pump Fun');
          isPassCreationCheck = true;
          bundlerPlatform = tokenJson.createdOn;
        }
      }

      return {
        isTwitterCheckPassed,
        isPassCreationCheck,
        bundlerPlatform,
      }
    } else {
      console.log('❌ Token is bullshit');
      return undefined;
    }
  } catch (error) {
    console.log('[isTokenBullshit] ❌ Error:', error);
    return undefined;
  }
}

interface Problem {
  ownerAddress: string;
  holdAmount: number;
  percentage: number;
}
interface ProblemData {
  ownerAddress: string;
  holdAmount: number;
  percentage: number;
  linkedAaddress: Problem;
}

const hasInsiderSnipe = async (rugCheckReportRaw: RugCheckTokenDetails) => {
  const RAYDIUM_AUTHORITY = '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1';
  const PUMPFUN_AUTHORITY = '39azUYFWPz3VHgKCf3VChUwbpURdCHRxjWVowf5jUJjg';
  // const SYSTEM_AUTHORITY = '11111111111111111111111111111111';
  const SAFE_HOLDER = [RAYDIUM_AUTHORITY, PUMPFUN_AUTHORITY];

  function countTrailingZeros(num: number) {
    let strNum = num.toString(); // Convert the number to a string
    let count = 0; // Initialize counter for trailing zeros
  
    // Start counting from the end of the string
    for (let i = strNum.length - 1; i >= 0; i--) {
        if (strNum[i] === '0') {
            count++; // Increment count if current character is '0'
        } else {
            break; // Stop counting when a non-zero character is encountered
        }
    }
  
    // Return count only if it's more than 1, otherwise return 0
    return count > 2 ? count : 0;
  }

  const insiderSnipe = rugCheckReportRaw.topHolders;
  const collectAll: Holder[] = [];
  const collectAllAmount: number[] = [];

  for await (const [index, holder] of insiderSnipe.entries()) {
    if (!SAFE_HOLDER.includes(holder.owner)) {
      if (holder.amount !== 0) {
        if (holder.pct > 20) {
          // CHECK IF AUTHRORITY
          const result = await getWhitelistAccountInfoOwner(holder.owner);
          if (result === 'ACCOUNT_IS_WHITELISTED') {
            console.log('✅ Authority Skipped');
          } else {
            collectAll.push(holder);
          }
        } else {
          collectAll.push(holder);
        }
      }
    } else if (SAFE_HOLDER.includes(holder.owner)) {
      console.log('✅ Raydium/PumpFun Authority Skipped');
    }
  }

  const collectionOfSuspicious = [];

  let problem: ProblemData;
  for await (const [index, holder] of collectAll.entries()) {
    problem = { ownerAddress: '', holdAmount: 0, percentage: 0, linkedAaddress: { ownerAddress: '', holdAmount: 0, percentage: 0 } };
    const holderAmount = Math.round(holder.amount);
    const holderPercentage = holder.pct;
    
    if (countTrailingZeros(holder.amount) > 0) {
      console.log('❌ Insider Snipe Detected - Too many trailing zeros', holder.amount, holder.owner);
      problem.ownerAddress = holder.owner;
      problem.holdAmount = holderAmount;
      problem.percentage = holderPercentage;
    }

    if (holderPercentage >= 4) {
      console.log('❌ Insider Snipe Detected - Too many percentage', holderPercentage, holder.owner);
      problem.ownerAddress = holder.owner;
      problem.holdAmount = holder.amount;
      problem.percentage = holderPercentage;
    }
    // careful handle the last index
    if (index !== collectAll.length - 1) {
      const holderAmountNext = Math.round(collectAll[index + 1].amount);
      if (holderAmount === holderAmountNext) {
        console.log('❌ Insider Snipe Detected', holderAmount, holderAmountNext);
      }

      // const differenceThreshold = 50;
      // if (holderAmount - holderAmountNext < differenceThreshold) {
      //   console.log('❌ Insider Snipe Detected - Smart Play', holderAmount, holderAmountNext);
      // }
      const percentageDifference = ((holderAmount - holderAmountNext) / holderAmount) * 100;

      if (percentageDifference < 0.1 && percentageDifference > 0) {
        console.log('percentageDifference %', percentageDifference);
        console.log('❌ Insider Snipe Detected - Smart Play (%)', holderAmount, holderAmountNext);
        problem.ownerAddress = holder.owner;
        problem.holdAmount = holderAmount;
        problem.percentage = holderPercentage;
        problem.linkedAaddress = {
          ownerAddress: collectAll[index + 1].owner,
          holdAmount: holderAmountNext,
          percentage: collectAll[index + 1].pct,
        }
      }
    }

    if (holder.owner === '11111111111111111111111111111111') {
      problem.ownerAddress = '11111111111111111111111111111111'
      problem.holdAmount = holder.amount;
      problem.percentage = holder.pct > 90 ? holder.pct : 0;
    }

    if (problem.holdAmount !== 0 || problem.percentage !== 0) {
      collectionOfSuspicious.push(problem);
    }

  }

  return collectionOfSuspicious
}

export { verifyToken, hasInsiderSnipe };