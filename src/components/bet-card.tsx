import { useEffect, useState } from "react";
import { HandleActionModal } from "./handle-action-modal";
import Link from "next/link";
import { BetResponse } from "@/types/bet";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { getAssetPrices, getActiveBetsById } from "@/utils/api";

export const BetCard = ({
  requestId,
  title,
  description,
  dueDate,
  contracts,
}: BetResponse) => {
  const [showModal, setShowModal] = useState(false);
  const [action, setAction] = useState<"yes" | "no">("yes");

  const handleAction = (action: "yes" | "no") => {
    setAction(action);
    setShowModal(true);
  };

  const { data: assetPrices } = useQuery({
    queryKey: ["active-bets"],
    queryFn: () => getAssetPrices(),
  });

  const { data: activeBets } = useQuery({
    queryKey: ["active-bets"],
    queryFn: () => getActiveBetsById(requestId),
  });

  const [betTotals, setBetTotals] = useState<{
    assetTotals: { [key: string]: number };
    totalUSD: string;
  } | null>(null);

  useEffect(() => {
    const calculateTotalBets = () => {
      if (!activeBets || !assetPrices || activeBets.length === 0) return null;

      const totals: { [key: string]: number } = {};
      let totalUSD = 0;

      if (activeBets.length > 0) {
        activeBets.forEach((bet) => {
          const asset = bet.tokenName;
          const amount = bet.tokens;

          if (!totals[asset]) {
            totals[asset] = 0;
          }
          totals[asset] += amount;

          const usdPrice = assetPrices[asset]?.usd || 0;
          totalUSD += amount * usdPrice;
        });
      }

      return {
        assetTotals: totals,
        totalUSD: totalUSD.toFixed(2),
      };
    };

    const betTotals = calculateTotalBets();
    setBetTotals(betTotals);
  }, [activeBets, assetPrices]);

  return (
    <div className="w-full p-4 rounded-md bg-gradient-to-tr from-blue-900/20 to-blue-900/5">
      <Link href={`/${requestId}`} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex gap-4 items-center">
            <Image
              src={`/${["brainlet.png", "tremp.png", "antuni.png"][Math.floor(Math.random() * 3)]}`}
              alt={title}
              className="rounded-md"
              width={32}
              height={32}
            />
            <h3 className="text-lg font-medium">{title}</h3>
          </div>

          <p className="text-wrap text-sm text-gray-400">{description}</p>
        </div>

        <div className="w-full flex gap-2">
          <button
            className="flex-1 py-2 rounded-md text-sm font-medium text-green-400 bg-green-500/50"
            onClick={(e) => {
              e.preventDefault();
              handleAction("yes");
            }}
          >
            Yes
          </button>
          <button
            className="flex-1 py-2  rounded-md text-red-400 bg-red-500/50 text-sm font-medium "
            onClick={(e) => {
              e.preventDefault();
              handleAction("no");
            }}
          >
            No
          </button>
        </div>

        <div className="flex justify-between w-full">
          {/* <span className=" text-gray-500 text-sm">Total Bets: ~{totalBets}</span> */}
          <span className=" text-gray-500 text-sm">
            Resolve on:{" "}
            {new Date(dueDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>

          {betTotals && (
            <div className="flex flex-col gap-1 text-right">
              <span className=" text-gray-500 text-sm">
                Total Bets: ~{betTotals?.totalUSD} USD
              </span>

              {Object.entries(betTotals?.assetTotals || {}).map(
                ([asset, amount]) => (
                  <span key={asset} className=" text-gray-500 text-sm">
                    {asset}: {amount}
                  </span>
                ),
              )}
            </div>
          )}
        </div>
      </Link>

      <HandleActionModal
        action={action}
        isOpen={showModal}
        setIsOpen={setShowModal}
        contracts={contracts}
        requestId={requestId}
      />
    </div>
  );
};
