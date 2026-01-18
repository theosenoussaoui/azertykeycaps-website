import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-d1-sqlite";

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`users_sessions\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`created_at\` text,
  	\`expires_at\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`users_sessions_order_idx\` ON \`users_sessions\` (\`_order\`);`,
  );
  await db.run(
    sql`CREATE INDEX \`users_sessions_parent_id_idx\` ON \`users_sessions\` (\`_parent_id\`);`,
  );
  await db.run(sql`CREATE TABLE \`users\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`role\` text DEFAULT 'admin' NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`enable_a_p_i_key\` integer,
  	\`api_key\` text,
  	\`api_key_index\` text,
  	\`email\` text NOT NULL,
  	\`reset_password_token\` text,
  	\`reset_password_expiration\` text,
  	\`salt\` text,
  	\`hash\` text,
  	\`login_attempts\` numeric DEFAULT 0,
  	\`lock_until\` text
  );
  `);
  await db.run(
    sql`CREATE INDEX \`users_updated_at_idx\` ON \`users\` (\`updated_at\`);`,
  );
  await db.run(
    sql`CREATE INDEX \`users_created_at_idx\` ON \`users\` (\`created_at\`);`,
  );
  await db.run(
    sql`CREATE UNIQUE INDEX \`users_email_idx\` ON \`users\` (\`email\`);`,
  );
  await db.run(sql`CREATE TABLE \`media\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`alt\` text NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`url\` text,
  	\`thumbnail_u_r_l\` text,
  	\`filename\` text,
  	\`mime_type\` text,
  	\`filesize\` numeric,
  	\`width\` numeric,
  	\`height\` numeric
  );
  `);
  await db.run(
    sql`CREATE INDEX \`media_updated_at_idx\` ON \`media\` (\`updated_at\`);`,
  );
  await db.run(
    sql`CREATE INDEX \`media_created_at_idx\` ON \`media\` (\`created_at\`);`,
  );
  await db.run(
    sql`CREATE UNIQUE INDEX \`media_filename_idx\` ON \`media\` (\`filename\`);`,
  );
  await db.run(sql`CREATE TABLE \`articles\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`slug\` text NOT NULL,
  	\`img_id\` integer NOT NULL,
  	\`profile_id\` integer NOT NULL,
  	\`material\` text,
  	\`description\` text,
  	\`status\` text DEFAULT 'in_stock' NOT NULL,
  	\`start_date\` text,
  	\`end_date\` text,
  	\`url\` text NOT NULL,
  	\`additional_url\` text,
  	\`affiliate_url\` text,
  	\`warning_text\` text,
  	\`is_new\` integer DEFAULT false,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`img_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`profile_id\`) REFERENCES \`keycap_profiles\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `);
  await db.run(
    sql`CREATE UNIQUE INDEX \`articles_slug_idx\` ON \`articles\` (\`slug\`);`,
  );
  await db.run(
    sql`CREATE INDEX \`articles_img_idx\` ON \`articles\` (\`img_id\`);`,
  );
  await db.run(
    sql`CREATE INDEX \`articles_profile_idx\` ON \`articles\` (\`profile_id\`);`,
  );
  await db.run(
    sql`CREATE INDEX \`articles_material_idx\` ON \`articles\` (\`material\`);`,
  );
  await db.run(
    sql`CREATE INDEX \`articles_status_idx\` ON \`articles\` (\`status\`);`,
  );
  await db.run(
    sql`CREATE INDEX \`articles_is_new_idx\` ON \`articles\` (\`is_new\`);`,
  );
  await db.run(
    sql`CREATE INDEX \`articles_updated_at_idx\` ON \`articles\` (\`updated_at\`);`,
  );
  await db.run(
    sql`CREATE INDEX \`articles_created_at_idx\` ON \`articles\` (\`created_at\`);`,
  );
  await db.run(sql`CREATE TABLE \`keycap_profiles\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`slug\` text NOT NULL,
  	\`description\` text,
  	\`abbreviation\` text NOT NULL,
  	\`navbar_description\` text NOT NULL,
  	\`thumbnail_id\` integer,
  	\`shape\` text NOT NULL,
  	\`navbar_icon_name\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`thumbnail_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `);
  await db.run(
    sql`CREATE UNIQUE INDEX \`keycap_profiles_slug_idx\` ON \`keycap_profiles\` (\`slug\`);`,
  );
  await db.run(
    sql`CREATE INDEX \`keycap_profiles_thumbnail_idx\` ON \`keycap_profiles\` (\`thumbnail_id\`);`,
  );
  await db.run(
    sql`CREATE INDEX \`keycap_profiles_updated_at_idx\` ON \`keycap_profiles\` (\`updated_at\`);`,
  );
  await db.run(
    sql`CREATE INDEX \`keycap_profiles_created_at_idx\` ON \`keycap_profiles\` (\`created_at\`);`,
  );
  await db.run(sql`CREATE TABLE \`payload_kv\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text NOT NULL,
  	\`data\` text NOT NULL
  );
  `);
  await db.run(
    sql`CREATE UNIQUE INDEX \`payload_kv_key_idx\` ON \`payload_kv\` (\`key\`);`,
  );
  await db.run(sql`CREATE TABLE \`payload_locked_documents\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`global_slug\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `);
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_global_slug_idx\` ON \`payload_locked_documents\` (\`global_slug\`);`,
  );
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_updated_at_idx\` ON \`payload_locked_documents\` (\`updated_at\`);`,
  );
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_created_at_idx\` ON \`payload_locked_documents\` (\`created_at\`);`,
  );
  await db.run(sql`CREATE TABLE \`payload_locked_documents_rels\` (
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
  await db.run(sql`CREATE TABLE \`payload_preferences\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text,
  	\`value\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `);
  await db.run(
    sql`CREATE INDEX \`payload_preferences_key_idx\` ON \`payload_preferences\` (\`key\`);`,
  );
  await db.run(
    sql`CREATE INDEX \`payload_preferences_updated_at_idx\` ON \`payload_preferences\` (\`updated_at\`);`,
  );
  await db.run(
    sql`CREATE INDEX \`payload_preferences_created_at_idx\` ON \`payload_preferences\` (\`created_at\`);`,
  );
  await db.run(sql`CREATE TABLE \`payload_preferences_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_preferences\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`payload_preferences_rels_order_idx\` ON \`payload_preferences_rels\` (\`order\`);`,
  );
  await db.run(
    sql`CREATE INDEX \`payload_preferences_rels_parent_idx\` ON \`payload_preferences_rels\` (\`parent_id\`);`,
  );
  await db.run(
    sql`CREATE INDEX \`payload_preferences_rels_path_idx\` ON \`payload_preferences_rels\` (\`path\`);`,
  );
  await db.run(
    sql`CREATE INDEX \`payload_preferences_rels_users_id_idx\` ON \`payload_preferences_rels\` (\`users_id\`);`,
  );
  await db.run(sql`CREATE TABLE \`payload_migrations\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`batch\` numeric,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `);
  await db.run(
    sql`CREATE INDEX \`payload_migrations_updated_at_idx\` ON \`payload_migrations\` (\`updated_at\`);`,
  );
  await db.run(
    sql`CREATE INDEX \`payload_migrations_created_at_idx\` ON \`payload_migrations\` (\`created_at\`);`,
  );
  await db.run(sql`CREATE TABLE \`homepage\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`description\` text NOT NULL,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `);
  await db.run(sql`CREATE TABLE \`homepage_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`keycap_profiles_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`homepage\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`keycap_profiles_id\`) REFERENCES \`keycap_profiles\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`homepage_rels_order_idx\` ON \`homepage_rels\` (\`order\`);`,
  );
  await db.run(
    sql`CREATE INDEX \`homepage_rels_parent_idx\` ON \`homepage_rels\` (\`parent_id\`);`,
  );
  await db.run(
    sql`CREATE INDEX \`homepage_rels_path_idx\` ON \`homepage_rels\` (\`path\`);`,
  );
  await db.run(
    sql`CREATE INDEX \`homepage_rels_keycap_profiles_id_idx\` ON \`homepage_rels\` (\`keycap_profiles_id\`);`,
  );
  await db.run(sql`CREATE TABLE \`social_networks_networks\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`url\` text NOT NULL,
  	\`icon_text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`social_networks\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `);
  await db.run(
    sql`CREATE INDEX \`social_networks_networks_order_idx\` ON \`social_networks_networks\` (\`_order\`);`,
  );
  await db.run(
    sql`CREATE INDEX \`social_networks_networks_parent_id_idx\` ON \`social_networks_networks\` (\`_parent_id\`);`,
  );
  await db.run(sql`CREATE TABLE \`social_networks\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `);
  await db.run(sql`CREATE TABLE \`informations_page\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text DEFAULT 'Informations' NOT NULL,
  	\`content\` text NOT NULL,
  	\`seo_meta_title\` text,
  	\`seo_meta_description\` text,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `);
  await db.run(sql`CREATE TABLE \`suggestion_page\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text DEFAULT 'Suggérez un keyset !' NOT NULL,
  	\`description\` text DEFAULT 'Vous avez un keyset en tête qui n''est pas présent sur le site ? Vous pouvez le suggérer ici, et nous l''ajouterons si il correspond aux critères de sélection.' NOT NULL,
  	\`form_enabled\` integer DEFAULT false,
  	\`seo_meta_title\` text,
  	\`seo_meta_description\` text,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `);
}

export async function down({
  db,
  payload,
  req,
}: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`users_sessions\`;`);
  await db.run(sql`DROP TABLE \`users\`;`);
  await db.run(sql`DROP TABLE \`media\`;`);
  await db.run(sql`DROP TABLE \`articles\`;`);
  await db.run(sql`DROP TABLE \`keycap_profiles\`;`);
  await db.run(sql`DROP TABLE \`payload_kv\`;`);
  await db.run(sql`DROP TABLE \`payload_locked_documents\`;`);
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`);
  await db.run(sql`DROP TABLE \`payload_preferences\`;`);
  await db.run(sql`DROP TABLE \`payload_preferences_rels\`;`);
  await db.run(sql`DROP TABLE \`payload_migrations\`;`);
  await db.run(sql`DROP TABLE \`homepage\`;`);
  await db.run(sql`DROP TABLE \`homepage_rels\`;`);
  await db.run(sql`DROP TABLE \`social_networks_networks\`;`);
  await db.run(sql`DROP TABLE \`social_networks\`;`);
  await db.run(sql`DROP TABLE \`informations_page\`;`);
  await db.run(sql`DROP TABLE \`suggestion_page\`;`);
}
