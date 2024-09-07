import { BetResponse, ActiveBetResponse } from "@/types/bet";

export const getBet = async (id: string): Promise<BetResponse> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/events/${id}`,
  );

  return response.json();
};

export const getActiveBetsById = async (
  id: string,
): Promise<ActiveBetResponse[]> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/events/${id}/bets`,
  );

  return response.json();
};

// INFO: Hard-coded due to coingecko rate-limiter
export const getAssetPrices = async (): Promise<{
  [key: string]: { usd: number };
}> => {
  return {
    AZERO: {
      usd: 0.385095,
    },
    CELO: {
      usd: 0.404643,
    },
    ETH: {
      usd: 2268.77,
    },
    MNT: {
      usd: 0.538721,
    },
  };
};

export const getBets = async (): Promise<BetResponse[]> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events`);

  return response.json();
};

export const getActiveBets = async (): Promise<ActiveBetResponse[]> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bets`);

  return response.json();
};
