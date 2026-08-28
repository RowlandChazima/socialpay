import { notFound } from "next/navigation";

import { connectToDatabase } from "@/lib/db/mongodb";
import { Order } from "@/lib/db/models/Order";
import { Product } from "@/lib/db/models/Product";
import PaymentButton from "./PaymentButton";

interface CheckoutPageProps {
  params: Promise<{
    orderId: string;
  }>;
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { orderId } = await params;

  await connectToDatabase();

  const order = await Order.findById(orderId).populate("productId").lean();

  if (!order) {
    notFound();
  }

  const product = order.productId as unknown as {
    name: string;
    image: {
      url: string;
    };
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <div className="rounded-xl bg-gray-500/30 p-8 shadow-sm">
          <div className="mb-8">
            <p className="text-sm text-gray-500">Order {order.orderNumber}</p>

            <h1 className="mt-2 text-3xl font-bold">Complete Your Payment</h1>
          </div>

          <div className="flex gap-4 border-b pb-6">
            <img
              src={product.image.url}
              alt={product.name}
              className="h-24 w-24 rounded-md object-cover"
            />

            <div>
              <h2 className="font-semibold">{product.name}</h2>

              <p className="mt-1 text-sm text-gray-500">
                Quantity: {order.quantity}
              </p>

              <p className="mt-2 font-semibold">
                KES {order.totalAmount.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold">Payment</h2>

            <p className="mt-2 text-sm text-gray-600">
              Your order has been created. Complete the payment to confirm your
              order.
            </p>

            <PaymentButton
              orderId={order._id.toString()}
              amount={order.totalAmount}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
