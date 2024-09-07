/* eslint-disable indent */
import {
  IDKitWidget,
  ISuccessResult,
  VerificationLevel,
} from "@worldcoin/idkit";
import { verify } from "@/actions/verify";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useAccount, useClient, useReadContract, useSwitchChain } from "wagmi";
import { parseEther } from "viem";
import predictionsMarketAbi from "@/contracts/predictions-market.json";
import { WrapperBuilder } from "@redstone-finance/evm-connector";
import { ethers } from "ethers";
import { useEthersSigner } from "@/utils/providers";
import toast from "react-hot-toast";
import axios from "axios";
import { arbitrum } from "viem/chains";

export const HandleActionModal = ({
  requestId,
  action,
  contracts,
  isOpen,
  setIsOpen,
}: {
  requestId: string;
  action: "yes" | "no";
  contracts: {
    azero: string;
    celo: string;
    zircuit: string;
    mantle: string;
    sei: string;
  };
  isOpen: boolean;
  setIsOpen: any;
}) => {
  const [step, setStep] = useState<"verify" | "confirm">("verify");
  const { chain, address } = useAccount();
  const [value, setValue] = useState(0);
  const [selectedNetwork, setSelectedNetwork] = useState<string | undefined>(
    chain?.name,
  );

  const { chains, switchChainAsync, isPending } = useSwitchChain();

  const client = useClient();
  const signer = useEthersSigner({ chainId: client?.chain.id });

  useEffect(() => {
    (async () => {
      const selectedChain = chains.find(
        (chain) => chain.name.toString() === selectedNetwork,
      );
      if (selectedChain) {
        await switchChainAsync?.({
          chainId: selectedChain.id,
        });
      }
    })();
  }, [selectedNetwork, chains, switchChainAsync]);

  const onSuccess = (result: any) => {
    console.log(result);
    setStep("confirm");
  };

  const handleVerify = async (result: ISuccessResult) => {
    const data = await verify(result);

    if (data.success) {
      console.log("Successful response from backend:\n", JSON.stringify(data));
    } else {
      throw new Error(`Verification failed: ${data.detail}`);
    }
  };

  const getContractAddress = () => {
    switch (selectedNetwork) {
      case "Celo Alfajores":
        return contracts.celo;
      case "Aleph Zero EVM Testnet":
        return contracts.azero;
      case "Zircuit Testnet":
        return contracts.zircuit;
      case "Mantle":
        return contracts.mantle;
      case "Sei Devnet":
        return contracts.sei;
    }

    return "";
  };

  const contractAddress = getContractAddress();

  const handleTransfer = async () => {
    const contract = new ethers.Contract(
      contractAddress,
      predictionsMarketAbi,
      signer,
    );

    const wrappedContract = WrapperBuilder.wrap(contract).usingDataService({
      dataServiceId: "redstone-main-demo",
      uniqueSignersCount: 1,
      dataPackagesIds: ["ETH", "BTC"],
    });

    await wrappedContract.placeBet([action === "yes" ? true : false], {
      value: parseEther(value.toString().replace(",", ".")),
    });

    await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/bets`, {
      eventRequestId: requestId,
      walletAddress: address,
      prediction: action === "yes" ? "YES" : "NO",
      tokens: value,
      tokenName: getNetworkSymbol(selectedNetwork ?? ""),
    });

    setIsOpen(false);
    toast.success("Bet placed successfully", {
      style: {
        background: "white",
        color: "black",
        border: "1px solid gray",
        borderRadius: "6px",
      },
    });
  };

  const [claimError, setClaimError] = useState<string | null>(null);

  const handleClaim = async () => {
    const contractAddress = getContractAddress();

    const contract = new ethers.Contract(
      contractAddress,
      predictionsMarketAbi,
      signer,
    );

    const res = await contract
      .claim()
      .catch((e: any) => setClaimError(e.reason));
    console.log({ res });
  };

  const { data: alreadyBet } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: predictionsMarketAbi,
    functionName: "bets",
    args: [address],
  });

  const { data: canClaim } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: predictionsMarketAbi,
    functionName: "claims",
    args: [address],
  });

  console.log({ predictionsMarketAbi });

  if (!isOpen) return null;

  function getNetworkSymbol(
    selectedNetwork: string,
  ): import("react").ReactNode {
    const networkSymbols: { [key: string]: string } = {
      "Celo Alfajores": "CELO",
      "Aleph Zero EVM Testnet": "AZERO",
      "Zircuit Testnet": "ETH",
      Mantle: "MNT",
      "Sei Devnet": "SEI",
    };

    return networkSymbols[selectedNetwork] || "ETH";
  }

  return (
    <div className="absolute top-0 left-0 w-screen h-screen bg-black flex  pt-[164px] z-[99999] px-4">
      <button
        onClick={() => setIsOpen(false)}
        className="absolute top-16 right-6 text-white hover:text-gray-300 transition-colors"
        aria-label="Close"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {step === "confirm" && (
        <div className="flex flex-col gap-6 items-center w-full">
          <Image
            src="https://worldcoin.org/icons/logo-small.svg"
            alt="World ID"
            width={64}
            height={64}
            className="rounded-full bg-white"
          />

          <p className="text-sm text-gray-500 text-center">
            Prove that you&apos;re a real person by verifying your identity.
          </p>

          <div className="flex flex-col gap-2 w-full">
            <IDKitWidget
              app_id={process.env.NEXT_PUBLIC_WLD_APP_ID as `app_${string}`}
              action="bet"
              onSuccess={onSuccess}
              handleVerify={handleVerify}
              verification_level={VerificationLevel.Device}
            >
              {({ open }) => (
                <button
                  className="bg-white text-black p-3 rounded w-full"
                  onClick={open}
                >
                  Verify with World ID
                </button>
              )}
            </IDKitWidget>

            <button
              onClick={() => setIsOpen(false)}
              className="p-3 text-sm text-gray-400 border border-gray-800 w-full"
            >
              I&apos;m bot. Close.
            </button>
          </div>
        </div>
      )}

      {step === "verify" && (
        <div className="flex flex-col gap-6 items-center w-full">
          <h3 className=" text-white flex gap-2 items-center justify-center">
            <Image
              src="/brainlet.png"
              alt="brainlet"
              width={32}
              height={32}
              className="rounded-full"
            />
            Confirm Retardness
          </h3>
          <div className="flex flex-col gap-4 w-full">
            <div className="flex flex-col gap-2 w-full">
              <label htmlFor="network" className="text-sm text-gray-500">
                Select Network
              </label>
              <select
                id="network"
                value={selectedNetwork}
                onChange={(e) => setSelectedNetwork(e.target.value)}
                className="bg-black border border-gray-800 rounded-[6px] p-2 w-full text-white"
              >
                <option value="Alfajores">Celo Alfajores</option>
                <option value="Aleph Zero EVM Testnet">
                  Aleph Zero EVM Testnet
                </option>
                <option value="Zircuit Testnet">Zircuit</option>
                <option value="Mantle">Mantle</option>
                <option value="Sei Devnet">Sei</option>
              </select>
            </div>

            <div className="flex flex-col gap-2 w-full">
              <label htmlFor="amount" className="text-sm text-gray-500">
                Bet Amount
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  id="amount"
                  value={value}
                  onChange={(e) => setValue(Number(e.target.value))}
                  className="bg-black border border-gray-800 rounded-[6px] p-2 w-full text-white"
                />
                <span className="text-sm text-gray-500">
                  {getNetworkSymbol(selectedNetwork ?? "")}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full">
            {!canClaim && (
              <button
                className={`text-white rounded-[6px] p-2 w-full disabled:bg-gray-500 ${
                  action === "yes" ? "bg-green-500/50" : "bg-red-500/50"
                }`}
                onClick={handleTransfer}
                disabled={isPending || !!alreadyBet}
              >
                Execute
              </button>
            )}

            {!!alreadyBet && !canClaim && (
              <span className="text-gray-400 text-sm mx-auto">
                Already voted
              </span>
            )}

            {!!canClaim && (
              <>
                <button
                  className="p-2 w-full text-gray-400 bg-gray-900"
                  onClick={handleClaim}
                >
                  Claim
                </button>

                {claimError && (
                  <p className="text-red-500 text-xs mx-auto">{claimError}</p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
