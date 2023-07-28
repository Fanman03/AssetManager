const express = require('express');
require('dotenv').config();
const app = express();
const cors = require('cors');
const exphbs = require('express-handlebars');
const path = require('path');
const fs = require("fs");
const handlebars = require("handlebars");
const pjson = require('./package.json');

const { MongoClient, MongoWriteConcernError } = require("mongodb");
const crypto = require('crypto');
let client = "invalid";
try {
    const MONGODB_URI = process.env.MONGODB_URI;
    client = new MongoClient(MONGODB_URI);
} catch {
    console.error("Error! Please ensure the MONGODB_URI env variable is set to a valid MongoDB connection string.");
}

const BASE_DOMAIN = process.env.BASE_DOMAIN;
const APP_NAME = process.env.APP_NAME;

handlebars.registerHelper('ifEquals', function (arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

app.engine('.hbs', exphbs.engine({ extname: '.hbs', defaultLayout: "main" }));
app.set('view engine', 'hbs');

app.set('views', './views');
app.use('/css', express.static(path.join(__dirname, './css')));
app.use('/css', express.static(path.join(__dirname, './node_modules/bootstrap/dist/css')));
app.use('/css', express.static(path.join(__dirname, './node_modules/bootstrap-icons/font')));
app.use('/js', express.static(path.join(__dirname, './node_modules/bootstrap/dist/js')));
app.use('/js', express.static(path.join(__dirname, './node_modules/jquery/dist')));
app.use('/js', express.static(path.join(__dirname, './node_modules/@popperjs/core/dist/cjs')));
app.use('/js', express.static(path.join(__dirname, './node_modules/showdown/dist')));
app.use('/img', express.static(path.join(__dirname, './img')));


app.get('/', async (req, res) => {
    if (client != "invalid") {
        let assets = await getAllAssets();
        if (process.env.DISABLE_DARKMODE) {
            res.render('list', { "appName": APP_NAME, "assets": assets, "assetsJson": JSON.stringify(assets), "errorText": "No items exist matching that search term.","version":pjson.version, layout: "ignore-dark" });
        } else {
            res.render('list', { "appName": APP_NAME, "assets": assets, "assetsJson": JSON.stringify(assets), "errorText": "No items exist matching that search term.","version":pjson.version });
        }
    } else {
        let assets = undefined;
        if (process.env.DISABLE_DARKMODE) {
            res.render('list', { "appName": APP_NAME, "assets": assets, "assetsJson": JSON.stringify(assets), "errorText": "Unable to connect to database.","version":pjson.version, layout: "ignore-dark" });
        } else {
            res.render('list', { "appName": APP_NAME, "assets": assets, "assetsJson": JSON.stringify(assets), "errorText": "Unable to connect to database.","version":pjson.version });
        }
    }
});

app.get('/:tag', async (req, res) => {
    let asset = await getAssetInfo(req.params.tag);
    if (process.env.DISABLE_DARKMODE) {
        res.render('asset', { "appName": APP_NAME, "asset": asset, "domain": BASE_DOMAIN, "assetJson": JSON.stringify(asset), "id": req.params.tag,"version":pjson.version, layout: "ignore-dark" });
    } else {
        res.render('asset', { "appName": APP_NAME, "asset": asset, "domain": BASE_DOMAIN, "assetJson": JSON.stringify(asset), "id": req.params.tag,"version":pjson.version });
    }
});

app.get('/i/:tag', async (req, res) => {
    res.render('barcode', { "appName": APP_NAME, "id": req.params.tag, "domain": BASE_DOMAIN,"version":pjson.version, layout: "ignore-dark" });
});

app.listen(3002);

async function getAssetInfo(tag) {
    try {
        const db = client.db("asset-db");
        const assets = db.collection("assets");
        const query = { _id: tag };

        let foundTag = await assets.findOne(query);
        return foundTag;

    } catch (error) {
        console.error(error);
    } finally {
        // Ensures that the client will close when you finish/error
        //await client.close();
    }
}

async function getAllAssets() {
    try {
        const db = client.db("asset-db");
        const assets = db.collection("assets");

        let allAssets = await assets.find({}).toArray();
        return allAssets;

    } catch (error) {
        console.error(error);
    } finally {
        // Ensures that the client will close when you finish/error
        //await client.close();
    }
}