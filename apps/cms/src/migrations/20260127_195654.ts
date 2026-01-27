import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-d1-sqlite";

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(
    sql`ALTER TABLE \`not_found_page\` ADD \`cta_text\` text DEFAULT 'Back to Home' NOT NULL;`,
  );
}

export async function down({
  db,
  payload,
  req,
}: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`not_found_page\` DROP COLUMN \`cta_text\`;`);
}
