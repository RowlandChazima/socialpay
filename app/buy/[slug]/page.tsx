import { notFound } from "next/navigation";

import { connectToDatabase } from "@/lib/db/mongodb";
import { Product } from "@/lib/db/models/Product";
import CheckoutForm from "./CheckoutForm";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  await connectToDatabase();

  const product = await Product.findOne({
    slug,
    status: "ACTIVE",
  }).lean();

  if (!product) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background text-white">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="grid overflow-hidden rounded-xl bg-background shadow-sm md:grid-cols-2">
          <div>
            <img
              src={product.image.url}
              alt={product.name}
              className="h-full min-h-[400px] w-full object-cover"
            />
          </div>

          <div className="flex flex-col justify-center p-8 md:p-12">
            <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
              SocialPay
            </p>

            <h1 className="mt-3 text-4xl font-bold">{product.name}</h1>

            <p className="mt-6 text-3xl font-bold">
              KES {product.price.toLocaleString()}
            </p>

            <p className="mt-6 leading-7 text-gray-600">
              {product.description}
            </p>

            <p className="mt-6 text-sm text-gray-500">
              {product.stock > 0
                ? `${product.stock} available`
                : "Out of stock"}
            </p>

            <CheckoutForm
              product={{
                id: product._id.toString(),
                name: product.name,
                price: product.price,
                stock: product.stock,
              }}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
