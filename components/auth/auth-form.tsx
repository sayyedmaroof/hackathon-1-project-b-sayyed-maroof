"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Logo } from "@/components/brand/logo";
import { PriceCompare } from "@/components/fare/price-compare";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listShowcaseTrips } from "@/lib/api/content";

type AuthFormProps = {
  mode: "login" | "signup";
};

/** Visual auth only. A successful form does not create an account. */
export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const sample = listShowcaseTrips()[0]!;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string }>({});

  const submit = () => {
    const next: typeof errors = {};
    if (mode === "signup" && name.trim().length < 2) next.name = "Tell us what to call you.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "That email doesn't look complete.";
    if (password.length < 8) next.password = "Use at least 8 characters.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    toast("This preview doesn't sign you in yet.");
    router.push("/plan");
  };

  return (
    <div className="grid min-h-full flex-1 lg:grid-cols-2">
      <section className="flex flex-col justify-between border-b border-line bg-surface px-6 py-8 lg:border-r lg:border-b-0 lg:px-12 lg:py-10">
        <Logo />
        <div className="py-12">
          <p className="font-display text-4xl leading-[0.95] tracking-[-0.04em] md:text-6xl">
            Same trip. <span className="italic">Far less</span> to pay.
          </p>
          <div className="mt-8 max-w-md">
            <PriceCompare
              normal={sample.normalPrice}
              hacked={sample.hackedPrice}
              percent={sample.savingPct}
            />
          </div>
        </div>
        <p className="text-sm text-ink-muted">A sample Madrid to Lisbon fare. Not a live quote.</p>
      </section>
      <section className="flex items-center px-6 py-10 lg:px-16">
        <form
          className="w-full max-w-sm"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <h1 className="font-display text-4xl tracking-tight">
            {mode === "login" ? "Welcome back." : "Create your Fareflip."}
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            {mode === "login" ? "Pick up a saved trip." : "Keep the fares you flip."}
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Button type="button" variant="outline" onClick={() => toast("Google sign-in isn't connected.")}>
              Continue with Google
            </Button>
            <Button type="button" variant="outline" onClick={() => toast("Apple sign-in isn't connected.")}>
              Continue with Apple
            </Button>
          </div>
          <div className="my-6 h-px bg-line" />
          {mode === "signup" ? (
            <label className="mb-3 block text-sm">
              Name
              <Input className="mt-1" value={name} onChange={(event) => setName(event.target.value)} aria-invalid={Boolean(errors.name)} />
              {errors.name ? <span className="mt-1 block text-xs text-risk">{errors.name}</span> : null}
            </label>
          ) : null}
          <label className="mb-3 block text-sm">
            Email
            <Input
              className="mt-1"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={Boolean(errors.email)}
            />
            {errors.email ? <span className="mt-1 block text-xs text-risk">{errors.email}</span> : null}
          </label>
          <label className="mb-4 block text-sm">
            Password
            <Input
              className="mt-1"
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-invalid={Boolean(errors.password)}
            />
            {errors.password ? <span className="mt-1 block text-xs text-risk">{errors.password}</span> : null}
          </label>
          <Button type="submit" className="w-full">
            {mode === "login" ? "Log in" : "Create account"}
          </Button>
          <p className="mt-4 text-sm text-ink-muted">
            {mode === "login" ? (
              <>
                New here? <Link href="/signup" className="text-ink underline">Create an account</Link>
              </>
            ) : (
              <>
                Already flipping? <Link href="/login" className="text-ink underline">Log in</Link>
              </>
            )}
          </p>
        </form>
      </section>
    </div>
  );
}
