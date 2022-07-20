import { Server } from "socket.io"
import fetch from 'node-fetch'
import { diff } from 'deep-object-diff'
import { config } from 'dotenv'

config({ path: './.env' })

const io = new Server({ /* options */ })

let original = null

async function fetchData () {
  const res = await fetch(process.env.JSON_SOURCE)
  const data = await res.json()
  return data
}

(async () => {
  if (!process.env.JSON_SOURCE || !process.env.SOURCE_FREQ) throw new Error('no env.')
  original = await fetchData()

  io.on("connection", (socket) => {
    console.log(`${socket.id} ${socket.handshake.address} connection`)
    socket.emit('data', original)
  })
  io.on('data', (socket) => {
    socket.emit('data', original)
  })
  io.listen(3000)

  setInterval(async () => {
    const data = await fetchData()
    const diffData = diff(original, data)

    if (JSON.stringify(diffData) !== '{}') io.emit('update', diffData)
    original = data
  }, Number(process.env.SOURCE_FREQ))
})()
