import { ActiveBetResponse } from "@/types/bet";
import Image from "next/image";

export const BetHistoryCard = ({
  walletAddress,
  prediction,
  tokens,
  tokenName,
  title,
}: ActiveBetResponse & { title: string }) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-4 items-center">
        <Image
          src="/tremp.png"
          alt="Donald Trump"
          className="rounded-lg"
          width={24}
          height={24}
        />
        <h4 className="text-sm">{title}</h4>
      </div>

      <p className="text-gray-400 text-xs">
        {`${walletAddress.slice(0, 4)}...${walletAddress.slice(-6)}`} bet{" "}
        <span
          className={`${prediction === "YES" ? "text-green-500" : "text-red-500"} font-medium`}
        >
          {prediction}
        </span>{" "}
        for{" "}
        <span className="text-gray-200 font-medium">
          {tokens} {tokenName}
        </span>
        .
      </p>
    </div>
  );
};
