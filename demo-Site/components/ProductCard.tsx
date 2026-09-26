import type { Product } from "@/components/products";

type ProductCardProps = {
  product: Product;
  onBuy: (productId: string) => void;
};

export default function ProductCard({ product, onBuy }: ProductCardProps) {
  return (
    <article className="grid h-[500px] grid-rows-2 overflow-hidden rounded-[10px] border border-[var(--line)] bg-white">
      <div
        aria-label={product.imageAlt}
        className="min-h-0 bg-[#e7e8e1] bg-cover bg-center"
        role="img"
        style={{ backgroundImage: `url("${product.image}")` }}
      />
      <div className="flex min-h-0 flex-col justify-between p-5">
        <div>
          <div className="flex items-start justify-between gap-3">
            <h2 className="min-w-0 text-2xl font-bold leading-tight">
              {product.name}
            </h2>
            <p className="shrink-0 text-2xl font-bold leading-tight">
              ${product.amount.toFixed(2)}
            </p>
          </div>
          <p className="mt-2 text-base font-medium leading-6 text-[#66716a]">
            {product.description}
          </p>
        </div>
        <button
          className="flex min-h-14 w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-[32px] font-bold leading-[38px] text-white transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          onClick={() => onBuy(product.id)}
          type="button"
        >
          Buy
        </button>
      </div>
    </article>
  );
}
