import migrationRunner from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database.js";
async function migrations(request, response) {
  const dbClient = await database.getNewClient();
  const defaultMigrationRunnerOptions = {
    dbClient,
    dryRun: true,
    dir: join("infra", "migrations"),
    direction: "up",
    migrationsTable: "pgmigrations",
    verbose: true,
  };

  if (request.method == "GET") {
    const pendingMigrations = await migrationRunner(
      defaultMigrationRunnerOptions,
    );
    await dbClient.end();
    return response.status(200).json(pendingMigrations);
  }

  if (request.method === "POST") {
    const migratedMigrations = await migrationRunner({
      ...defaultMigrationRunnerOptions,
      dryRun: false,
    });
    await dbClient.end();
    if (migratedMigrations.length === 0) {
      return response.status(200).json(migratedMigrations);
    } else {
      return response.status(201).json(migratedMigrations);
    }
  }

  response.status(405).end();
}

export default migrations;
