let ws = require('ws')
let express = require('express')

let port = process.env.port || 8080

const INDEX = '/index.html';

const server = express()
  .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
  .listen(port, () => console.log(`Listening on ${port}`))

let broker = new ws.Server({port})

console.log(`Broker started on port: ${port}.`)

let subs = []

let cons = []

broker.on('connection', client => {
    cons.push(client)
    client.on('message', m => {
        let [_h, body] = m.toString().split('|')
        let [type, $topic] = _h.split(' ')
        console.log(type, $topic)
        if(type == 'pub')
            subs.filter(([con, topic]) => topic == $topic && con != client).forEach(([con]) => con.send(body))
        if(type == 'sub') {
            subs.push([client, $topic])
            cons.filter(con => con != client).forEach(con => con.send(`greet ${$topic}`))
        }
    })
    client.on('close', () => {
        subs = subs.filter(([con, _]) => con != client)
        cons = cons.filter(con => con != client)
    })
})