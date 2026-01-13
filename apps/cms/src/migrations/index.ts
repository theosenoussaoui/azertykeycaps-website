import * as migration_20260112_211705 from "./20260112_211705";
import * as migration_20260113_004942 from "./20260113_004942";

export const migrations = [
  {
    up: migration_20260112_211705.up,
    down: migration_20260112_211705.down,
    name: "20260112_211705",
  },
  {
    up: migration_20260113_004942.up,
    down: migration_20260113_004942.down,
    name: "20260113_004942",
  },
];
