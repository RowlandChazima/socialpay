import mongoose, { Document, Model, Schema, Types } from "mongoose";

export type ProductStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";

export interface IProduct extends Document {
  sellerId: Types.ObjectId;

  name: string;
  description: string;

  price: number;
  currency: "KES";

  stock: number;

  image: {
    url: string;
    publicId: string;
  };

  status: ProductStatus;

  slug: string;

  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: "Price must be a whole number",
      },
    },

    currency: {
      type: String,
      enum: ["KES"],
      default: "KES",
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "Stock must be a whole number",
      },
    },

    image: {
      url: {
        type: String,
        required: true,
      },

      publicId: {
        type: String,
        required: true,
      },
    },

    status: {
      type: String,
      enum: ["DRAFT", "ACTIVE", "ARCHIVED"],
      default: "DRAFT",
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
