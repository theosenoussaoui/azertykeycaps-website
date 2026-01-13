import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-sqlite";

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`dropshipping_websites_categories\`;`);
  await db.run(sql`DROP TABLE \`dropshipping_websites\`;`);
  await db.run(sql`DROP TABLE \`dropshipping_info_page\`;`);
  await db.run(sql`DROP TABLE \`dropshipping_sites_page\`;`);
  await db.run(sql`PRAGMA foreign_keys=OFF;`);
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	\`media_id\` integer,
  	\`articles_id\` integer,
  	\`keycap_profiles_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`articles_id\`) REFERENCES \`articles\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`keycap_profiles_id\`) REFERENCES \`keycap_profiles\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "users_id", "media_id", "articles_id", "keycap_profiles_id") SELECT "id", "order", "parent_id", "path", "users_id", "media_id", "articles_id", "keycap_profiles_id" FROM \`payload_locked_documents_rels\`;`,
  );
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`);
  await db.run(
    sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`,
  );
  await db.run(sql`PRAGMA foreign_keys=ON;`);
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`,
  );
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`,
  );
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`,
  );
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`,
  );
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`,
  );
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_articles_id_idx\` ON \`payload_locked_documents_rels\` (\`articles_id\`);`,
  );
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_keycap_profiles_id_idx\` ON \`payload_locked_documents_rels\` (\`keycap_profiles_id\`);`,
  );
  await db.run(sql`ALTER TABLE \`users\` ADD \`role\` text DEFAULT 'admin' NOT NULL;`);
  await db.run(sql`ALTER TABLE \`users\` ADD \`enable_a_p_i_key\` integer;`);
  await db.run(sql`ALTER TABLE \`users\` ADD \`api_key\` text;`);
  await db.run(sql`ALTER TABLE \`users\` ADD \`api_key_index\` text;`);
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`dropshipping_websites_categories\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`dropshipping_websites\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`dropshipping_websites_categories_order_idx\` ON \`dropshipping_websites_categories\` (\`order\`);`,
  );
  await db.run(
    sql`CREATE INDEX \`dropshipping_websites_categories_parent_idx\` ON \`dropshipping_websites_categories\` (\`parent_id\`);`,
  );
  await db.run(sql`CREATE TABLE \`dropshipping_websites\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`slug\` text NOT NULL,
  	\`banner_id\` integer,
  	\`description\` text,
  	\`examples\` text,
  	\`url\` text NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`banner_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `);
  await db.run(
    sql`CREATE UNIQUE INDEX \`dropshipping_websites_slug_idx\` ON \`dropshipping_websites\` (\`slug\`);`,
  );
  await db.run(
    sql`CREATE INDEX \`dropshipping_websites_banner_idx\` ON \`dropshipping_websites\` (\`banner_id\`);`,
  );
  await db.run(
    sql`CREATE INDEX \`dropshipping_websites_updated_at_idx\` ON \`dropshipping_websites\` (\`updated_at\`);`,
  );
  await db.run(
    sql`CREATE INDEX \`dropshipping_websites_created_at_idx\` ON \`dropshipping_websites\` (\`created_at\`);`,
  );
  await db.run(sql`CREATE TABLE \`dropshipping_info_page\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`description\` text NOT NULL,
  	\`youtube_url\` text,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `);
  await db.run(sql`CREATE TABLE \`dropshipping_sites_page\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`description\` text NOT NULL,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `);
  await db.run(
    sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`dropshipping_websites_id\` integer REFERENCES dropshipping_websites(id);`,
  );
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_dropshipping_websites_id_idx\` ON \`payload_locked_documents_rels\` (\`dropshipping_websites_id\`);`,
  );
  await db.run(sql`ALTER TABLE \`users\` DROP COLUMN \`role\`;`);
  await db.run(sql`ALTER TABLE \`users\` DROP COLUMN \`enable_a_p_i_key\`;`);
  await db.run(sql`ALTER TABLE \`users\` DROP COLUMN \`api_key\`;`);
  await db.run(sql`ALTER TABLE \`users\` DROP COLUMN \`api_key_index\`;`);
}
