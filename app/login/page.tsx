import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-sm bg-white p-8 rounded-lg border border-slate-200">
        <h1 className="text-xl font-semibold text-slate-800 mb-1">Kelola ATM</h1>
        <p className="text-sm text-slate-500 mb-6">Masukkan password untuk masuk.</p>

        <form action={login} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm text-slate-600 mb-1">Password</label>
            <input
              name="password"
              type="password"
              required
              autoFocus
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">Password salah, coba lagi.</p>
          )}

          <button
            type="submit"
            className="bg-slate-900 text-white text-sm px-4 py-2 rounded-md hover:bg-slate-700 mt-2"
          >
            Masuk
          </button>
        </form>
      </div>
    </div>
  );
}
