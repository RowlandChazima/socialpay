import { auth } from "@/auth";
import cloudinary from "@/lib/cloudinary";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return Response.json({ error: "Unauthorised" }, { status: 401 });
    }

    const { paramsToSign } = await request.json();

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET!,
    );

    return Response.json({
      signature,
      apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    });
  } catch (error) {
    console.error("Cloudinary signature error:", error);

    return Response.json(
      { error: "Failed to generate a Cloudinary signature" },
      { status: 500 },
    );
  }
}
