"use client";

import { useState } from "react";

interface PaymentButtonProps {
  orderId: string;
  amount: number;
}

export default function PaymentButton({ orderId, amount }: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handlePayment() {
    setLoading(true);

    try {
      const response = await fetch("/api/payments/initiate", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          orderId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Payment failed");
      }

      console.log("Payment initiated:", data);

      alert("Payment request sent. Check your phone.");
    } catch (error) {
      console.error(error);

      alert(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handlePayment}
      disabled={loading}
      className="mt-6 w-full rounded-md bg-black px-6 py-3 font-medium text-white disabled:opacity-50"
    >
      {loading
        ? "Sending Payment Request..."
        : `Pay KES ${amount.toLocaleString()}`}
    </button>
  );
}
