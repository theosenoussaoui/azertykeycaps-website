import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`articles\` ADD \`meta_title\` text;`)
  await db.run(sql`ALTER TABLE \`articles\` ADD \`meta_description\` text;`)
  await db.run(sql`ALTER TABLE \`articles\` ADD \`meta_image_id\` integer REFERENCES media(id);`)
  await db.run(sql`CREATE INDEX \`articles_meta_meta_image_idx\` ON \`articles\` (\`meta_image_id\`);`)
  await db.run(sql`ALTER TABLE \`keycap_profiles\` ADD \`meta_title\` text;`)
  await db.run(sql`ALTER TABLE \`keycap_profiles\` ADD \`meta_description\` text;`)
  await db.run(sql`ALTER TABLE \`keycap_profiles\` ADD \`meta_image_id\` integer REFERENCES media(id);`)
  await db.run(sql`CREATE INDEX \`keycap_profiles_meta_meta_image_idx\` ON \`keycap_profiles\` (\`meta_image_id\`);`)
  await db.run(sql`ALTER TABLE \`homepage\` ADD \`subtitle\` text NOT NULL;`)
  await db.run(sql`ALTER TABLE \`homepage\` ADD \`meta_title\` text;`)
  await db.run(sql`ALTER TABLE \`homepage\` ADD \`meta_description\` text;`)
  await db.run(sql`ALTER TABLE \`homepage\` ADD \`meta_image_id\` integer REFERENCES media(id);`)
  await db.run(sql`CREATE INDEX \`homepage_meta_meta_image_idx\` ON \`homepage\` (\`meta_image_id\`);`)
  await db.run(sql`ALTER TABLE \`homepage\` DROP COLUMN \`description\`;`)
  await db.run(sql`ALTER TABLE \`informations_page\` ADD \`meta_image_id\` integer REFERENCES media(id);`)
  await db.run(sql`CREATE INDEX \`informations_page_meta_meta_image_idx\` ON \`informations_page\` (\`meta_image_id\`);`)
  await db.run(sql`ALTER TABLE \`suggestion_page\` ADD \`meta_image_id\` integer REFERENCES media(id);`)
  await db.run(sql`CREATE INDEX \`suggestion_page_meta_meta_image_idx\` ON \`suggestion_page\` (\`meta_image_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_articles\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`slug\` text NOT NULL,
  	\`img_id\` integer NOT NULL,
  	\`description\` text,
  	\`profile_id\` integer NOT NULL,
  	\`material\` text,
  	\`url\` text NOT NULL,
  	\`additional_url\` text,
  	\`affiliate_url\` text,
  	\`start_date\` text,
  	\`end_date\` text,
  	\`warning_text\` text,
  	\`status\` text DEFAULT 'in_stock' NOT NULL,
  	\`is_new\` integer DEFAULT false,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`img_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`profile_id\`) REFERENCES \`keycap_profiles\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new_articles\`("id", "title", "slug", "img_id", "description", "profile_id", "material", "url", "additional_url", "affiliate_url", "start_date", "end_date", "warning_text", "status", "is_new", "updated_at", "created_at") SELECT "id", "title", "slug", "img_id", "description", "profile_id", "material", "url", "additional_url", "affiliate_url", "start_date", "end_date", "warning_text", "status", "is_new", "updated_at", "created_at" FROM \`articles\`;`)
  await db.run(sql`DROP TABLE \`articles\`;`)
  await db.run(sql`ALTER TABLE \`__new_articles\` RENAME TO \`articles\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE UNIQUE INDEX \`articles_slug_idx\` ON \`articles\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`articles_img_idx\` ON \`articles\` (\`img_id\`);`)
  await db.run(sql`CREATE INDEX \`articles_profile_idx\` ON \`articles\` (\`profile_id\`);`)
  await db.run(sql`CREATE INDEX \`articles_material_idx\` ON \`articles\` (\`material\`);`)
  await db.run(sql`CREATE INDEX \`articles_status_idx\` ON \`articles\` (\`status\`);`)
  await db.run(sql`CREATE INDEX \`articles_is_new_idx\` ON \`articles\` (\`is_new\`);`)
  await db.run(sql`CREATE INDEX \`articles_updated_at_idx\` ON \`articles\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`articles_created_at_idx\` ON \`articles\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`__new_keycap_profiles\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`abbreviation\` text NOT NULL,
  	\`slug\` text NOT NULL,
  	\`description\` text,
  	\`thumbnail_id\` integer,
  	\`navbar_description\` text NOT NULL,
  	\`navbar_icon_name\` text,
  	\`shape\` text NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`thumbnail_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new_keycap_profiles\`("id", "title", "abbreviation", "slug", "description", "thumbnail_id", "navbar_description", "navbar_icon_name", "shape", "updated_at", "created_at") SELECT "id", "title", "abbreviation", "slug", "description", "thumbnail_id", "navbar_description", "navbar_icon_name", "shape", "updated_at", "created_at" FROM \`keycap_profiles\`;`)
  await db.run(sql`DROP TABLE \`keycap_profiles\`;`)
  await db.run(sql`ALTER TABLE \`__new_keycap_profiles\` RENAME TO \`keycap_profiles\`;`)
  await db.run(sql`CREATE UNIQUE INDEX \`keycap_profiles_slug_idx\` ON \`keycap_profiles\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`keycap_profiles_thumbnail_idx\` ON \`keycap_profiles\` (\`thumbnail_id\`);`)
  await db.run(sql`CREATE INDEX \`keycap_profiles_updated_at_idx\` ON \`keycap_profiles\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`keycap_profiles_created_at_idx\` ON \`keycap_profiles\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`__new_homepage\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`description\` text NOT NULL,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`INSERT INTO \`__new_homepage\`("id", "title", "description", "updated_at", "created_at") SELECT "id", "title", "description", "updated_at", "created_at" FROM \`homepage\`;`)
  await db.run(sql`DROP TABLE \`homepage\`;`)
  await db.run(sql`ALTER TABLE \`__new_homepage\` RENAME TO \`homepage\`;`)
  await db.run(sql`CREATE TABLE \`__new_informations_page\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text DEFAULT 'Informations' NOT NULL,
  	\`content\` text NOT NULL,
  	\`meta_title\` text,
  	\`meta_description\` text,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`INSERT INTO \`__new_informations_page\`("id", "title", "content", "meta_title", "meta_description", "updated_at", "created_at") SELECT "id", "title", "content", "meta_title", "meta_description", "updated_at", "created_at" FROM \`informations_page\`;`)
  await db.run(sql`DROP TABLE \`informations_page\`;`)
  await db.run(sql`ALTER TABLE \`__new_informations_page\` RENAME TO \`informations_page\`;`)
  await db.run(sql`CREATE TABLE \`__new_suggestion_page\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text DEFAULT 'Suggérez un keyset !' NOT NULL,
  	\`description\` text DEFAULT 'Vous avez un keyset en tête qui n''est pas présent sur le site ? Vous pouvez le suggérer ici, et nous l''ajouterons si il correspond aux critères de sélection.' NOT NULL,
  	\`meta_title\` text,
  	\`meta_description\` text,
  	\`form_enabled\` integer DEFAULT false,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`INSERT INTO \`__new_suggestion_page\`("id", "title", "description", "meta_title", "meta_description", "form_enabled", "updated_at", "created_at") SELECT "id", "title", "description", "meta_title", "meta_description", "form_enabled", "updated_at", "created_at" FROM \`suggestion_page\`;`)
  await db.run(sql`DROP TABLE \`suggestion_page\`;`)
  await db.run(sql`ALTER TABLE \`__new_suggestion_page\` RENAME TO \`suggestion_page\`;`)
}
