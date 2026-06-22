const express = require('express')
const expressWs = require('express-ws')

const app = express()
expressWs(app)

const port = process.env.PORT || 3001
let connects = []
let history = []  // メッセージ履歴を保存

app.use(express.static('public'))

app.ws('/ws', (ws, req) => {
  connects.push(ws)

  // 入室通知
  const joinMsg = JSON.stringify({ type: 'system', text: '誰かが入室しました' })
  connects.forEach((socket) => {
    if (socket.readyState === 1) {
      socket.send(joinMsg)
    }
  })

  // 接続時に履歴を送る
  history.forEach((msg) => {
    ws.send(msg)
  })

  ws.on('message', (message) => {
    console.log('Received:', message)
    history.push(message)  // 履歴に追加

    connects.forEach((socket) => {
      if (socket.readyState === 1) {
        socket.send(message)
      }
    })
  })

  ws.on('close', () => {
    connects = connects.filter((conn) => conn !== ws)

    // 退室通知
    const leaveMsg = JSON.stringify({ type: 'system', text: '誰かが退室しました' })
    connects.forEach((socket) => {
      if (socket.readyState === 1) {
        socket.send(leaveMsg)
      }
    })
  })
})

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})