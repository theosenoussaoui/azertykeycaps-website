import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`informations_page\` ADD \`meta_title\` text;`)
  await db.run(sql`ALTER TABLE \`informations_page\` ADD \`meta_description\` text;`)
  await db.run(sql`ALTER TABLE \`informations_page\` DROP COLUMN \`seo_meta_title\`;`)
  await db.run(sql`ALTER TABLE \`informations_page\` DROP COLUMN \`seo_meta_description\`;`)
  await db.run(sql`ALTER TABLE \`suggestion_page\` ADD \`meta_title\` text;`)
  await db.run(sql`ALTER TABLE \`suggestion_page\` ADD \`meta_description\` text;`)
  await db.run(sql`ALTER TABLE \`suggestion_page\` DROP COLUMN \`seo_meta_title\`;`)
  await db.run(sql`ALTER TABLE \`suggestion_page\` DROP COLUMN \`seo_meta_description\`;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`informations_page\` ADD \`seo_meta_title\` text;`)
  await db.run(sql`ALTER TABLE \`informations_page\` ADD \`seo_meta_description\` text;`)
  await db.run(sql`ALTER TABLE \`informations_page\` DROP COLUMN \`meta_title\`;`)
  await db.run(sql`ALTER TABLE \`informations_page\` DROP COLUMN \`meta_description\`;`)
  await db.run(sql`ALTER TABLE \`suggestion_page\` ADD \`seo_meta_title\` text;`)
  await db.run(sql`ALTER TABLE \`suggestion_page\` ADD \`seo_meta_description\` text;`)
  await db.run(sql`ALTER TABLE \`suggestion_page\` DROP COLUMN \`meta_title\`;`)
  await db.run(sql`ALTER TABLE \`suggestion_page\` DROP COLUMN \`meta_description\`;`)
}
