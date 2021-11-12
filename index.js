const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();


const app = express();
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qvyuz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const run = async () => {
    await client.connect();
    console.log("Database Connected");
    const database = client.db('Jewelliaa');
    const userCollection = database.collection('users');
    const productCollection = database.collection('products');
    const reviewCollection = database.collection('reviews');
    const orderCollection = database.collection('orders');
    const categoryCollection = database.collection('categories');

    // Post user api
    app.post('/users', async (req, res) => {
        const user = req.body;
        const result = await userCollection.insertOne(user);
        res.json(result);
    });

    // Make admin
    app.put('/make-admin/:email', async (req, res) => {
        const email = req.body.email;
        const CurrentUserEmail = req.params.email;
        const user = await userCollection.findOne({ email: CurrentUserEmail });
        console.log(user);
        if (!user) {
            res.json('403 Forbidden')
        }
        else if (user.role === 'admin') {
            const filter = { email: email };
            const dbUser = await userCollection.findOne(filter);
            if (dbUser) {
                const updateDoc = { $set: { role: 'admin' } };
                const result = await userCollection.updateOne(filter, updateDoc);
                res.json(result);
            }
            else {
                res.json({ error: `We Couldn't find this ${email} user` });
            }
        }
        else {
            res.json({ error: "You are not authorize" });
        }

    });

    // Is admin API
    app.get('/admin/:email', async (req, res) => {
        const email = req.params.email;
        const user = await userCollection.findOne({ email: email });
        let isAdmin = false;
        if (user) {
            if (user.role === 'admin') {
                isAdmin = true;
            }
            else {
                isAdmin = false;
            }
        }
        else {
            res.json('user not found')
        }
        // console.log(isAdmin);
        res.json({ admin: isAdmin });
    })

    // Get product API
    app.get('/products', async (req, res) => {
        const cursor = productCollection.find({});
        const products = await cursor.toArray();
        res.send(products);
    });

    // Get single product API
    app.get('/product/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const product = await productCollection.findOne(query);
        res.send(product);
    });

    // Post product API
    app.post('/products', async (req, res) => {
        const product = req.body;
        const result = await productCollection.insertOne(product);
        res.json(result);
    })

    // Delete product
    app.delete('/product/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) }
        const result = await productCollection.deleteOne(query);
        res.json(result);
    })

    // Get product API
    app.get('/reviews', async (req, res) => {
        const cursor = reviewCollection.find({});
        const reviews = await cursor.toArray();
        res.send(reviews);
    });

    // Post review api
    app.post('/reviews', async (req, res) => {
        const review = req.body;
        const result = await reviewCollection.insertOne(review);
        res.json(result);
    })

    // Post order API
    app.post('/orders', async (req, res) => {
        const order = req.body;
        const result = await orderCollection.insertOne(order);
        res.json(result);
    });

    // Delete order
    app.delete('/order/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) }
        const result = await orderCollection.deleteOne(query);
        res.json(result);
    });

    // Shipped approve Order
    app.put('/update-order', async (req, res) => {
        const id = req.body.id;
        const query = { _id: ObjectId(id) }
        // const order = await orderCollection.findOne({ _id: ObjectId(id) });
        const updateDoc = { $set: { status: 'shipped' } };
        const result = await orderCollection.updateOne(query, updateDoc)
        console.log(result);
        res.json(result);
    })

    // get user orders by post API using email
    app.post('/user-orders', async (req, res) => {
        const email = req.body.email;
        const filter = orderCollection.find({ email: email });
        const orders = await filter.toArray();
        res.json(orders);
    });


    // get orders API
    app.get('/orders', async (req, res) => {
        const cursor = orderCollection.find({});
        const orders = await cursor.toArray();
        res.send(orders);
    });

    // get category api
    app.get('/categories', async (req, res) => {
        const cursor = categoryCollection.find({});
        const categories = await cursor.toArray();
        res.send(categories);
    })


}

run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Hello from Jewelliaa server');
});

app.listen(port, () => {
    console.log('Running port is ', port);
})