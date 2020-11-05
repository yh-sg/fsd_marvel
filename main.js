const express = require("express")
const fetch = require("node-fetch")
const withQuery = require("with-query").default
const md5 = require('md5')
const hbs = require("express-handlebars")

// configure the environment
const PORT = parseInt(process.argv[2]) || parseInt(process.env.PORT) || 3000;
const API_KEY = process.env.API_KEY || '';
const URL = 'https://gateway.marvel.com/v1/public/characters'
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ts = process.env.TS;

const app = express();
const hash = (md5(ts+PRIVATE_KEY+API_KEY));

// const marvelCharacter = process.argv[2]

app.engine('hbs',hbs({defaultLayout: 'default.hbs'}))
app.set('view engine', 'hbs')

app.get('/', (req,res)=>{
    res.status(200)
    res.type('text/html')
    res.render('index')
})

app.get('/search', async(req,res)=>{
    const search = req.query['search']

    const url = withQuery(
        URL,
        {
            name:search,
            apikey: API_KEY,
            ts: ts,
            hash: hash,
        }
    )

    // console.log(`ts=${ts}&apikey=${API_KEY}&hash=${hash}`)

    let result = await fetch(url)

    // console.log(result);

    let jsResult = await result.json();

    // console.log(jsResult.data.results[0]);

    const character = jsResult.data.results
    .map((e)=>{
        return {id: e.id, name: e.name, description: e.description, thumbnail: e.thumbnail}
    })

    res.status(200)
    res.type("text/html")
    res.render('search', {character})
})

app.listen(PORT, ()=>{
    console.log(`App is running on ${PORT} at ${new Date()}`);
})
