// Web stand-in: @stripe/stripe-react-native has no web support (it imports
// native RN internals). This app only ships to the App Store / Play Store, so
// web is dev-preview only - checkout simply isn't available there.
import React from "react";

export function StripeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function useStripe() {
  const unavailable = async () => ({
    error: { code: "Failed", message: "Checkout isn't available in the web preview. Use the iOS or Android app." },
  });
  return {
    initPaymentSheet: unavailable,
    presentPaymentSheet: unavailable,
  };
}
