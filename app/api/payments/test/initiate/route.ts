import { Order } from "@/lib/db/models/Order";
import { Payment } from "@/lib/db/models/Payment";
import { connectToDatabase } from "@/lib/db/mongodb";
import { initiateStkPush } from "@/lib/payments/mpesa";
import mongoose from "mongoose";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { orderId } = body;

    // Validate the order id's existence

    if (!orderId) {
      return Response.json({ error: "Order ID is required" }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return Response.json({ error: "Invalid order ID" }, { status: 400 });
    }

    // connect to mongoDB

    await connectToDatabase();

    //Find the order
    const order = await Order.findById(orderId);

    if (!order) {
      return Response.json({ error: "Order not found" }, { status: 404 });
    }

    // checking whether the order is payabable due to the like different statuses of the payment

    if (order.status !== "PENDING") {
      return Response.json(
        { error: "This order cannot be paid" },
        { status: 400 },
      );
    }

    // create a payment record in the DB

    const payment = await Payment.create({
      orderId: order._id,

      sellerId: order.sellerId,

      provider: "MPESA",

      amount: order.totalAmount,

      currency: order.currency,

      status: "PENDING",

      phoneNumber: order.customer.phone,
    });

    // initiate the stk push

    let stkResponse;

    try {
      stkResponse = await initiateStkPush({
        amount: order.totalAmount,

        phoneNumber: order.customer.phone,

        accountReference: order.orderNumber,

        transactionDescription: `Payment for ${order.orderNumber}`,
      });
    } catch (error) {
      payment.status = "FAILED";

      payment.failureReason =
        error instanceof Error ? error.message : "Payment initiation failed";

      await payment.save();

      throw error;
    }

    // store the daraja response after the push payment

    payment.providerReference = stkResponse.CheckoutRequestID;

    await payment.save();

    return Response.json(
      {
        message: "Payment request initiated successfully",

        payment: {
          id: payment._id.toString(),

          status: payment.status,

          provider: payment.provider,
        },

        stk: {
          merchantRequestId: stkResponse.MerchantRequestID,

          checkoutRequestId: stkResponse.CheckoutRequestID,

          responseDescription: stkResponse.ResponseDescription,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Payment initiation error:", error);

    return Response.json(
      {
        error: "Failed to initiate payment",
      },
      { status: 500 },
    );
  }
}
