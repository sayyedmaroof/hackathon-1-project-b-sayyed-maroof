"use client";

import { useState } from "react";
import { EmptyState } from "@/components/layout/empty-state";
import { SampleNote } from "@/components/layout/sample-note";
import { PointsCalculator } from "@/components/wallet/points-calculator";
import { ProgramCard } from "@/components/wallet/program-card";
import { TransferDiagram } from "@/components/wallet/transfer-diagram";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { listPrograms } from "@/lib/api/content";
import type { LoyaltyProgram } from "@/lib/types";

/** Programs on file, or an empty wallet with a way to add one. */
export function WalletBoard() {
  const seed = listPrograms();
  const [programs, setPrograms] = useState<LoyaltyProgram[]>(seed);
  const [hidden, setHidden] = useState(false);
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("10000");

  const visible = hidden ? [] : programs;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SampleNote />
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => setHidden(true)}>
            Preview empty
          </Button>
          <Drawer>
            <DrawerTrigger className="inline-flex min-h-11 items-center rounded-xl bg-accent px-4 text-sm font-medium text-primary-foreground">
              Add a program
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Add a program</DrawerTitle>
              </DrawerHeader>
              <form
                className="space-y-3 px-4 pb-8"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (!name.trim()) return;
                  setPrograms((current) => [
                    {
                      id: name.toLowerCase().replaceAll(" ", "-"),
                      name,
                      kind: "airline",
                      balance: Number(balance) || 0,
                      expiry: "2027-01-01",
                      euroValue: Math.round((Number(balance) || 0) * 0.012),
                      nextTripCost: 25000,
                      unit: "points",
                    },
                    ...current,
                  ]);
                  setHidden(false);
                  setName("");
                }}
              >
                <Input
                  placeholder="Program name"
                  aria-label="Program name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
                <Input
                  inputMode="numeric"
                  aria-label="Balance"
                  value={balance}
                  onChange={(event) => setBalance(event.target.value)}
                />
                <Button type="submit">Save program</Button>
              </form>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
      {visible.length === 0 ? (
        <EmptyState
          title="No points on file."
          body="Add a program you already have. We'll show what it's worth, and how far it is from the next trip."
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {visible.map((program) => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <TransferDiagram />
            <PointsCalculator initial={visible[0]?.balance ?? 38000} />
          </div>
        </>
      )}
    </div>
  );
}
