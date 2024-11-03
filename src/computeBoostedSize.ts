import { formatUnits } from "viem";

import { LP_TANH_FACTOR, XP_BASE_FACTOR, XP_TANH_FACTOR } from "./constants";

export function computeBoostedSize(xp: bigint, liquidity: bigint, totalXpScaled: number, medianLiquidityScaled: number) {
    const scaledXp = Number(formatUnits(xp, 27));
    const scaledLiquidity = Number(formatUnits(liquidity, 18));
  
    const lpDenominator = Math.max(100_000, medianLiquidityScaled);

    const tanhXP = XP_BASE_FACTOR + (XP_TANH_FACTOR * Math.tanh(scaledXp / totalXpScaled))
    const tanhLP = LP_TANH_FACTOR * Math.tanh(scaledLiquidity / lpDenominator);

    const boostedSize = tanhXP * tanhLP;
  
    return boostedSize;
  }