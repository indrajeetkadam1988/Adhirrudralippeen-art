import React, { useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "@/context/AuthContext";
import { uploadReferenceImage } from "@/firebase/storage";
import { submitCustomRequest } from "@/firebase/customRequests";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { colors, radius, spacing } from "@/theme/colors";

const MOTIFS = ["Peacock", "Tree of Life", "Elephant", "Floral", "Camel Caravan", "Geometric", "Other"];

export default function CustomOrderScreen() {
  const { user, profile } = useAuth();
  const [motif, setMotif] = useState(MOTIFS[0]);
  const [size, setSize] = useState("");
  const [colorPreference, setColorPreference] = useState("");
  const [budget, setBudget] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError("Photo library access is needed to attach a reference image.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
      allowsMultipleSelection: true,
      selectionLimit: 4,
    });
    if (!result.canceled) {
      setImages((prev) => [...prev, ...result.assets.map((a) => a.uri)].slice(0, 4));
    }
  };

  const handleSubmit = async () => {
    if (!user || !profile) return;
    if (!description || !size) {
      setError("Please describe the piece and specify a size.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const uploadedUrls = await Promise.all(
        images.map((uri) => uploadReferenceImage(user.uid, uri))
      );
      await submitCustomRequest({
        userId: user.uid,
        userName: profile.name,
        userEmail: profile.email,
        motif,
        size,
        colorPreference,
        budget: budget ? Number(budget) : undefined,
        description,
        referenceImages: uploadedUrls,
      });
      setSubmitted(true);
      setSize("");
      setColorPreference("");
      setBudget("");
      setDescription("");
      setImages([]);
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err: any) {
      setError(err?.message ?? "Couldn't submit your request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg }}>
      <Text style={styles.title}>Request a Custom Piece</Text>
      <Text style={styles.subtitle}>
        Tell us what you have in mind and the artist will send you a quote.
      </Text>

      <Text style={styles.sectionLabel}>Motif</Text>
      <View style={styles.optionRow}>
        {MOTIFS.map((m) => (
          <Text
            key={m}
            onPress={() => setMotif(m)}
            style={[styles.chip, m === motif && styles.chipSelected]}
          >
            {m}
          </Text>
        ))}
      </View>

      <Input
        label="Desired size (e.g. 16x16 in)"
        value={size}
        onChangeText={setSize}
        placeholder="16x16 in"
      />
      <Input
        label="Color preference"
        value={colorPreference}
        onChangeText={setColorPreference}
        placeholder="Terracotta with white mirrors"
      />
      <Input
        label="Budget (optional)"
        value={budget}
        onChangeText={setBudget}
        keyboardType="number-pad"
        placeholder="e.g. 3000"
      />
      <Input
        label="Describe what you'd like"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        style={{ minHeight: 90, textAlignVertical: "top" }}
        placeholder="Wall hanging for a living room, peacock centerpiece, warm tones..."
      />

      <Text style={styles.sectionLabel}>Reference images (optional)</Text>
      <View style={styles.imageRow}>
        {images.map((uri) => (
          <Image key={uri} source={{ uri }} style={styles.previewImage} />
        ))}
        {images.length < 4 && (
          <Text style={styles.addImage} onPress={pickImage}>
            + Add
          </Text>
        )}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {submitted ? <Text style={styles.success}>Request submitted! Check the Orders tab for updates.</Text> : null}

      <Button
        title="Submit Request"
        onPress={handleSubmit}
        loading={submitting}
        style={{ marginTop: spacing.lg }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    fontSize: 13,
    color: colors.text,
    overflow: "hidden",
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}18`,
    color: colors.primary,
    fontWeight: "700",
  },
  imageRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  previewImage: {
    width: 72,
    height: 72,
    borderRadius: radius.sm,
    backgroundColor: colors.border,
  },
  addImage: {
    width: 72,
    height: 72,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
    textAlign: "center",
    textAlignVertical: "center",
    color: colors.textMuted,
    fontSize: 12,
    overflow: "hidden",
  },
  error: {
    color: colors.danger,
    fontSize: 13,
    marginBottom: spacing.md,
  },
  success: {
    color: colors.success,
    fontSize: 13,
    marginBottom: spacing.md,
  },
});
