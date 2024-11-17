import { Metaplex } from "@metaplex-foundation/js";
import { Connection, PublicKey } from "@solana/web3.js";

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

export {
  isMintFreezeAuthorityDisabled
}