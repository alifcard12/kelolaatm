"use client";

import { Card, CardTitle } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ActionForm } from "@/components/ui/ActionForm";
import { loginAbsensiAction } from "./actions";

export default function AbsenLoginForm() {
  return (
    <Card className="max-w-sm">
      <CardTitle className="mb-4">Login Absensi</CardTitle>
      <ActionForm
        action={loginAbsensiAction}
        successMessage="Berhasil login ke sistem absensi"
        className="flex flex-col gap-4"
      >
        <Field label="Username" htmlFor="username">
          <Input id="username" name="username" type="text" autoComplete="username" required />
        </Field>
        <Field label="Password" htmlFor="password">
          <Input id="password" name="password" type="password" autoComplete="current-password" required />
        </Field>
        <Button type="submit" className="self-start">
          Login
        </Button>
      </ActionForm>
    </Card>
  );
}
