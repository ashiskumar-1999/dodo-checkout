export type Product = {
  id: string;
  name: string;
  amount: number;
  category: string;
  description: string;
  image: string;
  imageAlt: string;
};

export const products: Product[] = [
  {
    id: "prod_234",
    name: "Studio Camera",
    amount: 189,
    category: "Photography",
    description: "A compact camera for collecting everyday moments.",
    image:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1100&q=85",
    imageAlt: "Compact black camera on a clean surface",
  },
  {
    id: "prod_235",
    name: "Quiet Headphones",
    amount: 128,
    category: "Audio",
    description: "Comfortable over-ear listening, wherever the day goes.",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1100&q=85",
    imageAlt: "Wireless headphones photographed against a warm backdrop",
  },
  {
    id: "prod_236",
    name: "Everyday Watch",
    amount: 164,
    category: "Accessories",
    description: "A clear, considered dial with a durable leather strap.",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1100&q=85",
    imageAlt: "Minimal wristwatch with a dark strap",
  },
  {
    id: "prod_237",
    name: "Canvas Weekender",
    amount: 96,
    category: "Bags",
    description: "Room for a little more, without carrying too much.",
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1100&q=85",
    imageAlt: "Structured everyday backpack in a neutral color",
  },
  {
    id: "prod_238",
    name: "Field Sneakers",
    amount: 112,
    category: "Footwear",
    description: "An easy-wearing pair made for long days on your feet.",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1100&q=85",
    imageAlt: "Red low-top sneaker in side profile",
  },
  {
    id: "prod_239",
    name: "Daily Pour-Over",
    amount: 54,
    category: "Home",
    description: "A simple ceramic brewer for a slower morning ritual.",
    image:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1100&q=85",
    imageAlt: "Freshly brewed coffee served on a wooden table",
  },
];
