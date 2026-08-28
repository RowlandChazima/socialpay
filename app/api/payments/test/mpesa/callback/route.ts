import { connectToDatabase } from "@/lib/db/mongodb";
import { Payment } from "@/lib/db/models/Payment";
import { Order } from "@/lib/db/models/Order";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log("M-Pesa callback received:", JSON.stringify(body, null, 2));

    await connectToDatabase();

    /*
     * Daraja sends the STK Push result
     * inside Body.stkCallback.
     */

    const callback = body?.Body?.stkCallback;

    if (!callback) {
      console.error("Invalid M-Pesa callback payload");

      return Response.json(
        {
          ResultCode: 1,
          ResultDesc: "Invalid callback payload",
        },
        { status: 400 },
      );
    }

    const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } =
      callback;

    if (!CheckoutRequestID) {
      console.error("Missing CheckoutRequestID");

      return Response.json(
        {
          ResultCode: 1,
          ResultDesc: "Missing CheckoutRequestID",
        },
        { status: 400 },
      );
    }

    /*
     * Find the payment using the reference
     * we saved when initiating the STK Push.
     */

    const payment = await Payment.findOne({
      providerReference: CheckoutRequestID,
    });

    if (!payment) {
      console.error("Payment not found:", CheckoutRequestID);

      return Response.json({
        ResultCode: 0,
        ResultDesc: "Accepted",
      });
    }

    /*
     * ResultCode 0 means the M-Pesa
     * transaction was successful.
     */

    if (ResultCode === 0) {
      let transactionId: string | undefined;

      if (CallbackMetadata?.Item) {
        const receiptItem = CallbackMetadata.Item.find(
          (item: { Name: string; Value?: string | number }) =>
            item.Name === "MpesaReceiptNumber",
        );

        transactionId = receiptItem?.Value?.toString();
      }

      payment.status = "SUCCESS";

      payment.transactionId = transactionId;

      await payment.save();

      await Order.findByIdAndUpdate(payment.orderId, {
        status: "PAID",
      });
    } else {
      /*
       * The payment was unsuccessful.
       */

      payment.status = "FAILED";

      payment.failureReason = ResultDesc || "M-Pesa payment failed";

      await payment.save();
    }

    return Response.json({
      ResultCode: 0,
      ResultDesc: "Accepted",
    });
  } catch (error) {
    console.error("M-Pesa callback error:", error);

    /*
     * We still return a response so Daraja
     * receives a valid HTTP response.
     */

    return Response.json({
      ResultCode: 0,
      ResultDesc: "Accepted",
    });
  }
}
