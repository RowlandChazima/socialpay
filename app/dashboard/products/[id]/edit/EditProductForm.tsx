"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CldUploadWidget } from "next-cloudinary";

interface ProductImage {
  url: string;
  publicId: string;
}

interface EditProductFormProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    status: "DRAFT" | "ACTIVE" | "ARCHIVED";
    image: ProductImage;
  };
}

export default function EditProductForm({ product }: EditProductFormProps) {
  const router = useRouter();

  const [form, setForm] = useState({
    name: product.name,
    description: product.description,
    price: product.price.toString(),
    stock: product.stock.toString(),
    status: product.status,
  });

  const [image, setImage] = useState<ProductImage>(product.image);

  const [loading, setLoading] = useState(false);

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          price: Number(form.price),
          stock: Number(form.stock),
          status: form.status,
          image,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update product");
      }
      alert("Product updated successfully!");

      router.push("/dashboard/products");
      router.refresh();
    } catch (error) {
      console.error(error);

      alert(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium">
          Product name
        </label>

        <input
          id="name"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          className="mt-2 w-full rounded-md border px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium">
          Description
        </label>

        <textarea
          id="description"
          name="description"
          value={form.description}
          onChange={handleChange}
          required
          rows={4}
          className="mt-2 w-full rounded-md border px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="price" className="block text-sm font-medium">
          Price (KES)
        </label>

        <input
          id="price"
          name="price"
          type="number"
          min="1"
          step="1"
          value={form.price}
          onChange={handleChange}
          required
          className="mt-2 w-full rounded-md border px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="stock" className="block text-sm font-medium">
          Stock
        </label>

        <input
          id="stock"
          name="stock"
          type="number"
          min="0"
          step="1"
          value={form.stock}
          onChange={handleChange}
          required
          className="mt-2 w-full rounded-md border px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium">
          Status
        </label>

        <select
          id="status"
          name="status"
          value={form.status}
          onChange={handleChange}
          className="mt-2 w-full rounded-md border px-3 py-2"
        >
          <option value="DRAFT">Draft</option>
          <option value="ACTIVE">Active</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      <div>
        <p className="text-sm font-medium">Product image</p>

        <img
          src={image.url}
          alt={form.name}
          className="mt-3 h-48 w-full rounded-md object-cover"
        />

        <CldUploadWidget
          signatureEndpoint="/api/cloudinary/signature"
          onSuccess={(result) => {
            const info = result.info;

            if (
              typeof info === "object" &&
              info !== null &&
              "secure_url" in info &&
              "public_id" in info
            ) {
              setImage({
                url: String(info.secure_url),
                publicId: String(info.public_id),
              });
            }
          }}
        >
          {({ open }) => (
            <button
              type="button"
              onClick={() => open()}
              className="mt-3 rounded-md border px-4 py-2"
            >
              Change Image
            </button>
          )}
        </CldUploadWidget>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-black px-4 py-3 text-white disabled:opacity-50"
      >
        {loading ? "Saving Changes..." : "Save Changes"}
      </button>
    </form>
  );
}
