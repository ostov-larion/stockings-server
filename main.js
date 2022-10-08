let ws = require('ws')
let express = require('express')

let port = process.env.PORT || 3000

const INDEX = '/index.html';

const server = express()
  .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
  .listen(port, () => console.log(`Listening on ${port}`))

let broker = new ws.Server({
  server
})

console.log(`Broker started on port: ${port}.`)

let cons = []

broker.on('connection', client => {
    cons.push(client)
    client.on('message', m => {
        if(m == 'ping') return null
        cons.filter(con => con != client).forEach(con => con.send(m.toString()))
    })
    client.on('close', () => {
        cons = cons.filter(con => con != client)
    })
})
