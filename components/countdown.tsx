"use client";

import { useEffect, useState } from "react";
import { countdownParts, type CountdownParts } from "@/lib/countdown";
import { wedding } from "@/lib/content";

const target = new Date(wedding.dateISO).getTime();

export function Countdown() {
  // Null until mounted, so server and first client render match.
  const [parts, setParts] = useState<CountdownParts | null | "pending">("pending");
  useEffect(() => {
    const tick = () => setParts(countdownParts(target, Date.now()));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  if (parts === null) return <p className="flo-timer-done">Just married 🎉</p>;

  const units: Array<[string, number | null]> = parts === "pending"
    ? [["Days", null], ["Hours", null], ["Minutes", null], ["Seconds", null]]
    : [["Days", parts.days], ["Hours", parts.hours], ["Minutes", parts.minutes], ["Seconds", parts.seconds]];

  return <div className="flo-timer" role="timer" aria-label="Countdown to the wedding">
    {units.map(([label, value]) => <div className="flo-timer-tile" key={label}>
      <strong><span className="flo-timer-digit" key={value ?? "pending"}>{value ?? "—"}</span></strong>
      <span className="flo-caps flo-timer-label">{label}</span>
    </div>)}
  </div>;
}
