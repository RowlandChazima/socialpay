import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Product } from "@/lib/db/models/Product";

import EditProductForm from "./EditProductForm";

interface EditProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== "SELLER") {
    redirect("/dashboard");
  }

  const { id } = await params;

  await connectToDatabase();

  const product = await Product.findOne({
    _id: id,
    sellerId: session.user.id,
  }).lean();

  if (!product) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-2xl p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit Product</h1>

        <p className="mt-1 text-gray-600">Update your product information.</p>
      </div>

      <EditProductForm
        product={{
          id: product._id.toString(),
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          status: product.status,
          image: product.image,
        }}
      />
    </main>
  );
}
