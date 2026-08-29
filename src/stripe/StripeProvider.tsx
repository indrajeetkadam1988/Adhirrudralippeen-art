// Native (iOS/Android) implementation - the real Stripe SDK.
// See StripeProvider.web.tsx for the web stand-in (Stripe RN doesn't support web,
// and web isn't a ship target for this app - App Store / Play Store only).
export { StripeProvider, useStripe } from "@stripe/stripe-react-native";
