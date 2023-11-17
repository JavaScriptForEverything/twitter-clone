require('dotenv').config()
const http = require('http')
const { Server } = require('socket.io')
const app = require('./app')
const socketController = require('./controllers/socketController')

const httpServer = http.createServer( app )
const io = new Server( httpServer, { cors: { origin: '*' }})

const dbConnect = require('./models/dbConnect')

const PORT = process.env.PORT || 5000
httpServer.listen(PORT, () => {
	console.log(`server running on http://localhost:${PORT} - ${process.env.NODE_ENV}`)
	dbConnect()
})


io.on('connect', socketController(io))
