import { Account, Metaplex } from "@metaplex-foundation/js";
import { AccountInfo, Connection, PublicKey } from "@solana/web3.js";

const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=a9a6e83c-f06e-4c43-991c-74d648dcf812');

const isMintFreezeAuthorityDisabled = async (tokenAddress: string) => {
  try {
    const mintPublicKey = new PublicKey(tokenAddress);

    const metaplex = new Metaplex(connection);
    const token = await metaplex.nfts().findByMint({ mintAddress: mintPublicKey });
    console.log('Token:', token);
    if (token.mint.freezeAuthorityAddress === null && token.mint.mintAuthorityAddress === null) {
      console.log('Token is not freezable and mintable ✅', tokenAddress);
      return token;
    } else {
      console.log('Token is freezable and mintable ❌ -> Remove it!', tokenAddress);
      return null;
    }
  } catch (error) {
    throw `[isMintFreezeAuthorityDisabled] Error: ${error}`;
  }
}


const WHITE_LISTED_ACCOUNTS_OWNER = [
  '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P', // PUMP Fund Bonding Curve
  '11111111111111111111111111111111',
];

const getWhitelistAccountInfoOwner = async (address: string) => {
  try {
    const publicKey = new PublicKey(address);

    const metaplex = new Metaplex(connection);
    const account = await metaplex.rpc().getAccount(publicKey) as unknown as AccountInfo<any>;
    console.log('Account:', account.owner.toBase58());
    if (WHITE_LISTED_ACCOUNTS_OWNER.includes(account.owner.toBase58())) {
      console.log('Account is whitelisted ✅', address);
      return 'ACCOUNT_IS_WHITELISTED';
    } else {
      console.log('Account is not whitelisted ❌ -> Remove it!', address);
      return 'ACCOUNT_IS_NOT_WHITELISTED';
    }
  } catch (error) {
    console.log('Error:', error);
    throw `[getWhitelistAccountInfoOwner] Error: ${error}`;
  }
}

export {
  isMintFreezeAuthorityDisabled,
  getWhitelistAccountInfoOwner
}