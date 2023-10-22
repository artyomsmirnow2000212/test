const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const { MongoClient } = require('mongodb');
const cors = require('cors')

const app = express();
app.use(bodyParser.json());
app.use(cors());
const SECRETKEY = "hiaml4wsefychSI";

const BD_URL = "mongodb+srv://user12:user12@cluster0.3ddrsx9.mongodb.net/?retryWrites=true&w=majority";
const dbName = 'test';
const collectionName = 'secrets';

app.post('/api/save', async (req, res) => {
    try {
        // Генерация уникальной ссылки
        function generateRandomString(length) {
            return crypto.randomBytes(length).toString('hex');
        }

        const hash = generateRandomString(8);
        const link = `http://localhost:8080/${hash}`;

        const client = await MongoClient.connect(BD_URL);
        const db = await client.db(dbName);
        const collection = await db.collection(collectionName);
        // Шифруем
        const cipher = crypto.createCipher('aes256', SECRETKEY);
        const encryptedContent = cipher.update(req.body.content, 'utf8', 'hex') + cipher.final('hex');
        // добавляем в бд данные
        await collection.insertOne({ hash, encryptedContent });
        await client.close();

        res.status(200).json({ link });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/:hash', async (req, res) => {
    try {
        const hash = req.params.hash;
        const client = await MongoClient.connect(BD_URL);
        const db = await client.db(dbName);
        const collection = await db.collection(collectionName);

        const result = await collection.findOne({hash: hash});
        const shifrText = await result.encryptedContent;

        // Расшифровка контента
        const decipher = crypto.createDecipher('aes256', SECRETKEY);
        const decryptedContent = decipher.update(shifrText, 'hex', 'utf8') + decipher.final('utf8');

        await client.close();

        if (!result) {
            res.status(404).json({ error: 'Secret not found' });
        } else {
            res.status(200).json({decryptedContent} );
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});