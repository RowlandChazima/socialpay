"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface CheckoutFormProps {
  product: {
    id: string;
    name: string;
    price: string;
    stock: number;
  };
}

const CheckoutForm = ({ product }: CheckoutFormProps) => {
  const router = useRouter();

  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const total = product.price * quantity;

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          quantity,
          customerName,
          customerPhone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create order");
      }

      console.log("Order created:", data.order);

      router.push(`/checkout/${data.order.id}`);
    } catch (error) {
      console.error(error);

      alert(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6 ">
      <div>
        <label htmlFor="quantity" className="block text-sm font-medium">
          Quantity
        </label>

        <input
          id="quantity"
          type="number"
          min="1"
          max={product.stock}
          value={quantity}
          onChange={(event) => setQuantity(Number(event.target.value))}
          className="mt-2 w-full rounded-md border px-3 py-2"
          required
        />
      </div>

      <div>
        <label htmlFor="customerName" className="block text-sm font-medium">
          Full name
        </label>

        <input
          id="customerName"
          type="text"
          value={customerName}
          onChange={(event) => setCustomerName(event.target.value)}
          className="mt-2 w-full rounded-md border px-3 py-2"
          placeholder="John Doe"
          required
        />
      </div>

      <div>
        <label htmlFor="customerPhone" className="block text-sm font-medium">
          Phone number
        </label>

        <input
          id="customerPhone"
          type="tel"
          value={customerPhone}
          onChange={(event) => setCustomerPhone(event.target.value)}
          className="mt-2 w-full rounded-md border px-3 py-2"
          placeholder="0712345678"
          required
        />
      </div>

      <div className="rounded-md bg-gray-500 p-4">
        <div className="flex justify-between">
          <span>Price</span>

          <span>KES {product.price.toLocaleString()}</span>
        </div>

        <div className="mt-2 flex justify-between">
          <span>Quantity</span>

          <span>{quantity}</span>
        </div>

        <div className="mt-4 flex justify-between border-t pt-4 text-lg font-bold">
          <span>Total</span>

          <span>KES {total.toLocaleString()}</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-black px-6 py-3 font-medium text-white disabled:opacity-50"
      >
        {loading ? "Creating Order..." : "Continue to Payment"}
      </button>
    </form>
  );
};

export default CheckoutForm;
