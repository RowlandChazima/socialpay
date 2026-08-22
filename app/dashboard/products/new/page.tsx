"use client";

import { useState } from "react";
import { CldUploadWidget } from "next-cloudinary";

interface ImageData {
  url: string;
  publicId: string;
}

export default function NewProductPage() {
  const [image, setImage] = useState<ImageData | null>(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
  });

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!image) {
      alert("Please upload a product image.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          price: Number(form.price),
          stock: Number(form.stock),
          image,
          status: "ACTIVE",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create product");
      }

      console.log("Product created:", data.product);

      alert("Product created successfully!");

      setForm({
        name: "",
        description: "",
        price: "",
        stock: "",
      });

      setImage(null);
    } catch (error) {
      console.error(error);

      alert(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-3xl font-bold">Create Product</h1>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
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
            placeholder="Nike Air Max"
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
            placeholder="Describe your product..."
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
            placeholder="2500"
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
            placeholder="10"
          />
        </div>

        <div>
          <p className="text-sm font-medium">Product image</p>

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
                className="mt-2 rounded-md border px-4 py-2"
              >
                {image ? "Change Image" : "Upload Image"}
              </button>
            )}
          </CldUploadWidget>

          {image && (
            <p className="mt-2 text-sm text-green-600">
              Image uploaded successfully ✓
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-black px-4 py-3 text-white disabled:opacity-50"
        >
          {loading ? "Creating Product..." : "Create Product"}
        </button>
      </form>
    </main>
  );
}
