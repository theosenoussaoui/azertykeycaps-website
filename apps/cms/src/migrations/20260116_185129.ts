import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-sqlite";

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`media\` ADD \`sizes_hero_url\` text;`);
  await db.run(sql`ALTER TABLE \`media\` ADD \`sizes_hero_width\` numeric;`);
  await db.run(sql`ALTER TABLE \`media\` ADD \`sizes_hero_height\` numeric;`);
  await db.run(sql`ALTER TABLE \`media\` ADD \`sizes_hero_mime_type\` text;`);
  await db.run(sql`ALTER TABLE \`media\` ADD \`sizes_hero_filesize\` numeric;`);
  await db.run(sql`ALTER TABLE \`media\` ADD \`sizes_hero_filename\` text;`);
  await db.run(
    sql`CREATE INDEX \`media_sizes_hero_sizes_hero_filename_idx\` ON \`media\` (\`sizes_hero_filename\`);`,
  );
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP INDEX \`media_sizes_hero_sizes_hero_filename_idx\`;`);
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`sizes_hero_url\`;`);
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`sizes_hero_width\`;`);
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`sizes_hero_height\`;`);
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`sizes_hero_mime_type\`;`);
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`sizes_hero_filesize\`;`);
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`sizes_hero_filename\`;`);
}
