"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { products } from "@/components/products";

export default function Home() {
  const [search, setSearch] = useState("");
  const [checkoutError, setCheckoutError] = useState("");
  const [checkoutSuccess, setCheckoutSuccess] = useState("");
  const visibleProducts = products.filter((product) =>
    `${product.name} ${product.description} ${product.category}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const handleBuy = (productId: string) => {
    setCheckoutError("");
    setCheckoutSuccess("");
    if (!window.DodoCheckout) {
      setCheckoutError("Checkout is unavailable. Please try again shortly.");
      return;
    }

    const product = products.find((item) => item.id === productId);
    window.DodoCheckout.open({
      productId,
      productName: product?.name,
      amount: product?.amount,
      onError: (error) => setCheckoutError(error.message),
      onSuccess: ({ message }) => {
        setCheckoutError("");
        setCheckoutSuccess(message);
      },
    });
  };

  return (
    <div className="min-h-screen">
      <Navbar search={search} onSearchChange={setSearch} />
      <main className="mx-auto w-full max-w-[1440px] px-5 pb-16 pt-9 sm:px-8 lg:px-12">
        <header className="mb-7 flex flex-wrap items-end justify-between gap-4 border-b border-[var(--line)] pb-5">
          <div>
            <p className="mb-2 text-base font-medium text-[#66716a]">
              OBJECTS FOR EVERY DAY
            </p>
            <h1 className="text-2xl font-bold leading-tight">
              Useful things, chosen well.
            </h1>
          </div>
        </header>

        {checkoutError && (
          <p
            aria-live="polite"
            className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-base font-medium text-red-800"
          >
            {checkoutError}
          </p>
        )}
        {checkoutSuccess && (
          <p
            aria-live="polite"
            className="mb-5 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-base font-medium text-green-800"
          >
            {checkoutSuccess}
          </p>
        )}

        {visibleProducts.length > 0 ? (
          <section
            aria-label="Products"
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {visibleProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onBuy={handleBuy}
              />
            ))}
          </section>
        ) : (
          <p className="py-20 text-center text-base font-medium text-[#66716a]">
            No products found for {search}. Try another search.
          </p>
        )}
      </main>
    </div>
  );
}
