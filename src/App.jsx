import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MESSAGE_LINES = ["HAPPY", "MOTHER'S", "DAY"];

const FONT = {
  A: ["0110", "1001", "1111", "1001", "1001"],
  D: ["1110", "1001", "1001", "1001", "1110"],
  E: ["1111", "1000", "1110", "1000", "1111"],
  H: ["1001", "1001", "1111", "1001", "1001"],
  M: ["10001", "11011", "10101", "10001", "10001"],
  O: ["0110", "1001", "1001", "1001", "0110"],
  P: ["1110", "1001", "1110", "1000", "1000"],
  R: ["1110", "1001", "1110", "1010", "1001"],
  S: ["0111", "1000", "0110", "0001", "1110"],
  T: ["11111", "00100", "00100", "00100", "00100"],
  Y: ["10001", "01010", "00100", "00100", "00100"],
  "'": ["1", "1", "0", "0", "0"],
};

const FLOWER_VARIANTS = [
  {
    width: 29,
    height: 28,
    lines: [
      { text: "(*)", color: "#f7febc" },
      { text: ">\\", color: "#b2bf5a" },
    ],
  },
  {
    width: 36,
    height: 70,
    lines: [
      { text: "  (o)", color: "#f2511b" },
      { text: "   \\|/", color: "#c8d665" },
    ],
  },
  {
    width: 58,
    height: 56,
    lines: [
      { text: "    .", color: "#e20074" },
      { text: "  \\(| ,-", color: "#b2bf5a" },
      { text: "   \\|/", color: "#b2bf5a" },
    ],
  },
  {
    width: 58,
    height: 70,
    lines: [
      { text: " (@)", color: "#fd6b94" },
      { text: "  \\Y/", color: "#c8d665" },
      { text: "   |", color: "#c8d665" },
      { text: "  \\|/", color: "#c8d665" },
      { text: " ^^^", color: "#c8d665" },
    ],
  },
  {
    width: 36,
    height: 98,
    lines: [
      { text: ", {{}}}", color: "#191918" },
      { text: " ~Y~", color: "#191918" },
      { text: " \\|/", color: "#191918" },
      { text: " \\|/", color: "#191918" },
      { text: " \\|/", color: "#191918" },
      { text: "^^^^^", color: "#b2bf5a" },
    ],
  },
];

const MESSAGE_FLOWER_VARIANTS = [
  {
    width: 34,
    height: 30,
    lines: [
      { text: "(*)", color: "#feebbc" },
      { text: " | ", color: "#b2bf5a" },
    ],
  },
  {
    width: 34,
    height: 30,
    lines: [
      { text: "(o)", color: "#f2511b" },
      { text: " | ", color: "#c8d665" },
    ],
  },
  {
    width: 34,
    height: 30,
    lines: [
      { text: "(@)", color: "#fd6b94" },
      { text: " Y ", color: "#c8d665" },
    ],
  },
  {
    width: 34,
    height: 30,
    lines: [
      { text: " . ", color: "#e20074" },
      { text: "\|/", color: "#b2bf5a" },
    ],
  },
];

const GRASS = ["/\\", "||", "//", "\\", "vv", "''", "..", "^^^^^", "^^^"];
const GRASS_SPROUT = [
  { text: " . ", color: "#b2bf5a" },
  { text: "\|/", color: "#c8d665" },
];

const GROW_SEQUENCE = [
  { text: "   v", color: "#add6f7" },
  { text: "   Y", color: "#c8d665" },
  { text: " ^^^^^", color: "#c8d665" },
];

function mulberry32(seed) {
  return function random() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeGardenBits(count, seed = 24) {
  const random = mulberry32(seed);
  return Array.from({ length: count }, (_, i) => ({
    id: `grass-${i}`,
    x: random() * 100,
    y: 8 + random() * 90,
    size: 9 + random() * 8,
    char: GRASS[Math.floor(random() * GRASS.length)],
    rotation: random() * 10 - 5,
    opacity: 0.06 + random() * 0.08,
  }));
}

function makeMessageFlowers() {
  const points = [];
  const random = mulberry32(88);

  const rowHeight = 16;
  const cellX = 1.5;
  const cellY = 2.3;
  const top = 24;
  const letterGap = 1.5;

  MESSAGE_LINES.forEach((line, lineIndex) => {
    const letterWidths = line.split("").map((char) => (char === " " ? 3 : FONT[char]?.[0]?.length ?? 5));
    const totalCols = letterWidths.reduce((sum, width) => sum + width, 0) + (line.length - 1) * letterGap;
    let cursor = (100 - totalCols * cellX) / 2;

    line.split("").forEach((char) => {
      const pattern = FONT[char];
      if (!pattern) {
        cursor += 4 * cellX;
        return;
      }

      pattern.forEach((row, y) => {
        row.split("").forEach((bit, x) => {
          if (bit !== "1") return;

          points.push({
            id: `flower-${lineIndex}-${char}-${x}-${y}-${points.length}`,
            x: cursor + x * cellX,
            y: top + lineIndex * rowHeight + y * cellY,
            variant: MESSAGE_FLOWER_VARIANTS[Math.floor(random() * MESSAGE_FLOWER_VARIANTS.length)],
            delay: random() * 0.15,
          });
        });
      });
      cursor += (pattern[0].length + letterGap) * cellX;
    });
  });

  return points;
}

function WateringCan({ position }) {
  return (
    <pre
      className="pointer-events-none fixed z-50 select-none font-mono text-lg leading-none text-emerald-950 drop-shadow-sm sm:text-xl"
      style={{ left: position.x + 14, top: position.y + 10 }}
      aria-hidden="true"
    >
{`   __
  /  \\__
 | )> 
  \\__/`}
    </pre>
  );
}

function WaterDrop({ burst }) {
  const drops = [
    { text: "   v", color: "#add6f7", x: 0, delay: 0 },
    { text: "   v", color: "#add6f7", x: -18, delay: 0.08 },
    { text: "   v", color: "#add6f7", x: 18, delay: 0.14 },
    { text: "   Y", color: "#add6f7", x: -8, delay: 0.22 },
    { text: " ^^^^^", color: "#add6f7", x: -16, delay: 0.34 },
  ];

  return (
    <div className="pointer-events-none fixed z-40 select-none" style={{ left: burst.x, top: burst.y }}>
      {drops.map((drop, i) => (
        <motion.pre
          key={`${burst.id}-${i}`}
          className="absolute font-mono text-xs font-bold leading-[18px]"
          style={{ color: drop.color, fontFamily: "'Kode Mono', monospace" }}
          initial={{ x: drop.x, y: 0, opacity: 0, scale: 0.9 }}
          animate={{ x: drop.x, y: 95 + i * 16, opacity: [0, 1, 1, 0], scale: [0.85, 1, 1, 0.95] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.05, ease: "easeOut", delay: drop.delay }}
        >
          {drop.text}
        </motion.pre>
      ))}
    </div>
  );
}

function AsciiPlant({ lines, faded = false }) {
  return (
    <pre className="m-0 font-mono text-[24px] font-bold leading-[15px]" style={{ fontFamily: "'Kode Mono', monospace" }}>
      {lines.map((line, index) => (
        <div key={`${line.text}-${index}`} style={{ color: faded ? "rgba(178,191,90,0.2)" : line.color }}>
          {line.text}
        </div>
      ))}
    </pre>
  );
}

function MessageFlower({ flower, grown }) {
  const sprout = GRASS_SPROUT;

  return (
    <motion.div
      className="absolute select-none whitespace-pre text-center leading-none"
      style={{
        left: `${flower.x}%`,
        top: `${flower.y}%`,
        width: flower.variant.width,
        height: flower.variant.height,
        transform: "translate(-50%, -50%)",
      }}
      initial={false}
      animate={{
        opacity: 1,
        scale: grown ? 0.78 : 0.5,
        y: 0,
      }}
      transition={{ type: "spring", stiffness: 210, damping: 16, delay: flower.delay }}
    >
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ opacity: grown ? [1, 1, 0] : 1, scale: grown ? [1, 1.05, 0.7] : 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <AsciiPlant lines={sprout} faded={false} />
      </motion.div>

      {grown && (
        <>
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, y: -12, scale: 0.8 }}
            animate={{ opacity: [0, 1, 0], y: [10, 0, -4], scale: [0.8, 1, 0.9] }}
            transition={{ duration: 0.32, ease: "easeOut", delay: flower.delay }}
          >
            <AsciiPlant lines={[GROW_SEQUENCE[0]]} faded={false} />
          </motion.div>

          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, y: 10, scale: 0.75 }}
            animate={{ opacity: [0, 1, 0], y: [8, 0, -2], scale: [0.75, 1, 0.95] }}
            transition={{ duration: 0.36, ease: "easeOut", delay: flower.delay + 0.18 }}
          >
            <AsciiPlant lines={[GROW_SEQUENCE[1], GROW_SEQUENCE[2]]} faded={false} />
          </motion.div>

          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, y: 12, scale: 0.42 }}
            animate={{ opacity: 1, y: [8, -1, 0], scale: [0.42, 0.84, 0.78] }}
            transition={{ duration: 0.5, ease: "easeOut", delay: flower.delay + 0.42 }}
          >
            <motion.div
              animate={{ y: [0, -1, 0] }}
              transition={{ duration: 1.7, repeat: Infinity, ease: "easeInOut", delay: flower.delay + 0.9 }}
            >
              <AsciiPlant lines={flower.variant.lines} faded={false} />
            </motion.div>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}

export default function AsciiMothersDayGarden() {
  const [cursor, setCursor] = useState({ x: -100, y: -100 });
  const [grownFlowers, setGrownFlowers] = useState(() => new Set());
  const [bursts, setBursts] = useState([]);
  const flowers = useMemo(makeMessageFlowers, []);
  const gardenBits = useMemo(() => makeGardenBits(35), []);
  const burstId = useRef(0);

  useEffect(() => {
    const onMove = (event) => setCursor({ x: event.clientX, y: event.clientY });
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useEffect(() => {
    const cleanup = setInterval(() => {
      setBursts((current) => current.filter((burst) => Date.now() - burst.createdAt < 1400));
    }, 350);
    return () => clearInterval(cleanup);
  }, []);

  const waterGarden = (event) => {
    const clickX = (event.clientX / window.innerWidth) * 100;
    const clickY = (event.clientY / window.innerHeight) * 100;
    const streamRadius = 5.2;

    const nextBurst = {
      id: burstId.current++,
      x: event.clientX,
      y: event.clientY,
      createdAt: Date.now(),
    };

    setBursts((current) => [...current, nextBurst]);
    setGrownFlowers((current) => {
      const next = new Set(current);
      flowers.forEach((flower) => {
        const isUnderWater = flower.y >= clickY - 1;
        const isInStream = Math.abs(flower.x - clickX) <= streamRadius;
        if (isUnderWater && isInStream) next.add(flower.id);
      });
      return next;
    });
  };

  const resetGarden = (event) => {
    event.stopPropagation();
    setGrownFlowers(new Set());
    setBursts([]);
  };

  return (
    <main
      className="relative min-h-screen cursor-none overflow-hidden bg-[#f9f8f6] text-[#191918]"
      onClick={waterGarden}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.8),transparent_34%),radial-gradient(circle_at_22%_74%,rgba(244,114,182,0.11),transparent_33%),radial-gradient(circle_at_82%_70%,rgba(14,165,233,0.1),transparent_28%)]" />

      <section className="pointer-events-none relative z-30 flex items-start justify-between gap-4 p-5 sm:p-8">
        {/* <button
          onClick={resetGarden}
          className="pointer-events-auto rounded-sm border border-black/10 bg-white/60 px-4 py-3 font-mono text-sm shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/80"
        >
          reset
        </button> */}
      </section>

      <div className="absolute inset-0 z-10">
        {gardenBits.map((bit) => (
          <motion.div
            key={bit.id}
            className="absolute select-none whitespace-pre font-mono leading-none text-emerald-900"
            style={{ left: `${bit.x}%`, top: `${bit.y}%`, fontSize: bit.size, rotate: `${bit.rotation}deg`, opacity: bit.opacity }}
            initial={{ y: 8, scale: 0.75 }}
            animate={{ y: [0, -1, 0], scale: 1 }}
            transition={{ duration: 3 + (bit.id.length % 4), repeat: Infinity, ease: "easeInOut" }}
          >
            {bit.char}
          </motion.div>
        ))}
      </div>

      <div className="absolute inset-0 z-20">
        {flowers.map((flower) => (
          <MessageFlower key={flower.id} flower={flower} grown={grownFlowers.has(flower.id)} />
        ))}
      </div>

      <AnimatePresence>{bursts.map((burst) => <WaterDrop key={burst.id} burst={burst} />)}</AnimatePresence>
      <WateringCan position={cursor} />
    </main>
  );
}
