"use client";

import { BetHistoryCard } from "@/components/bet-history-card";
import { HandleActionModal } from "@/components/handle-action-modal";
import { Loader } from "@/components/loader";
import { Navbar } from "@/components/navbar";
import { ActiveBetResponse, BetResponse } from "@/types/bet";
import { useQuery } from "@tanstack/react-query";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAccount } from "wagmi";

const getBet = async (id: string): Promise<BetResponse> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/events/${id}`,
  );

  return response.json();
};

const getActiveBets = async (id: string): Promise<ActiveBetResponse[]> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/events/${id}/bets`,
  );

  return response.json();
};

export default function Page({ params }: { params: { id: string } }) {
  const { data, isLoading } = useQuery({
    queryKey: ["bets"],
    queryFn: () => getBet(params.id),
  });

  const { data: activeBets, isLoading: isLoadingActiveBets } = useQuery({
    queryKey: ["active-bets"],
    queryFn: () => getActiveBets(params.id),
  });

  const [contracts, setContracts] = useState(data?.contracts);

  useEffect(() => {
    if (data?.contracts) {
      setContracts(data.contracts);
    } else {
      const interval = setInterval(async () => {
        try {
          const updatedData = await getBet(params.id);
          if (updatedData.contracts) {
            setContracts(updatedData.contracts);
            clearInterval(interval);
          }
        } catch (error) {
          console.error("Error fetching updated bet data:", error);
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [data, params.id]);

  const [showModal, setShowModal] = useState(false);
  const [action, setAction] = useState<"yes" | "no">("yes");

  const handleAction = (action: "yes" | "no") => {
    setAction(action);
    setShowModal(true);
  };

  const { address } = useAccount();

  return (
    <main className="w-screen min-h-screen relative bg-mempad-50 flex flex-col items-center gap-2 pb-8 px-2">
      <Navbar />

      <div className="max-w-[1440px] w-full mx-auto flex flex-col gap-6 z-[2] mt-[84px]">
        <div className="flex gap-2 flex-col">
          {isLoading && (
            <div className="text-white">
              <Loader />
            </div>
          )}

          <div className="flex justify-between gap-4">
            <div className="flex flex-col gap-2 flex-1">
              <h2 className="text-xl font-medium">{data?.title}</h2>
              <p className="text-sm text-gray-400">{data?.description}</p>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(
                  `${window.location.origin}/${params.id}`,
                );

                toast.success("Link copied to clipboard", {
                  style: {
                    background: "white",
                    color: "black",
                    border: "1px solid gray",
                    borderRadius: "6px",
                  },
                });
              }}
              className="p-2 rounded bg-blue-500/20 text-blue-300 text-sm font-medium my-auto"
            >
              Share
            </button>
          </div>

          <div className="w-full flex gap-2">
            <button
              className="flex-1 py-2 rounded-md text-sm font-medium text-green-400 bg-green-500/50 disabled:bg-gray-600 disabled:text-gray-400"
              onClick={(e) => {
                e.preventDefault();
                handleAction("yes");
              }}
              disabled={
                !!activeBets?.find((bet) => bet.walletAddress === address)
              }
            >
              Yes
            </button>
            <button
              className="flex-1 py-2 rounded-md text-red-400 bg-red-500/50 text-sm font-medium disabled:bg-gray-600 disabled:text-gray-400"
              onClick={(e) => {
                e.preventDefault();
                handleAction("no");
              }}
              disabled={
                !!activeBets?.find((bet) => bet.walletAddress === address)
              }
            >
              No
            </button>
          </div>
        </div>

        <div className="flex gap-2 flex-col">
          <h2 className="text-xl font-medium">Bets History</h2>

          {activeBets &&
            activeBets.length > 0 &&
            activeBets?.map((bet, index) => (
              <BetHistoryCard {...bet} key={index} title={data?.title!} />
            ))}
        </div>
      </div>

      <HandleActionModal
        requestId={params.id}
        action={action}
        isOpen={showModal}
        setIsOpen={setShowModal}
        contracts={contracts!}
      />
    </main>
  );
}
