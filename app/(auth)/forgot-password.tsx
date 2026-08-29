import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { resetPassword } from "@/firebase/auth";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { colors, spacing } from "@/theme/colors";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email) return;
    setLoading(true);
    try {
      await resetPassword(email);
      setStatus("sent");
    } catch {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>
        Enter the email on your account and we&apos;ll send a link to reset your password.
      </Text>
      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="you@example.com"
      />
      {status === "sent" ? (
        <Text style={styles.success}>Check your inbox for a reset link.</Text>
      ) : null}
      {status === "error" ? (
        <Text style={styles.error}>Couldn&apos;t send that email. Check the address and try again.</Text>
      ) : null}
      <Button title="Send Reset Link" onPress={handleReset} loading={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: spacing.lg,
  },
  success: {
    color: colors.success,
    fontSize: 13,
    marginBottom: spacing.md,
  },
  error: {
    color: colors.danger,
    fontSize: 13,
    marginBottom: spacing.md,
  },
});
