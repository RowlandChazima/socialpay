"use client";

import { useEffect, useState } from "react";

interface Order {
  _id: string;
  orderNumber: string;
  quantity: number;
  totalAmount: number;
  currency: string;
  status: string;
  createdAt: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
  };
  productId: {
    name: string;
    image?: {
      url: string;
    };
  };
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchOrders() {
    try {
      setLoading(true);

      const response = await fetch("/api/orders/seller", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch orders");
      }

      setOrders(data.orders);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // to fetch and update statuses once a payment goes through as successful on the seller orders
  // fetching orders every 5 seconds
  useEffect(() => {
    fetchOrders();

    const interval = setInterval(() => {
      fetchOrders();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <p>Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <main className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Orders</h1>

        <p className="mt-2 text-gray-500">
          Track customer orders and payment status.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-lg border bg-white p-8 text-center">
          <p className="text-gray-500">No orders yet.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Order
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Product
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Customer
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Amount
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Status
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td className="px-6 py-4">
                      <p className="font-medium">{order.orderNumber}</p>

                      <p className="text-sm text-gray-500">
                        × {order.quantity}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      {order.productId?.name || "Unknown product"}
                    </td>

                    <td className="px-6 py-4">
                      <p>{order.customer.name}</p>

                      <p className="text-sm text-gray-500">
                        {order.customer.phone}
                      </p>
                    </td>

                    <td className="px-6 py-4 font-medium">
                      {order.currency} {order.totalAmount.toLocaleString()}
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge status={order.status} />
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    PAID: "bg-green-100 text-green-800",
    FAILED: "bg-red-100 text-red-800",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        styles[status] || "bg-gray-100 text-gray-800"
      }`}
    >
      {status}
    </span>
  );
}
