import database from "infra/database.js";

async function cleanDatabase() {
  await database.query("DROP schema public cascade; CREATE schema public;");
}

beforeAll(async () => {
  await cleanDatabase();
});

test("POST to /api/v1/migrations should return 200", async () => {
  const response1 = await fetch("http://localhost:3000/api/v1/migrations", {
    method: "POST",
  });

  expect(response1.status).toBe(201);

  const response1Body = await response1.json();

  expect(Array.isArray(response1Body)).toBe(true);

  expect(response1Body.length).toBeGreaterThan(0);

  const migrationsCountQuery = "SELECT COUNT(*) AS count FROM pgmigrations;";

  const databaseResult1 = await database.query(migrationsCountQuery);
  const databaseMigrationsCount1 = parseInt(databaseResult1.rows[0].count);

  expect(databaseMigrationsCount1).toEqual(response1Body.length);

  //...Running migrations again should result in zero migrations applied...
  const response2 = await fetch("http://localhost:3000/api/v1/migrations", {
    method: "POST",
  });

  expect(response2.status).toBe(200);

  const response2Body = await response2.json();

  expect(Array.isArray(response2Body)).toBe(true);

  expect(response2Body.length).toBe(0);

  const databaseResult2 = await database.query(migrationsCountQuery);
  const databaseMigrationsCount2 = parseInt(databaseResult2.rows[0].count);

  expect(databaseMigrationsCount2).toEqual(1);
});
