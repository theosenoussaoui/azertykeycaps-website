import * as migration_20260117_002415 from "./20260117_002415";
import * as migration_20260119_123344 from "./20260119_123344";
import * as migration_20260119_134253 from "./20260119_134253";
import * as migration_20260125_135939 from "./20260125_135939";
import * as migration_20260127_183516 from "./20260127_183516";
import * as migration_20260127_195654 from "./20260127_195654";

export const migrations = [
  {
    up: migration_20260117_002415.up,
    down: migration_20260117_002415.down,
    name: "20260117_002415",
  },
  {
    up: migration_20260119_123344.up,
    down: migration_20260119_123344.down,
    name: "20260119_123344",
  },
  {
    up: migration_20260119_134253.up,
    down: migration_20260119_134253.down,
    name: "20260119_134253",
  },
  {
    up: migration_20260125_135939.up,
    down: migration_20260125_135939.down,
    name: "20260125_135939",
  },
  {
    up: migration_20260127_183516.up,
    down: migration_20260127_183516.down,
    name: "20260127_183516",
  },
  {
    up: migration_20260127_195654.up,
    down: migration_20260127_195654.down,
    name: "20260127_195654",
  },
];
