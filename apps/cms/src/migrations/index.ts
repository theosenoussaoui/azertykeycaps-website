import * as migration_20260112_211705 from './20260112_211705';

export const migrations = [
  {
    up: migration_20260112_211705.up,
    down: migration_20260112_211705.down,
    name: '20260112_211705'
  },
];
