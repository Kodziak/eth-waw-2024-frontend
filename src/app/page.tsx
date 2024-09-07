"use client";
import { BetCard } from "@/components/bet-card";
import { BetHistoryCard } from "@/components/bet-history-card";
import { Loader } from "@/components/loader";
import { Navbar } from "@/components/navbar";
import { ActiveBetResponse, BetResponse } from "@/types/bet";
import { getActiveBets, getBets } from "@/utils/api";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const { data, isLoading } = useQuery({
    queryKey: ["bets"],
    queryFn: () => getBets(),
  });

  const { data: activeBets } = useQuery({
    queryKey: ["active-bets"],
    queryFn: () => getActiveBets(),
  });

  return (
    <main className="w-screen min-h-screen relative bg-mempad-50 flex flex-col items-center gap-2 pb-8 px-2">
      <Navbar />

      {/* MAIN ALL */}
      <div className="max-w-[1440px] w-full mx-auto flex flex-col gap-6 z-[2] mt-[84px]">
        <div className="flex flex-col gap-2 items-center">
          <div className="w-full flex gap-2 items-center">
            <Image
              src="/logo.png"
              alt="logo"
              width={64}
              height={64}
              className="rounded"
            />
            <div className="flex flex-col gap-1">
              <h1>Bobr Market</h1>
              <p className="text-sm text-gray-400">
                The best retarded crypto market in the cryptoverse.
              </p>
            </div>
          </div>

          <Link
            href="/create"
            className=" text-black w-full bg-white p-2 rounded-md flex gap-2 items-center justify-center"
          >
            <Image
              src="/brainlet.png"
              alt="brainlet"
              width={32}
              height={32}
              className="rounded-full"
            />
            Place Bet
          </Link>
        </div>

        <div className="flex gap-2 flex-col">
          {data &&
            data?.length > 0 &&
            [...data]
              .reverse()
              .map((item: BetResponse, index: number) => (
                <BetCard key={index} {...item} />
              ))}

          {isLoading && (
            <div className="text-white">
              <Loader />
            </div>
          )}
        </div>

        <div className="flex gap-2 flex-col">
          <h2 className="text-xl font-medium">Active Bets</h2>

          {activeBets &&
            activeBets.length > 0 &&
            activeBets?.map((bet, index) => (
              <BetHistoryCard {...bet} key={index} title={bet.eventTitle} />
            ))}
        </div>

        {/* <CreateRequest /> */}
      </div>
    </main>
  );
}
