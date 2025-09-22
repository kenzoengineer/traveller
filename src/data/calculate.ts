// trade goods table

import type { ItemSelection } from "../App";

interface TradeGood {
  type: string;
  price: number;
}

export interface Result {
  profit: number;
  selections: { key: string; qty: number; cost: number }[];
  cargoUsed: number;
  moneyUsed: number;
}

export const tradeGoods: Record<number, TradeGood> = {
  11: { type: "Common Electronics", price: 20000 },
  12: { type: "Common Industrial Goods", price: 10000 },
  13: { type: "Common Manufactured Goods", price: 20000 },
  14: { type: "Common Raw Materials", price: 5000 },
  15: { type: "Common Consumables", price: 500 },
  16: { type: "Common Ore", price: 1000 },
  21: { type: "Advanced Electronics", price: 100000 },
  22: { type: "Advanced Machine Parts", price: 75000 },
  23: { type: "Advanced Manufactured Goods", price: 100000 },
  24: { type: "Advanced Weapons", price: 150000 },
  25: { type: "Advanced Vehicles", price: 180000 },
  26: { type: "Biochemicals", price: 50000 },
  31: { type: "Crystals & Gems", price: 20000 },
  32: { type: "Cybernetics", price: 250000 },
  33: { type: "Live Animals", price: 10000 },
  34: { type: "Luxury Consumables", price: 20000 },
  35: { type: "Luxury Goods", price: 200000 },
  36: { type: "Medical Supplies", price: 50000 },
  41: { type: "Petrochemicals", price: 10000 },
  42: { type: "Pharmaceuticals", price: 100000 },
  43: { type: "Polymers", price: 7000 },
  44: { type: "Precious Metals", price: 50000 },
  45: { type: "Radioactives", price: 1000000 }, // MCr1 = 1,000,000 Cr
  46: { type: "Robots", price: 400000 },
  51: { type: "Spices", price: 6000 },
  52: { type: "Textiles", price: 3000 },
  53: { type: "Uncommon Ore", price: 5000 },
  54: { type: "Uncommon Raw Materials", price: 20000 },
  55: { type: "Wood", price: 1000 },
  56: { type: "Vehicles", price: 15000 },
  61: { type: "Illegal Biochemicals", price: 50000 },
  62: { type: "Cybernetics, Illegal", price: 250000 },
  63: { type: "Drugs, Illegal", price: 100000 },
  64: { type: "Luxuries, Illegal", price: 50000 },
  65: { type: "Weapons, Illegal", price: 150000 },
};

// for calculating sale price

const probs3d6: Record<number, number> = {
  3: 1 / 216,
  4: 3 / 216,
  5: 6 / 216,
  6: 10 / 216,
  7: 15 / 216,
  8: 21 / 216,
  9: 25 / 216,
  10: 27 / 216,
  11: 27 / 216,
  12: 25 / 216,
  13: 21 / 216,
  14: 15 / 216,
  15: 10 / 216,
  16: 6 / 216,
  17: 3 / 216,
  18: 1 / 216,
};

const salePct: Record<string, number> = {
  "-3": 10,
  "-2": 20,
  "-1": 30,
  "0": 40,
  "1": 45,
  "2": 50,
  "3": 55,
  "4": 60,
  "5": 65,
  "6": 70,
  "7": 75,
  "8": 80,
  "9": 85,
  "10": 90,
  "11": 100,
  "12": 105,
  "13": 110,
  "14": 115,
  "15": 120,
  "16": 125,
  "17": 130,
  "18": 140,
  "19": 150,
  "20": 160,
  "21": 175,
  "22": 200,
  "23": 250,
  "24": 300,
  "25": 400,
};

const getPct = (r: number) => {
  if (r <= -3) return salePct["-3"];
  if (r >= 25) return salePct["25"];
  return salePct[String(r)];
};

const getExpectedValue = (modifier: number) => {
  let accum = 0;
  for (const rollResultString in probs3d6) {
    const rollResult = Number(rollResultString);
    const probability = probs3d6[rollResult];
    const adjustedRoll = rollResult + modifier;

    const pct = getPct(adjustedRoll); // given a roll + modifier, whats the sales price?
    accum += probability * (pct / 100);
  }
  return accum;
};

/**
 * 2D bounded knapsack (all items weigh 1 ton)
 *
 * @param {number} capacity - max tons of cargo (max number of items)
 * @param {number} budget - max money to spend
 * @param {Array} items - each = { cost, value, maxQty }
 * @returns {object} { maxValue, chosen }
 */
const boundedKnapsack2D = (
  capacity: number,
  budget: number,
  items: { key: string; cost: number; value: number; maxQty?: number }[]
): Result => {
  // Expand items via binary splitting
  const expanded: {
    cost: number;
    value: number;
    count: number;
    ref: number;
  }[] = [];
  items.forEach((item, idx) => {
    let qty = item.maxQty ?? 0;
    let k = 1;
    while (qty > 0) {
      const take = Math.min(k, qty);
      expanded.push({
        cost: item.cost * take,
        value: item.value * take,
        count: take,
        ref: idx,
      });
      qty -= take;
      k *= 2;
    }
  });

  // dp[c][b] -> max value with c items and b budget
  // Use array of maps to save memory: dp[c] maps budget -> max value
  const dp: Map<number, number>[] = Array.from(
    { length: capacity + 1 },
    () => new Map()
  );
  dp[0].set(0, 0);

  // Track choices for reconstruction
  const choice: Map<number, { prevB: number; ref: number; count: number }>[] =
    Array.from({ length: capacity + 1 }, () => new Map());

  for (let item of expanded) {
    for (let c = capacity; c >= item.count; c--) {
      for (let [b, v] of dp[c - item.count].entries()) {
        const newB = b + item.cost;
        if (newB <= budget) {
          const newV = v + item.value;
          if (!dp[c].has(newB) || dp[c].get(newB)! < newV) {
            dp[c].set(newB, newV);
            choice[c].set(newB, { prevB: b, ref: item.ref, count: item.count });
          }
        }
      }
    }
  }

  // Find best value
  let maxV = 0;
  let bestC = 0;
  let bestB = 0;
  for (let c = 0; c <= capacity; c++) {
    for (let [b, v] of dp[c].entries()) {
      if (v > maxV) {
        maxV = v;
        bestC = c;
        bestB = b;
      }
    }
  }

  // Reconstruct chosen items
  const chosen = Array(items.length).fill(0);
  let c = bestC;
  let b = bestB;
  while (c > 0 && b >= 0 && choice[c].has(b)) {
    const { prevB, ref, count } = choice[c].get(b)!;
    chosen[ref] += count;
    c -= count;
    b = prevB;
  }

  // Compute cargo space used and money used
  let cargoUsed = chosen.reduce((sum, qty) => sum + qty, 0);
  let moneyUsed = chosen.reduce((sum, qty, i) => sum + qty * items[i].cost, 0);

  for (const c in chosen) {
    const q = chosen[c];
    chosen[c] = {
      key: items[c].key,
      qty: q,
      cost: items[c].cost * q,
    };
  }

  return { profit: maxV, selections: chosen, cargoUsed, moneyUsed };
};

export const calculate = (
  capacity: number,
  budget: number,
  items: ItemSelection[]
) => {
  // first convert each items base price to their expected profit
  const convertedItems = [];
  for (const item of items) {
    const k = Object.values(tradeGoods).filter(
      (good) => good.type === item.item
    )[0];
    if (!k) continue;
    const basePrice = k.price;
    const purchasePrice = (basePrice * item.buyCoefficent) / 100;
    const expectedSalePrice =
      getExpectedValue(Number(item.sellMod)) * basePrice;

    convertedItems.push({
      key: item.item,
      cost: purchasePrice,
      value: expectedSalePrice,
      maxQty: item.maxQty,
    });
  }

  const res = boundedKnapsack2D(capacity, budget, convertedItems);
  console.log(res);
  return res;
};

export const fCredits = (n: number) => {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
