const path = require('path')
const express = require('express')
const livereload = require('livereload') 									// for reload browser
const connectLivereload = require('connect-livereload') 	// for reload browser
const session = require('express-session')

const errorController = require('./controllers/errorController')
const pageRouter = require('./routes/pageRoutes')
const tweetRouter = require('./routes/tweetRoute')
const userRouter = require('./routes/userRoutes')
const fileRouter = require('./routes/fileRoutes')


const publicDirectory = path.join(process.cwd(), 'public')

// for LiveReload
const livereloadServer = livereload.createServer() 				// for reload browser
livereloadServer.watch(publicDirectory)
livereloadServer.server.once('connection', () => {
	setTimeout(() => livereloadServer.refresh('/') , 10);
})

const app = express()
app.use(express.json({ limit: '10mb' })) 							// To capture json data by: req.body
app.use(express.urlencoded({ extended: false })) 			// To capture key=value data send by html form by: req.body
app.use(express.static(publicDirectory))
app.use(connectLivereload()) 													// for reload browser

// Use after express.static() middleware and before templete engine
app.use(session({
	secret: process.env.SESSION_SECRET,
	resave: true,
	saveUninitialized: false,
	cookie: {
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'strict',
		maxAge: 1000*60*60*24*30 													// One month
	}
}))

app.set('view engine', 'pug') 												// Setup pug as Templete 


// -----[ routes ]-----
app.use('/', pageRouter)
app.use('/api/tweets', tweetRouter)
app.use('/api/users', userRouter)
app.use('/upload', fileRouter)



app.all('*', errorController.pageNotFound)
app.use(errorController.errorHandler)

module.exports = app

