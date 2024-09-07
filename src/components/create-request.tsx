"use client";

import toast from "react-hot-toast";
import {
  RequestNetwork,
  Types,
  Utils,
} from "@requestnetwork/request-client.js";
import { Web3SignatureProvider } from "@requestnetwork/web3-signature";
import { useState } from "react";
import { parseUnits, zeroAddress } from "viem";
import { useAccount, useClient } from "wagmi";

import { payRequest } from "@requestnetwork/payment-processor";
import axios from "axios";

import { useRouter } from "next/navigation";
import { publicClientToProvider, useEthersSigner } from "@/utils/providers";
import { Bet } from "@/types/bet";
import { Loader } from "./loader";

enum APP_STATUS {
  AWAITING_INPUT = "awaiting input",
  SUBMITTING = "submitting",
  PERSISTING_TO_IPFS = "persisting to ipfs",
  PERSISTING_ON_CHAIN = "persisting on-chain",
  REQUEST_CONFIRMED = "request confirmed",
  ERROR_OCCURRED = "error occurred",
}

const paymentRecipient = "0x1c86434ae71AB548772D6A6b19727589b59b6C99";

export const CreateRequest = ({
  bet,
}: {
  bet: Omit<Bet, "isPricePrediction">;
}) => {
  const router = useRouter();
  const [status, setStatus] = useState(APP_STATUS.AWAITING_INPUT);
  const { address } = useAccount();
  const client = useClient();
  const [isLoading, setIsLoading] = useState(false);

  const publicClient = publicClientToProvider();
  const signer = useEthersSigner({ chainId: client?.chain.id });

  async function createRequest() {
    setIsLoading(true);
    const signatureProvider = new Web3SignatureProvider(publicClient.provider);
    const inMemoryRequestNetwork = new RequestNetwork({
      nodeConnectionConfig: {
        baseURL: "https://gnosis.gateway.request.network/",
      },
      signatureProvider,
      skipPersistence: true,
    });

    const requestCreateParameters: Types.ICreateRequestParameters = {
      requestInfo: {
        // The currency in which the request is denominated
        currency: {
          type: Types.RequestLogic.CURRENCY.ETH,
          value: "ETH",
          network: "sepolia",
        },

        // The expected amount as a string, in parsed units, respecting `decimals`
        // Consider using `parseUnits()` from ethers or viem
        expectedAmount: parseUnits("0.000001", 18).toString(),

        // The payee identity. Not necessarily the same as the payment recipient.
        payee: {
          type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
          value: paymentRecipient,
        },

        // The payer identity. If omitted, any identity can pay the request.
        payer: {
          type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
          value: address as string,
        },

        // The request creation timestamp.
        timestamp: Utils.getCurrentTimestampInSecond(),
      },

      // The paymentNetwork is the method of payment and related details.
      paymentNetwork: {
        id: Types.Extension.PAYMENT_NETWORK_ID.ETH_FEE_PROXY_CONTRACT,
        parameters: {
          paymentNetworkName: "sepolia",
          paymentAddress: paymentRecipient,
          feeAddress: zeroAddress,
          feeAmount: "0",
        },
      },

      contentData: {
        reason: "Create Bet 🍕",
        dueDate: new Date().toISOString().split("T")[0].replace(/-/g, "."),
      },

      signer: {
        type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
        value: address as string,
      },
    };

    const inMemoryRequest = await inMemoryRequestNetwork.createRequest(
      requestCreateParameters,
    );

    console.log({ inMemoryRequest });

    const paymentRequest = await payRequest(
      inMemoryRequest.inMemoryInfo?.requestData!,
      signer,
    );
    console.log({ paymentRequest });
    const paymentRequestWait = await paymentRequest.wait(1);
    console.log({ paymentRequestWait });

    const saveBetResponse = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/events`,
      {
        requestId: paymentRequestWait.transactionHash,
        ...bet,
      },
    );
    console.log({ saveBetResponse });

    const persistingRequestNetwork = new RequestNetwork({
      nodeConnectionConfig: {
        baseURL: "https://gnosis.gateway.request.network/",
      },
    });

    try {
      setStatus(APP_STATUS.PERSISTING_TO_IPFS);
      await persistingRequestNetwork.persistRequest(inMemoryRequest);
      setStatus(APP_STATUS.REQUEST_CONFIRMED);
      toast.success("Request created successfully", {
        style: {
          background: "white",
          color: "black",
          border: "1px solid gray",
          borderRadius: "6px",
        },
      });
      setIsLoading(false);
      router.push(`/${paymentRequestWait.transactionHash}`);
    } catch (err) {
      setStatus(APP_STATUS.ERROR_OCCURRED);
      setIsLoading(false);
      alert(err);
    }
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <button
        className="bg-white text-black p-2 rounded text-center items-center"
        onClick={createRequest}
      >
        {isLoading ? (
          <div className="text-black">
            <Loader />
          </div>
        ) : (
          "Create Request"
        )}
      </button>
      {status === APP_STATUS.REQUEST_CONFIRMED && (
        <span className="w-full text-center text-sm text-gray-500">
          Request Confirmed. Bet will be created shortly...
        </span>
      )}
    </div>
  );
};
