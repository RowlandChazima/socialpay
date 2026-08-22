import { auth } from "@/auth";
import { Product } from "@/lib/db/models/Product";
import { connectToDatabase } from "@/lib/db/mongodb";
import mongoose from "mongoose";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorised" }, { status: 401 });
    }

    if (session.user.role !== "SELLER") {
      return Response.json(
        { error: "Only sellers can edit products" },
        { status: 403 },
      );
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json({ error: "Invalid product ID" }, { status: 400 });
    }

    const body = await request.json();

    const { name, description, price, stock, image, status } = body;

    if (!name || !description || price === undefined || stock === undefined) {
      return Response.json(
        { error: "Missing requires product fields" },
        { status: 400 },
      );
    }

    if (!Number.isInteger(price) || price < 1) {
      return Response.json(
        { error: "Price must be a positive whole number " },
        { status: 400 },
      );
    }

    if (!Number.isInteger(stock) || stock < 0) {
      return Response.json(
        { error: "Stock must be a whole number greater than or equal to 0" },
        { status: 400 },
      );
    }

    if (
      status !== undefined &&
      !["DRAFT", "ACTIVE", "ARCHIVED"].includes(status)
    ) {
      return Response.json(
        { error: "Invalid product status" },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const product = await Product.findOne({
      _id: id,
      sellerId: session.user.id,
    });

    if (!product) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }

    product.name = name;
    product.description = description;
    product.price = price;
    product.stock = stock;

    // Replace the image of a new image is provided

    if (image?.url && image?.publicId) {
      product.image = {
        url: image.url,
        publicId: image.publicId,
      };
    }

    if (status !== undefined) {
      product.status = status;
    }

    await product.save();

    return Response.json({
      message: "Product updated succesfully",
      product,
    });
  } catch (error) {
    console.error("Update product error:", error);

    return Response.json(
      { error: "Failed to upload product" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorised" }, { status: 401 });
    }

    if (session.user.role !== "SELLER") {
      return Response.json(
        { error: "Only sellers can delete products" },
        { status: 403 },
      );
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json({ error: "Invalid product ID" }, { status: 400 });
    }

    await connectToDatabase();

    const product = await Product.findOneAndDelete({
      _id: id,
      sellerId: session.user.id,
    });

    if (!product) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }

    return Response.json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);

    return Response.json(
      { error: "Failed to delete product" },
      { status: 500 },
    );
  }
}
