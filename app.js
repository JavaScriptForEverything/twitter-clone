const path = require('path')
const express = require('express')
const livereload = require('livereload') 									// for reload browser
const connectLivereload = require('connect-livereload') 	// for reload browser
// const session = require('express-session')


const pageRouter = require('./routes/pageRoutes')
// const userRoute = require('./routes/userRoute')


const publicDirectory = path.join(process.cwd(), 'public')

// for LiveReload
const livereloadServer = livereload.createServer() 				// for reload browser
livereloadServer.watch(publicDirectory)
livereloadServer.server.once('connection', () => {
	setTimeout(() => livereloadServer.refresh('/') , 10);
})





const app = express()
app.set('view engine', 'pug') 												// Setup pug as Templete 
// app.set('views', 'views') 													// (default) lockings views to folder /views

app.use(connectLivereload()) 													// for reload browser
app.use(express.static(publicDirectory))
app.use(express.json({ limit: '10mb' })) 							// To capture json data by: req.body
app.use(express.urlencoded({ extended: false })) 			// To capture key=value data send by html form by: req.body

// app.use(session({
// 	secret: process.env.SESSION_SECRET,
// 	resave: true,
// 	saveUninitialized: false
// }))



// -----[ routes ]-----
app.use('/', pageRouter)
// app.use('/api/users', userRoute)






module.exports = app

