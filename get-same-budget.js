const { finished } = require('stream');
const fs = require('fs');
const { promisify } = require('util');
const MongoClient = require('mongodb').MongoClient;

// Connection URL
const connectionString = 'mongodb://localhost:27017';
// Database Name
const dbName = 'eubfr';

async function run(dest) {
  try {
    const write = buildWrite(dest);
    const client = await MongoClient.connect(connectionString, { useNewUrlParser: true });
    const db = client.db(dbName);
    try {
      const cursor = await db.collection('projects').aggregate({
        $group: { 
            // Group by fields to match on (a,b)
            _id: { budget: "$_source.budget.total_cost.value"},
            // Count number of matching docs for the group
            count: { $sum:  1 },
            // Save the _id for matching docs
            projects: { $push: "$_id" }
          }
        },
        // Limit results to duplicates (more than 1 match) 
        {
          $match: {
            count: { $gt : 1 }
          }
        });
      
      for (let doc = await cursor.next(); doc; doc = await cursor.next()) {
        await write(JSON.stringify(project) + '\n');
      }
    } finally {
        client.close();
    }
  } catch (err) {
    client.close();
    dest.destroy(err);
  }
}


const buildWrite = (stream) => {
  const streamError = null;
  stream.on('error', function(err) {
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
        stream.once('drain', resolve);
      }
    });
  }
}

const dest = fs.createWriteStream('./results/same-budget.ndjson');
run(dest).catch(console.log);


