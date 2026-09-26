"use client";

import { FiSearch } from "react-icons/fi";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <label className="flex h-11 w-full items-center gap-3 rounded-full border border-[var(--line)] bg-[#f6f6f2] px-4 transition-colors focus-within:border-[#18201c] sm:max-w-[430px]">
      <FiSearch aria-hidden="true" className="size-5 shrink-0 text-[#66716a]" />
      <input
        aria-label="Search products"
        className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-[#7c857f]"
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search the collection"
        type="search"
        value={value}
      />
    </label>
  );
}
