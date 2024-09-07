export type Bet = {
  title: string;
  description: string;
  dueDate: Date | number;
  predict: {
    price: string;
    symbol: string;
  } | null;
  isPricePrediction: boolean;
};

export type BetResponse = {
  title: string;
  description: string;
  dueDate: Date | number;
  predict: {
    price: string;
    symbol: string;
  } | null;
  requestId: string;
  contracts: {
    azero: string;
    celo: string;
    zircuit: string;
    mantle: string;
    sei: string;
  };
};

export type ActiveBetResponse = {
  eventRequestId: string;
  walletAddress: string;
  prediction: "YES" | "NO";
  tokens: number;
  tokenName: string;
  id: number;
  eventTitle: string;
};
