import React from "react";
import { Input } from "@/components/Input";
import type { Address } from "@/types";

export function AddressForm({
  address,
  onChange,
}: {
  address: Address;
  onChange: (key: keyof Address, value: string) => void;
}) {
  return (
    <>
      <Input label="Address line 1" value={address.line1} onChangeText={(v) => onChange("line1", v)} />
      <Input
        label="Address line 2 (optional)"
        value={address.line2}
        onChangeText={(v) => onChange("line2", v)}
      />
      <Input label="City" value={address.city} onChangeText={(v) => onChange("city", v)} />
      <Input label="State" value={address.state} onChangeText={(v) => onChange("state", v)} />
      <Input
        label="Postal code"
        value={address.postalCode}
        onChangeText={(v) => onChange("postalCode", v)}
        keyboardType="number-pad"
      />
      <Input label="Country" value={address.country} onChangeText={(v) => onChange("country", v)} />
    </>
  );
}

export function isAddressComplete(address: Address) {
  return Boolean(address.line1 && address.city && address.state && address.postalCode && address.country);
}
