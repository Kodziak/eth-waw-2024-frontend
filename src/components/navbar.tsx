"use client";
import Image from "next/image";
import Link from "next/link";

export const Navbar = () => {
  return (
    <nav className="fixed top-0 w-full mx-auto flex justify-center bg-gradient-to-tr from-blue-900/20 to-blue-900/5 py-2 z-[99999] backdrop-blur-lg">
      <div className="max-w-[1440px] mx-auto flex justify-between w-full py-2 gap-2 px-2">
        <Link
          className="bg-gradient-to-r flex gap-2 items-center from-green-300 via-yellow-300 to-blue-300 inline-block text-transparent bg-clip-text text-sm my-auto"
          href="/"
        >
          <Image
            src="/logo.png"
            alt="bobr"
            width={32}
            height={32}
            className="rounded"
          />
          Bóbr Market
        </Link>

        <w3m-button label="Connect" size="sm" />
      </div>
    </nav>
  );
};
