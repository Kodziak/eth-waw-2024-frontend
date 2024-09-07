export type Token = {
  address: string;
  author: string;
  created_at: string;
  description: string;
  id: number;
  image_id: string;
  name: string;
  supply: string;
  symbol: string;
  telegram_url: string;
  twitter_url: string;
  website_url: string;
  balance?: number;
  lpCreated?: boolean;
  network: "azero-l1" | "azero-l2" | null;
  token_address?: string;
  factory_version: "new" | "old" | null;
};

export type TokenContractData = {
  creator: string;
  currentSupply: string;
  decimals: string;
  lpCreated: boolean;
  name: string;
  priceForNextMint: string;
  reserveBalance: string;
  symbol: string;
  token: string;
};

export interface Trade {
  amount_azero: string;
  amount_token: string;
  buyer_address: string;
  created_at: string;
  id: number;
  token_address: string;
  token_symbol: string;
  side: "buy" | "sell";
}
