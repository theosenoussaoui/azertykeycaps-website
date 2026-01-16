import * as migration_20260112_211705 from "./20260112_211705";
import * as migration_20260113_004942 from "./20260113_004942";
import * as migration_20260114_221910 from "./20260114_221910";
import * as migration_20260116_185129 from "./20260116_185129";
import * as migration_20260116_194537 from "./20260116_194537";

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
  {
    up: migration_20260114_221910.up,
    down: migration_20260114_221910.down,
    name: "20260114_221910",
  },
  {
    up: migration_20260116_185129.up,
    down: migration_20260116_185129.down,
    name: "20260116_185129",
  },
  {
    up: migration_20260116_194537.up,
    down: migration_20260116_194537.down,
    name: "20260116_194537",
  },
];
