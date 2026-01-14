import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-sqlite";

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`media\` ADD \`sizes_thumbnail_url\` text;`);
  await db.run(sql`ALTER TABLE \`media\` ADD \`sizes_thumbnail_width\` numeric;`);
  await db.run(sql`ALTER TABLE \`media\` ADD \`sizes_thumbnail_height\` numeric;`);
  await db.run(sql`ALTER TABLE \`media\` ADD \`sizes_thumbnail_mime_type\` text;`);
  await db.run(sql`ALTER TABLE \`media\` ADD \`sizes_thumbnail_filesize\` numeric;`);
  await db.run(sql`ALTER TABLE \`media\` ADD \`sizes_thumbnail_filename\` text;`);
  await db.run(sql`ALTER TABLE \`media\` ADD \`sizes_card_url\` text;`);
  await db.run(sql`ALTER TABLE \`media\` ADD \`sizes_card_width\` numeric;`);
  await db.run(sql`ALTER TABLE \`media\` ADD \`sizes_card_height\` numeric;`);
  await db.run(sql`ALTER TABLE \`media\` ADD \`sizes_card_mime_type\` text;`);
  await db.run(sql`ALTER TABLE \`media\` ADD \`sizes_card_filesize\` numeric;`);
  await db.run(sql`ALTER TABLE \`media\` ADD \`sizes_card_filename\` text;`);
  await db.run(
    sql`CREATE INDEX \`media_sizes_thumbnail_sizes_thumbnail_filename_idx\` ON \`media\` (\`sizes_thumbnail_filename\`);`,
  );
  await db.run(
    sql`CREATE INDEX \`media_sizes_card_sizes_card_filename_idx\` ON \`media\` (\`sizes_card_filename\`);`,
  );
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP INDEX \`media_sizes_thumbnail_sizes_thumbnail_filename_idx\`;`);
  await db.run(sql`DROP INDEX \`media_sizes_card_sizes_card_filename_idx\`;`);
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`sizes_thumbnail_url\`;`);
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`sizes_thumbnail_width\`;`);
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`sizes_thumbnail_height\`;`);
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`sizes_thumbnail_mime_type\`;`);
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`sizes_thumbnail_filesize\`;`);
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`sizes_thumbnail_filename\`;`);
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`sizes_card_url\`;`);
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`sizes_card_width\`;`);
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`sizes_card_height\`;`);
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`sizes_card_mime_type\`;`);
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`sizes_card_filesize\`;`);
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`sizes_card_filename\`;`);
}
