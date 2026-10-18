import { hashSeed } from "@/lib/hash";

const SIZE = 21;

const inFinder = (x: number, y: number) => (x < 7 && y < 7) || (x > SIZE - 8 && y < 7) || (x < 7 && y > SIZE - 8);

function finderCell(x: number, y: number) {
  const fx = x < 7 ? x : x - (SIZE - 7);
  const fy = y < 7 ? y : y - (SIZE - 7);
  const ring = Math.max(Math.abs(fx - 3), Math.abs(fy - 3));
  return ring !== 2;
}

export function QrMark({ seed }: { seed: string }) {
  let state = hashSeed(seed) || 1;
  const next = () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };

  const cells: React.ReactNode[] = [];
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const filled = inFinder(x, y) ? finderCell(x, y) : next() > 0.52;
      if (filled) cells.push(<rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} />);
    }
  }

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="size-full fill-primary-ink" shapeRendering="crispEdges" role="img" aria-label="Authenticity code">
      {cells}
    </svg>
  );
}
