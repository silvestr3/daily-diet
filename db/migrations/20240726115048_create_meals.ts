import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("meals", (table) => {
    table.uuid("id").notNullable().primary();
    table.timestamp("name").notNullable();
    table.text("description").notNullable();
    table.date("date").notNullable();
    table.time("time").notNullable();
    table.boolean("isOnDiet").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("meals");
}
