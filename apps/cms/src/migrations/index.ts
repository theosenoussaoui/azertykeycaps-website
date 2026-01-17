import * as migration_20260117_002415 from "./20260117_002415";

export const migrations = [
  {
    up: migration_20260117_002415.up,
    down: migration_20260117_002415.down,
    name: "20260117_002415",
  },
];
