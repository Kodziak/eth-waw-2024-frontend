"use client";

import { CreateRequest } from "@/components/create-request";
import { Navbar } from "@/components/navbar";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Bet } from "@/types/bet";
import { useAccount, useChainId, useSwitchChain } from "wagmi";

export default function Home() {
  const [bet, setBet] = useState<Bet>({
    title: "",
    description: "",
    dueDate: new Date(),
    predict: null,
    isPricePrediction: false,
  });

  const { chain } = useAccount();
  const { chains, switchChainAsync } = useSwitchChain();
  const sepoliaChain = chains.find(
    (chain) => chain.name.toString() === "Sepolia",
  );

  return (
    <main className="w-screen min-h-screen relative bg-mempad-50 flex flex-col items-center gap-2 pb-8 px-2">
      <Navbar />

      {/* MAIN ALL */}
      <div className="max-w-[1440px] w-full mx-auto flex flex-col gap-6 z-[2] mt-[84px]">
        <div className="flex flex-col gap-6 items-center w-full">
          <h3 className=" text-white flex gap-2 items-center justify-center">
            <Image
              src="/brainlet.png"
              alt="brainlet"
              width={32}
              height={32}
              className="rounded-full"
            />
            Place Bet
          </h3>

          <div className="flex flex-col gap-2 w-full">
            <label htmlFor="title" className="text-sm text-gray-500">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={bet.title}
              onChange={(e) => setBet({ ...bet, title: e.target.value })}
              className="bg-black border border-gray-800 rounded-[6px] p-2 w-full text-white"
            />
          </div>

          <div className="flex flex-col gap-2 w-full">
            <label htmlFor="description" className="text-sm text-gray-500">
              Description
            </label>
            <input
              type="text"
              id="description"
              value={bet.description}
              onChange={(e) => setBet({ ...bet, description: e.target.value })}
              className="bg-black border border-gray-800 rounded-[6px] p-2 w-full text-white"
            />
          </div>

          <div className="flex flex-col gap-2 w-full">
            <label htmlFor="dueDate" className="text-sm text-gray-500">
              Due date
            </label>
            <input
              aria-label="Date"
              type="date"
              className="border border-gray-800 rounded-[6px] p-2 w-full text-black"
              value={(bet.dueDate as Date)?.toISOString().split("T")[0]}
              onChange={(e) =>
                setBet({ ...bet, dueDate: e.target.valueAsDate! })
              }
            />
          </div>

          <div className="flex flex-col gap-2 w-full">
            <label
              htmlFor="isPricePrediction"
              className="text-sm text-gray-500"
            >
              Is this a price prediction?
            </label>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPricePrediction"
                checked={bet.isPricePrediction}
                onChange={(e) =>
                  setBet({ ...bet, isPricePrediction: e.target.checked })
                }
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-300">
                Yes, this is a price prediction
              </span>
            </div>
          </div>

          {bet.isPricePrediction && (
            <>
              <div className="flex flex-col gap-2 w-full">
                <label htmlFor="price" className="text-sm text-gray-500">
                  Price
                </label>
                <input
                  type="number"
                  id="price"
                  value={bet.predict?.price || ""}
                  onChange={(e) =>
                    setBet({
                      ...bet,
                      predict: { ...bet.predict!, price: e.target.value },
                    })
                  }
                  className="bg-black border border-gray-800 rounded-[6px] p-2 w-full text-white"
                />
              </div>

              <div className="flex flex-col gap-2 w-full">
                <label htmlFor="symbol" className="text-sm text-gray-500">
                  Symbol
                </label>
                <input
                  type="text"
                  id="symbol"
                  value={bet.predict?.symbol || ""}
                  onChange={(e) =>
                    setBet({
                      ...bet,
                      predict: { ...bet.predict!, symbol: e.target.value },
                    })
                  }
                  className="bg-black border border-gray-800 rounded-[6px] p-2 w-full text-white"
                />
              </div>
            </>
          )}

          {chain?.name !== "Sepolia" && (
            <button
              onClick={async () =>
                await switchChainAsync?.({ chainId: sepoliaChain?.id! })
              }
              className="p-2 rounded-md bg-blue-500 text-white w-full"
            >
              Switch Network
            </button>
          )}

          {chain?.name === "Sepolia" && (
            <CreateRequest
              bet={{
                dueDate: new Date(bet.dueDate).getTime(),
                title: bet.title,
                description: bet.description,
                predict: bet.isPricePrediction ? bet.predict : null,
              }}
            />
          )}
        </div>
      </div>
    </main>
  );
}
