import { getMpesaAccessToken } from "@/lib/payments/mpesa";

export async function GET() {
  try {
    const token = await getMpesaAccessToken();

    return Response.json({
      success: true,
      message: "Daraja authentication successful",
      tokenReceived: Boolean(token),
    });
  } catch (error) {
    console.error("Daraja authentication test failed:", error);

    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
