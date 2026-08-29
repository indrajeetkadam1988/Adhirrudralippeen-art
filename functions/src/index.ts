import { onCall, HttpsError } from "firebase-functions/v2/https";
import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import * as logger from "firebase-functions/logger";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import Stripe from "stripe";

initializeApp();
const db = getFirestore();

const stripeSecretKey = defineSecret("STRIPE_SECRET_KEY");
const stripeWebhookSecret = defineSecret("STRIPE_WEBHOOK_SECRET");

function getStripe(key: string) {
  return new Stripe(key, { apiVersion: "2025-02-24.acacia" });
}

/**
 * Creates a Stripe PaymentIntent for the signed-in user's cart total.
 * The client never sees the secret key - only the returned client secret.
 */
export const createPaymentIntent = onCall(
  { secrets: [stripeSecretKey] },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "You must be signed in to check out.");
    }

    const amount = Number(request.data?.amount);
    const currency = String(request.data?.currency ?? "inr").toLowerCase();

    if (!amount || amount <= 0) {
      throw new HttpsError("invalid-argument", "Order amount must be greater than zero.");
    }

    const stripe = getStripe(stripeSecretKey.value());

    // Stripe expects the amount in the smallest currency unit (e.g. paise for INR).
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      metadata: {
        userId: request.auth.uid,
      },
      automatic_payment_methods: { enabled: true },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  }
);

/**
 * Stripe webhook - keeps order payment status in sync with what actually
 * happened at the payment processor (refunds, disputes, late failures).
 */
export const stripeWebhook = onRequest(
  { secrets: [stripeSecretKey, stripeWebhookSecret] },
  async (req, res) => {
    const signature = req.headers["stripe-signature"];
    const stripe = getStripe(stripeSecretKey.value());

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        signature as string,
        stripeWebhookSecret.value()
      );
    } catch (err) {
      logger.error("Stripe webhook signature verification failed", err);
      res.status(400).send("Invalid signature");
      return;
    }

    try {
      switch (event.type) {
        case "charge.refunded": {
          const charge = event.data.object as Stripe.Charge;
          const paymentIntentId = charge.payment_intent as string;
          await markOrdersByPaymentIntent(paymentIntentId, { paymentStatus: "refunded" });
          break;
        }
        case "payment_intent.payment_failed": {
          const intent = event.data.object as Stripe.PaymentIntent;
          logger.warn("Payment failed", { id: intent.id, userId: intent.metadata?.userId });
          break;
        }
        default:
          break;
      }
      res.status(200).send({ received: true });
    } catch (err) {
      logger.error("Error handling Stripe webhook event", err);
      res.status(500).send("Webhook handler error");
    }
  }
);

async function markOrdersByPaymentIntent(
  paymentIntentId: string,
  changes: Record<string, unknown>
) {
  const snap = await db
    .collection("orders")
    .where("paymentIntentId", "==", paymentIntentId)
    .get();
  await Promise.all(snap.docs.map((d) => d.ref.update({ ...changes, updatedAt: Date.now() })));
}
