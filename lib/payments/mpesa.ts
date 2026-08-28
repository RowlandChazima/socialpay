const DARAJA_BASE_URL =
  process.env.DARAJA_BASE_URL || "https://sandbox.safaricom.co.ke";

export async function getMpesaAccessToken() {
  const consumerKey = process.env.DARAJA_CONSUMER_KEY;
  const consumerSecret = process.env.DARAJA_CONSUMER_SECRET;

  if (!consumerKey || !consumerSecret) {
    throw new Error("Daraja consumer credentials are not configured");
  }

  const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString(
    "base64",
  );

  const response = await fetch(
    `${DARAJA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
    {
      method: "GET",
      headers: {
        Authorization: `Basic ${credentials}`,
        Accept: "application/json",
      },

      cache: "no-store",
    },
  );

  if (!response.ok) {
    const errorText = await response.text();

    console.error("Daraja status", response.status);
    console.error("Daraja OAuth error:", errorText);

    throw new Error(`Daraja OAuth failed with status ${response.status}`);
  }

  const data = await response.json();

  console.log({
    baseUrl: DARAJA_BASE_URL,
    hasConsumerKey: Boolean(consumerKey),
    hasConsumerSecret: Boolean(consumerSecret),
  });
  return data.access_token as string;
}

interface StkPushParams {
  amount: number;
  phoneNumber: string;
  accountReference: string;
  transactionDescription: string;
}

export async function initiateStkPush({
  amount,
  phoneNumber,
  accountReference,
  transactionDescription,
}: StkPushParams) {
  const shortcode = process.env.DARAJA_SHORTCODE;
  const passkey = process.env.DARAJA_PASSKEY;
  const callbackUrl = process.env.DARAJA_CALLBACK_URL;

  if (!shortcode || !passkey || !callbackUrl) {
    throw new Error("Daraja STK Push configuration is incomplete");
  }

  const accessToken = await getMpesaAccessToken();

  /*
   * Daraja expects the timestamp in:
   *
   * YYYYMMDDHHmmss
   *
   * Example:
   * 20260828203542
   */

  const timestamp = new Date()
    .toISOString()
    .replace(/[-:TZ.]/g, "")
    .slice(0, 14);

  /*
   * Password = Base64(
   *   Shortcode + Passkey + Timestamp
   * )
   */

  const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString(
    "base64",
  );

  /*
   * Safaricom expects Kenyan numbers in
   * international format.
   *
   * 0712345678 → 254712345678
   */

  const normalizedPhoneNumber = normalizeKenyanPhoneNumber(phoneNumber);

  const response = await fetch(
    `${DARAJA_BASE_URL}/mpesa/stkpush/v1/processrequest`,
    {
      method: "POST",

      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,

        TransactionType: "CustomerPayBillOnline",

        Amount: Math.round(amount),

        PartyA: normalizedPhoneNumber,

        PartyB: shortcode,

        PhoneNumber: normalizedPhoneNumber,

        CallBackURL: callbackUrl,

        AccountReference: accountReference,

        TransactionDesc: transactionDescription,
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("Daraja STK Push error:", data);

    throw new Error("Failed to initiate M-Pesa payment");
  }

  return data;
}

function normalizeKenyanPhoneNumber(phoneNumber: string) {
  const cleaned = phoneNumber.replace(/\D/g, "");

  if (cleaned.startsWith("254")) {
    return cleaned;
  }

  if (cleaned.startsWith("0")) {
    return `254${cleaned.slice(1)}`;
  }

  if (cleaned.startsWith("7")) {
    return `254${cleaned}`;
  }

  throw new Error("Invalid Kenyan phone number");
}
