const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');

const port = process.env.PORT || 5500;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8cjcg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('bicycle_universe');
        const bicyclesCollection = database.collection('bicycles');
        const usersCollection = database.collection('users');
        const reviewsCollection = database.collection('reviews');
    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Bicycle Universe Server is running now!');
});

app.listen(port, () => {
    console.log(`bicycle-universe-server is listening at http://localhost:${port}`);
});