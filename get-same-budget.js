const fs = require("fs");
const MongoClient = require("mongodb").MongoClient;

// Connection URL
const connectionString = "mongodb://localhost:27017";
// Database Name
const dbName = "eubfr";

async function run(dest) {
  const client = await MongoClient.connect(
    connectionString,
    { useNewUrlParser: true }
  );

  try {
    const write = buildWrite(dest);
    const db = client.db(dbName);

    try {
      const searchCount = await db.collection("projects").aggregate(
        [
          {
            $match: {
                "_source.budget.total_cost.value": { $gt: 0 }
            }
          },
          {
            $group: {
              _id: { budget: "$_source.budget.total_cost.value" },
              count: { $sum: 1 },
              projects: { $push: "$_id" }
            }
          },
          {
            $match: {
                count: { $gt: 1 }
            }
          },
          {
              $sort: { _id: -1 }
          }          
        ],
        {
          allowDiskUse: true
        }
      );

      for (let doc = await searchCount.next(); doc; doc = await searchCount.next()) {
        await write(JSON.stringify(doc) + "\n");
      }

    } finally {
      client.close();
    }
  } catch (err) {
    console.log(err)
    client.close();
    dest.destroy(err);
  }
}

const buildWrite = stream => {
  let streamError = null;
  stream.on("error", function(err) {
    streamError = err;
  });

  return write;

  function write(project) {
    if (streamError) {
      return Promise.reject(streamError);
    }

    return new Promise(function(resolve, reject) {
      const res = stream.write(project);
      if (res) {
        resolve();
      } else {
        stream.once("drain", resolve);
      }
    });
  }
};

const dest = fs.createWriteStream("./results/same-budget.ndjson");
run(dest).catch(console.log);
