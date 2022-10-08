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
    if(client.protocol != 'stockings') {
      client.close(4000, 'Unsupported subprotocol.')
      return false
    }
    client.repo = []
    cons.push(client)
    client.on('message', msg => {
        let m = msg.toString('utf8')
        if(m == 'ping') return null
        if(m.indexOf('stockings:repo') == 0){
          let [_, ...archives] = m.split(' ')
          client.repo = archives
          return null
        }
        cons.filter(con => con != client).forEach(con => !con.repo.includes(m.split('\n@@@\n')[3]) && con.send(m.toString()))
    })
    client.on('close', () => {
        cons = cons.filter(con => con != client)
    })
})
