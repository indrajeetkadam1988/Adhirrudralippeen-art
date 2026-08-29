import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { useAuth } from "@/context/AuthContext";
import { signOut } from "@/firebase/auth";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { colors, spacing } from "@/theme/colors";
import type { Address } from "@/types";

export default function ProfileScreen() {
  const { user, profile } = useAuth();
  const [address, setAddress] = useState<Address>(
    profile?.address ?? { line1: "", city: "", state: "", postalCode: "", country: "India" }
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const updateField = (key: keyof Address, value: string) =>
    setAddress((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await setDoc(doc(db, "users", user.uid), { address }, { merge: true });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  if (!profile) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg }}>
      <View style={styles.header}>
        <Text style={styles.name}>{profile.name}</Text>
        <Text style={styles.email}>{profile.email}</Text>
      </View>

      <Text style={styles.sectionLabel}>Default shipping address</Text>
      <Input label="Address line 1" value={address.line1} onChangeText={(v) => updateField("line1", v)} />
      <Input
        label="Address line 2 (optional)"
        value={address.line2}
        onChangeText={(v) => updateField("line2", v)}
      />
      <Input label="City" value={address.city} onChangeText={(v) => updateField("city", v)} />
      <Input label="State" value={address.state} onChangeText={(v) => updateField("state", v)} />
      <Input
        label="Postal code"
        value={address.postalCode}
        onChangeText={(v) => updateField("postalCode", v)}
        keyboardType="number-pad"
      />
      <Input label="Country" value={address.country} onChangeText={(v) => updateField("country", v)} />

      {saved ? <Text style={styles.saved}>Saved.</Text> : null}
      <Button title="Save Address" onPress={handleSave} loading={saving} variant="secondary" />

      <Button
        title="Log Out"
        onPress={() => signOut()}
        variant="danger"
        style={{ marginTop: spacing.xl }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    marginBottom: spacing.lg,
  },
  name: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
  },
  email: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  saved: {
    color: colors.success,
    fontSize: 12,
    marginBottom: spacing.sm,
  },
});
