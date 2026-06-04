import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6">
      <div className="max-w-lg rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center shadow-2xl">
        <h1 className="text-3xl font-bold text-white">Unauthorized Access</h1>

        <p className="mt-4 text-sm leading-6 text-slate-300">
          You do not have permission to access this page. Please log in with the
          correct account role or return to your dashboard.
        </p>

        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/login"
            className="rounded-xl bg-brand-primary px-5 py-3 text-sm font-semibold text-white hover:bg-violet-600"
          >
            Go to Login
          </Link>

          <Link
            href="/"
            className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-200 hover:bg-white/10"
          >
            Back Home
          </Link>
        </div>
      </div>
    </div>
  );
}