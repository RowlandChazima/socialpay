import Link from "next/link";

import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Product } from "@/lib/db/models/Product";

export default async function ProductsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  await connectToDatabase();

  const products = await Product.find({
    sellerId: session.user.id,
  })
    .sort({ createdAt: -1 })
    .lean();

  return (
    <main className="mx-auto max-w-6xl p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>

          <p className="mt-1 text-gray-600">
            Manage the products in your store.
          </p>
        </div>

        <Link
          href="/dashboard/products/new"
          className="rounded-md bg-black px-4 py-2 text-sm font-medium font-mono text-white"
        >
          + Add Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="mt-12 rounded-lg border p-12 text-center">
          <h2 className="text-xl font-semibold">Your store is empty</h2>

          <p className="mt-2 text-gray-600">
            Create your first product to start selling.
          </p>

          <Link
            href="/dashboard/products/new"
            className="mt-6 inline-block rounded-md bg-black px-5 py-2.5 text-sm font-medium text-white"
          >
            Create Your First Product
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div
              key={product._id.toString()}
              className="overflow-hidden rounded-lg border"
            >
              <img
                src={product.image.url}
                alt={product.name}
                className="h-56 w-full object-cover"
              />

              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="font-semibold">{product.name}</h2>

                  <span
                    className={
                      product.status === "ACTIVE"
                        ? "text-sm text-green-600"
                        : "text-sm text-gray-500"
                    }
                  >
                    {product.status}
                  </span>
                </div>

                <p className="mt-2 text-lg font-bold">
                  KES {product.price.toLocaleString()}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  {product.stock} in stock
                </p>

                <div className="mt-5 flex gap-3">
                  <Link
                    href={`/buy/${product.slug}`}
                    className="rounded-md border px-3 py-2 text-sm"
                  >
                    View
                  </Link>

                  <Link
                    href={`/dashboard/products/${product._id}/edit`}
                    className="rounded-md border px-3 py-2 text-sm"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
