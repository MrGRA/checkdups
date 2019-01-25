const fs = require("fs");
const es = require("event-stream");
const MongoClient = require("mongodb").MongoClient;
const used = process.memoryUsage();
let projects = 0;

const isJsonValid = jsonString => {
  return /^[\],:{}\s]*$/.test(
    jsonString
      .replace(/\\["\\\/bfnrtu]/g, "@")
      .replace(
        /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
        "]"
      )
      .replace(/(?:^|:|,)(?:\s*\[)+/g, "")
  );
};

// Connection URL
const connectionString = "mongodb://localhost:27017";
// Database Name
const dbName = "eubfr";

async function run(filename) {
  const client = await MongoClient.connect(
    connectionString,
    { useNewUrlParser: true }
  );
  const db = client.db(dbName);
  const s = fs
    .createReadStream(filename)
    .pipe(es.split())
    .pipe(
      es
        .mapSync(function(projectString) {
          // pause the readstream
          s.pause();
          if (isJsonValid(projectString)) {
            projects += 1;
            let project = JSON.parse(projectString);
            db.collection("projects").insertOne(project, function(
              error,
              response
            ) {
              if (error) {
                console.log("Error occurred while inserting");
                s.resume();
                // return
              } else {
                // console.log('inserted record', response.ops[0]);
                s.resume();
                // return
              }
            });
          } else {
            s.resume();
          }
        })
        .on("error", function(err) {
          client.close();
          console.log("Error while reading file.", err);
        })
        .on("end", function() {
          console.log("Total number of Projects: " + projects);
          for (let key in used) {
            console.log(
              `${key} ${Math.round((used[key] / 1024 / 1024) * 100) / 100} MB`
            );
          }
          client.close();
        })
    );
}

run("results.ndjson").catch(console.log);
