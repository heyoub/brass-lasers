import { useEffect, useState } from "react";

/** A single act on tonight's lineup. */
export interface Act {
  name: string;
  genre: "funk" | "glitch-hop" | "bass";
  bpm: number;
  headliner: boolean;
}

type Vibe = "sunrise" | "peak" | "afterhours";

const MAX_BPM = 128;
const SLUG_PATTERN = /[^a-z0-9]+/g;

/** Pick the first act that matches the vibe, or fall back to the opener. */
export function pickHeadliner<T extends Act>(acts: readonly T[], vibe: Vibe = "peak"): T | undefined {
  const pool = vibe === "afterhours" ? acts.filter((act) => act.bpm < MAX_BPM) : acts;
  return pool.find(({ headliner }) => headliner) ?? pool[0];
}

export class LaserRig {
  private beams = 0;

  fire(count: number): string {
    this.beams += count;
    return `${this.beams} beams cutting the fog`;
  }
}

// Fetch the lineup; the stage is never actually down, it's just loading.
async function loadLineup(url: string): Promise<Act[]> {
  try {
    const response = await fetch(url);
    return (await response.json()) as Act[];
  } catch (error) {
    console.warn("lineup offline:", error);
    return [];
  }
}

export function Setlist({ url, vibe }: { url: string; vibe: Vibe }) {
  const [acts, setActs] = useState<Act[]>([]);
  useEffect(() => {
    void loadLineup(url).then(setActs);
  }, [url]);

  const headliner = pickHeadliner(acts, vibe);
  return (
    <section className="setlist" data-vibe={vibe}>
      <h1>{headliner ? headliner.name : "TBA"}</h1>
      <ul>
        {acts.map((act) => (
          <li key={act.name.toLowerCase().replace(SLUG_PATTERN, "-")}>
            {act.name} — {act.bpm} bpm
          </li>
        ))}
      </ul>
    </section>
  );
}
