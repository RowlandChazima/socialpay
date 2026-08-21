import { auth } from "@/auth";
import ImageUploader from "@/components/cloudinary/ImageUploader";
import { redirect } from "next/navigation";
import React from "react";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Seller Dashboard</h1>

      <p className="mt-2 text-gray-600">Welcome to SocialPay</p>
      <p className="mt-2 text-gray-600">Welcome, {session.user.name}</p>

      <div className="mt-8">
        <ImageUploader />
      </div>
    </div>
  );
}
