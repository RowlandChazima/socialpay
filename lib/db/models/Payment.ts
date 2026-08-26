import mongoose, { Schema, models } from "mongoose";

const PaymentSchema = new Schema(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },

    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    provider: {
      type: String,
      enum: ["MPESA"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    currency: {
      type: String,
      default: "KES",
    },

    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "PENDING",
    },

    transactionId: {
      type: String,
      unique: true,
      sparse: true,
    },

    providerReference: {
      type: String,
    },

    phoneNumber: {
      type: String,
      required: true,
    },

    failureReason: {
      type: String,
    },
  },

  {
    timestamps: true,
  },
);

export const Payment =
  models.Payment || mongoose.model("Payment", PaymentSchema);
