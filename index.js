const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

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
        const ordersCollection = database.collection('orders');
        const reviewsCollection = database.collection('reviews');

        //GET all bicycles api
        app.get('/bicycles', async (req, res) => {
            const cursor = bicyclesCollection.find({});
            const allBicycles = await cursor.toArray();
            res.send(allBicycles);
        });

        //GET specific bicycle api
        app.get('/bicycle/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const bicycle = await bicyclesCollection.findOne(query);
            res.send(bicycle);
        });

        //GET api to get all orders
        app.get('/orders', async (req, res) => {
            const cursor = ordersCollection.find({});
            const allOrders = await cursor.toArray();
            res.send(allOrders);
        })

        //GET api to get all the orders from an specific users
        app.get('/myOrders', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const cursor = ordersCollection.find(query);
            const myOrders = await cursor.toArray();
            res.json(myOrders);
        });

        //GET api for get reviews
        app.get('/reviews', async (req, res) => {
            const cursor = reviewsCollection.find({});
            const allReviews = await cursor.toArray();
            res.send(allReviews);
        });

        //GET api to get admin
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        });

        //POST api to add new product(bicycle)
        app.post('/bicycles', async (req, res) => {
            const bicycle = req.body;
            const result = await bicyclesCollection.insertOne(bicycle);
            res.json(result);
        })

        //POST api for newly rgistered users
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);
        });

        //POST api for collect orders
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            res.json(result);
        });

        //POST api for posting review
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewsCollection.insertOne(review);
            res.json(result);
        });

        //DELETE api to delete product from allCollection
        app.delete('/bicycles/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await bicyclesCollection.deleteOne(query);
            res.json(result);
        })

        //DELETE api for delete myOrders
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            res.json(result);
        });

        //PUT api for google sign in user using upsert
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        //PUT api for make someone(user) admin
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        });

        //PUT api to approve(change status od an) order
        app.put('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = { $set: { status: 'Shipped' } };
            const result = await ordersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        })
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