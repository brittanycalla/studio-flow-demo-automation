const { MongoClient } = require('mongodb');
const { ObjectId } = require('mongodb');
require('dotenv').config();

async function updateDates() {
    const url = process.env.DB_STRING;
    const client = new MongoClient(url);

    try {
        await client.connect();
        console.log("Connected to MongoDB");
        const db = client.db('test');
        const collection = db.collection('shoots');

        // list of ids to update
        const shootIdsArray = process.env.SHOOTS.split(',');
        console.log(shootIdsArray)
        const idsToUpdate = shootIdsArray.map(id => new ObjectId(id));

        const shoots = await collection.find({ _id: { $in: idsToUpdate } }).toArray();
        console.log(`Found ${shoots.length} shoots to update`);

        for (const shoot of shoots) {
          if (shoot.startDate && shoot.endDate) {
              const currentStartDate = new Date(shoot.startDate);
              const newStartDate = new Date(currentStartDate.getTime() + 7 * 24 * 60 * 60 * 1000);
      
              const currentEndDate = new Date(shoot.endDate);
              const newEndDate = new Date(currentEndDate.getTime() + 7 * 24 * 60 * 60 * 1000);
      
              await collection.updateOne(
                  { _id: shoot._id },
                  {
                      $set: {
                          startDate: newStartDate.toISOString(),
                          endDate: newEndDate.toISOString()
                      }
                  }
              );
          } else {
              console.error(`Shoot with ID ${shoot._id} does not have proper date fields.`);
          }
      }      
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

updateDates();