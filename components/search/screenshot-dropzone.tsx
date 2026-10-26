"use client";

import { useState } from "react";
import { cn } from "cn";

type ScreenshotDropzoneProps = {
  onDetected: () => void;
};

/** Drag a screenshot in. The scan is a preview animation, then a sample trip fills in. */
export function ScreenshotDropzone({ onDetected }: ScreenshotDropzoneProps) {
  const [scanning, setScanning] = useState(false);
  const [name, setName] = useState<string | null>(null);

  const start = (fileName: string) => {
    setName(fileName);
    setScanning(true);
    window.setTimeout(() => {
      setScanning(false);
      onDetected();
    }, 1400);
  };

  return (
    <label
      className={cn(
        "flex min-h-36 cursor-pointer flex-col justify-center rounded-[20px] border border-dashed border-line bg-paper px-4 py-5",
        scanning && "border-accent",
      )}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        if (file) start(file.name);
      }}
    >
      <input
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) start(file.name);
        }}
      />
      <span className="text-sm font-medium">Upload a screenshot</span>
      <span className="mt-1 text-xs text-ink-muted">
        {scanning ? `Reading ${name}…` : "Drop a booking screen. We'll sketch the route from it."}
      </span>
      {scanning ? (
        <span className="mt-4 h-1 overflow-hidden rounded-full bg-line" aria-hidden="true">
          <span className="block h-full w-1/2 animate-pulse bg-accent" />
        </span>
      ) : null}
    </label>
  );
}
