import { Wallet } from "ethers";

export async function generateWalletAndAddress(chain: string) {
  const supportedChains = ["BNB", "ETH", "POLYGON"];

  if (!supportedChains.includes(chain.toUpperCase())) {
    throw new Error(`Unsupported chain: ${chain}`);
  }

  // ✅ Generate a random EVM-compatible wallet
  const wallet = Wallet.createRandom();

  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
    mnemonic: wallet.mnemonic?.phrase,
    xpub: null, // Not used in ethers.js by default
  };
}
