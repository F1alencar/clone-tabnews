import database from "infra/database.js";

async function status(request, response) {
  const updatedAt = new Date().toISOString();
  const databaseVersionResult = await database.query({ text: "SHOW server_version;" });
  const databaseMaxConnections = await database.query({ text: "SHOW max_connections;" });

  const databaseName = process.env.POSTGRES_DB;
  const databaseOpenedConnections = await database.query({
    text: "SELECT COUNT(*)::int FROM pg_stat_activity WHERE datname = $1;",
    values: [databaseName]
  });

  response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        version: databaseVersionResult.rows[0].server_version,
        max_connections: parseInt(databaseMaxConnections.rows[0].max_connections),
        opened_connections: databaseOpenedConnections.rows[0].count,
      }
    }
  });
}

export default status;
