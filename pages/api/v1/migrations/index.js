import migrationRunner from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database.js";
async function migrations(request, response) {
  const allowedMethods = ["GET", "POST"];

  if (!allowedMethods.includes(request.method)) {
    return response
      .status(405)
      .json({ error: `Method "${request.method}" Not Allowed` });
  }

  let dbClient;

  try {
    dbClient = await database.getNewClient();
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
      return response.status(200).json(pendingMigrations);
    }

    if (request.method === "POST") {
      const migratedMigrations = await migrationRunner({
        ...defaultMigrationRunnerOptions,
        dryRun: false,
      });
      if (migratedMigrations.length === 0) {
        return response.status(200).json(migratedMigrations);
      }
      return response.status(201).json(migratedMigrations);
    }
  } catch (error) {
    console.error("Migration error:", error);

    throw error;
  } finally {
    await dbClient.end();
  }
}

export default migrations;
