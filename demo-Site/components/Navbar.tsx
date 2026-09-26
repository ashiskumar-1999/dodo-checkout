"use client";

import { FiUser } from "react-icons/fi";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";

type NavbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
};

export default function Navbar({ search, onSearchChange }: NavbarProps) {
  return (
    <nav className="border-b border-[var(--line)] bg-white">
      <div className="mx-auto flex min-h-[76px] w-full max-w-[1440px] items-center justify-between gap-4 px-5 py-3 sm:px-8 lg:px-12">
        <Link
          aria-label="Common Goods home"
          className="shrink-0 text-2xl font-bold leading-none"
          href="/"
        >
          DodoShop<span className="text-[#758247]">.</span>
        </Link>
        <div className="hidden flex-1 justify-center px-4 sm:flex">
          <SearchBar value={search} onChange={onSearchChange} />
        </div>
        <button
          aria-label="Your account"
          className="flex size-11 shrink-0 items-center justify-center rounded-full border border-[var(--line)] text-[#18201c] transition-colors hover:bg-[#f6f6f2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#18201c]"
          type="button"
        >
          <FiUser aria-hidden="true" className="size-5" />
        </button>
      </div>
      <div className="px-5 pb-3 sm:hidden">
        <SearchBar value={search} onChange={onSearchChange} />
      </div>
    </nav>
  );
}
