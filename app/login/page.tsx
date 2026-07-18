import { login } from "./actions";
import { BrandMark } from "@/components/brand-mark";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center mb-6">
          <BrandMark className="h-14 w-14 mb-4" />
          <h1 className="font-display text-2xl font-semibold text-espresso">Kelola ATM</h1>
          <p className="text-sm text-espresso-soft mt-1">Masukkan password untuk masuk.</p>
        </div>

        <div className="bg-paper p-6 md:p-7 rounded-2xl border border-taupe/70 shadow-[var(--shadow-card)]">
          <form action={login} className="flex flex-col gap-4">
            <Field label="Password" htmlFor="password">
              <Input id="password" name="password" type="password" required autoFocus />
            </Field>

            {error && <Alert variant="danger" title="Password salah, coba lagi." />}

            <Button type="submit" className="mt-1 w-full">
              Masuk
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
