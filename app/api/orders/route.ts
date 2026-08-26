import { Order } from "@/lib/db/models/Order";
import { Product } from "@/lib/db/models/Product";
import { connectToDatabase } from "@/lib/db/mongodb";
import mongoose from "mongoose";

function generateOrderNumber() {
  return `SP-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { productId, quantity, customerName, customerPhone } = body;

    //Validate input

    if (
      !productId ||
      !quantity === undefined ||
      !customerName ||
      !customerPhone
    ) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return Response.json({ error: "Invalid Product ID" }, { status: 400 });
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      return Response.json(
        { error: "Quantity must be a positive whole number" },
        { status: 400 },
      );
    }

    // COnnect to MongoDB

    await connectToDatabase();

    //Locate the product in mongoDB

    const product = await Product.findOne({
      _id: productId,
      status: "ACTIVE",
    }).lean();

    if (!product) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }

    //Check whether the product is still in stock

    if (product.stock < quantity) {
      return Response.json(
        { error: `Only ${product.stock} item(s) available` },
        { status: 400 },
      );
    }

    // Calculate the total

    const unitPrice = product.price;
    const totalAmount = unitPrice * quantity;

    // Create the order
    const order = await Order.create({
      orderNumber: generateOrderNumber(),

      sellerId: product.sellerId,

      productId: product._id,

      customer: {
        name: customerName.trim(),
        phone: customerPhone.trim(),
      },

      quantity,

      unitPrice,

      totalAmount,

      currency: "KES",

      status: "PENDING",

      payment: {
        status: "PENDING",
      },
    });

    return Response.json(
      {
        message: "Order created successfully",

        order: {
          id: order._id.toString(),
          orderNumber: order.orderNumber,
          totalAmount: order.totalAmount,
          currency: order.currency,
          status: order.status,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create order error:", error);

    return Response.json(
      { error: "Failed to create an order" },
      { status: 500 },
    );
  }
}
