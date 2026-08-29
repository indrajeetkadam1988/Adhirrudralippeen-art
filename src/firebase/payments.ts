import { httpsCallable } from "firebase/functions";
import { functions } from "./config";

interface CreatePaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

export async function createPaymentIntent(amount: number, currency: string) {
  const callable = httpsCallable<
    { amount: number; currency: string },
    CreatePaymentIntentResponse
  >(functions, "createPaymentIntent");
  const result = await callable({ amount, currency });
  return result.data;
}
