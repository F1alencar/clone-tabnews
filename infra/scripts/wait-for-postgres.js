const { exec } = require("node:child_process");

function checkPostgres() {
  function handleReturn(error, stdout, stderr) {
    if (stdout.search("accepting connections") === -1) {
      process.stdout.write(".");
      checkPostgres();
      return;
    }

    console.log("\n🟢 Postgres está pronto!");
  }

  exec("docker exec postgres-dev pg_isready --host localhost", handleReturn);
}

process.stdout.write("\n\n🔴 Aguardando Postgres...");

checkPostgres();
