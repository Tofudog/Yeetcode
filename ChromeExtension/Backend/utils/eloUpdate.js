import { MongoClient, ServerApiVersion } from 'mongodb';
import Player from '../elocalculation.js';

const uri = ""; //insert uri to cluster

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function updateElo(user, newElo) {
  try {
      await client.connect();
      const db = client.db("test");
      const collection = db.collection("users");
      const result = await collection.updateOne(
          {username: user},
          {$set: {elo: newElo}}
      );
    }
  finally {
    await client.close();
  }
}

async function testUpdateElo(LeetcodeUser) {
  //a rough idea of how elo is updated in the context of the project
  const user = LeetcodeUser.username;
}

//updateElo("Tofudog25").catch(console.dir);

export default updateElo;
