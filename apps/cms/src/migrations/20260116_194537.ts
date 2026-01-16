import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-sqlite";

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE INDEX \`articles_material_idx\` ON \`articles\` (\`material\`);`);
  await db.run(sql`CREATE INDEX \`articles_status_idx\` ON \`articles\` (\`status\`);`);
  await db.run(sql`CREATE INDEX \`articles_is_new_idx\` ON \`articles\` (\`is_new\`);`);
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP INDEX \`articles_material_idx\`;`);
  await db.run(sql`DROP INDEX \`articles_status_idx\`;`);
  await db.run(sql`DROP INDEX \`articles_is_new_idx\`;`);
}
