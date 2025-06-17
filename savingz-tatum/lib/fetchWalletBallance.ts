import { ethers } from "ethers";
import axios from "axios";

export async function fetchBnbBalanceAndValue(address: string) {
  const provider = new ethers.JsonRpcProvider(
    "https://bsc-dataseed.binance.org/"
  );

  const balanceWei = await provider.getBalance(address);
  const balanceBNB = parseFloat(ethers.formatEther(balanceWei));

  const priceRes = await axios.get(
    "https://api.coingecko.com/api/v3/simple/price",
    {
      params: {
        ids: "binancecoin",
        vs_currencies: "ngn",
      },
    }
  );

  const priceNGN = priceRes.data?.binancecoin?.ngn || 0;
  const balanceNGN = balanceBNB * priceNGN;

  return {
    balanceBNB: balanceBNB.toFixed(4),
    balanceNGN: balanceNGN.toFixed(2),
  };
}
