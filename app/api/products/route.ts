import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Product } from "@/lib/db/models/Product";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "SELLER") {
      return Response.json(
        { error: "Only sellers can create products" },
        { status: 403 },
      );
    }

    const body = await request.json();

    const { name, description, price, stock, image, status = "DRAFT" } = body;

    if (
      !name ||
      !description ||
      price === undefined ||
      stock === undefined ||
      !image?.url ||
      !image?.publicId
    ) {
      return Response.json(
        { error: "Missing required product fields" },
        { status: 400 },
      );
    }

    if (!Number.isInteger(price) || price < 1) {
      return Response.json(
        { error: "Price must be a positive whole number" },
        { status: 400 },
      );
    }

    if (!Number.isInteger(stock) || stock < 0) {
      return Response.json(
        { error: "Stock must be a whole number greater than or equal to 0" },
        { status: 400 },
      );
    }

    if (!["DRAFT", "ACTIVE"].includes(status)) {
      return Response.json(
        { error: "Invalid product status" },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const product = await Product.create({
      sellerId: session.user.id,
      name,
      description,
      price,
      currency: "KES",
      stock,
      image: {
        url: image.url,
        publicId: image.publicId,
      },
      status,
      slug: createSlug(name),
    });

    return Response.json(
      {
        message: "Product created successfully",
        product,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create product error:", error);

    return Response.json(
      { error: "Failed to create product" },
      { status: 500 },
    );
  }
}

function createSlug(name: string) {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-") +
    "-" +
    Math.random().toString(36).substring(2, 8)
  );
}

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "SELLER") {
      return Response.json(
        { error: "Only sellers can access products" },
        { status: 403 },
      );
    }

    await connectToDatabase();

    const products = await Product.find({
      sellerId: session.user.id,
    })
      .sort({ createdAt: -1 })
      .lean();

    return Response.json({
      products,
    });
  } catch (error) {
    console.error("Get products error:", error);

    return Response.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}
