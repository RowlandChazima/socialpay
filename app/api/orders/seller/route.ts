import { auth } from "@/auth";
import { Order } from "@/lib/db/models/Order";
import { connectToDatabase } from "@/lib/db/mongodb";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorised" }, { status: 401 });
    }

    await connectToDatabase();

    const orders = await Order.find({ sellerId: session.user.id })
      .populate("productId", "name image")
      .sort({ createdAt: -1 })
      .lean();

    return Response.json({ orders });
  } catch (error) {
    console.error("Failed to fetch seller orders:", error);

    return Response.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
