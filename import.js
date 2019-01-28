const fs = require("fs");
const es = require("event-stream");
const MongoClient = require("mongodb").MongoClient;

const run = async filename => {
  const connectionString = "mongodb://localhost:27017";
  const dbName = "eubfr";
  let projects = 0;

  const client = await MongoClient.connect(
    connectionString,
    { useNewUrlParser: true }
  );

  const db = client.db(dbName);

  return new Promise((resolve, reject) => {
    fs.createReadStream(filename)
      .pipe(es.split())
      .pipe(
        es
          .mapSync(line => {
            try {
              const project = JSON.parse(line);
              db.collection("projects")
                .insertOne(project)
                .then(() => {
                  // Clear screen to keep feedback on one line.
                  process.stdout.write("\033c");
                  projects += 1;
                  console.log(`Imported projects: ${projects}`);
                });
            } catch (error) {
              console.log(
                `There was an error while trying to import ${line}`,
                error
              );
            }
          })
          .on("error", error => {
            client.close();
            console.error("Error while reading file.", error);
            reject();
          })
          .on("end", () => {
            client.close();
            console.log("Total number of Projects: " + projects);
            resolve();
          })
      );
  });
};

(async () => {
  try {
    await run("results.ndjson");
  } catch (error) {
    throw new Error("results.ndjson file missing in the project root foler");
  }
})();
