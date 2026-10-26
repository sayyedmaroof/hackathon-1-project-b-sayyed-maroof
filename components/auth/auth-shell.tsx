import Image from "next/image";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/logo";
import { Reveal } from "@/components/motion/reveal";
import { photos } from "@/lib/photos";

export function AuthShell({ title, body, children }: { title: string; body: string; children: ReactNode }) {
  return (
    <div className="grid min-h-[80vh] lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        <Image src={photos.still.src} alt={photos.still.alt} fill priority sizes="50vw" className="photo-drift object-cover" />
      </div>
      <Reveal className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-6 py-12">
        <Logo />
        <h1 className="mt-8 font-display text-4xl tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-ink-muted">{body}</p>
        <div className="mt-6">{children}</div>
      </Reveal>
    </div>
  );
}
