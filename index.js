import { Server } from "socket.io"
import fetch from 'node-fetch'
import { diff } from 'deep-object-diff'

const io = new Server({ /* options */ })

const original = null

async function fetchData () {
  const res = await fetch('https://script.google.com/macros/s/AKfycby0TNkshgnuV6rwQrD0Hx5GFkvx1dWTgBCgLIUh_VO4srIpYVhcE1VFBqBa69ka97A/exec')
  const data = await res.json()
  return data
}

(async () => {
  original = await fetchData()

  io.on("connection", (socket) => {
    console.log(`${socket.id} ${socket.handshake.address} connection`)
    socket.emit('data', original)
  })
  io.on('data', (socket) => {
    socket.emit('data', original)
  })
  io.listen(3000)

  setInterval(() => {
    const data = await fetchData()
    const diffData = diff(original, data)

    io.emit('update', diffData)
    original = data
  }, 3000)
})()