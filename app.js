const crypto = require('crypto')
const path = require('path')
const express = require('express')
const livereload = require('livereload') 									// for reload browser
const connectLivereload = require('connect-livereload') 	// for reload browser
const session = require('express-session')

const hpp = require('hpp') 																// Remove Duplicate Query keys
const helmet = require('helmet') 													// Add some Common Security Headers
const rateLimit = require('express-rate-limit') 					// Set request limit per IP

const errorController = require('./controllers/errorController')
const pageRouter = require('./routes/pageRoutes')
const tweetRouter = require('./routes/tweetRoute')
const userRouter = require('./routes/userRoutes')
const reviewRouter = require('./routes/reviewRoutes')
const fileRouter = require('./routes/fileRoutes')
const chatRouter = require('./routes/chatRoutes')
const messageRouter = require('./routes/messageRoutes')


const publicDirectory = path.join(process.cwd(), 'public')

const app = express()
app.set('query parser', 'simple') 										// Disable req.query auto object parse for ?color[red]
app.use((req, res, next) => {
	res.locals.cspNonce = crypto.randomBytes(16).toString('hex')
	next()
})


// -----[ For LiveReload ]-----
// Used for development purpose: To reload browser on file changes
if(process.env.NODE_ENV === 'development') {
	const livereloadServer = livereload.createServer() 				// for reload browser
	livereloadServer.watch(publicDirectory)
	livereloadServer.server.once('connection', () => {
		setTimeout(() => livereloadServer.refresh('/') , 10);
	})

	app.use(connectLivereload()) 													// for reload browser
}

// -----[ Security ]-----
// Block all inline script-src to protect from XSS attack
if(process.env.NODE_ENV !== 'development') {
	app.use(helmet({
		contentSecurityPolicy: {
			directives: {
				scriptSrc: ["'self'", (req, res) => `'nonce-${res.locals.cspNonce}'`]
			}
		}
	})) 							// => Set request limit per hour for particular IP address
}
app.use(hpp()) 									// => _page=1&_page=3 => { _page: 3 }, instead of { _page: [1,3] }
app.use(rateLimit({ 						// => 
	windowMs: 10 * 60 * 1000,    	// 10 minutes
  max: 100                     	// 100 requests per IP
})) 



// -----[ middlewares ]-----
app.use(express.json({ limit: '10mb' })) 							// To capture json data by: req.body
app.use(express.urlencoded({ extended: false })) 			// To capture key=value data send by html form by: req.body
app.use(express.static(publicDirectory))



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
app.use('/api/reviews', reviewRouter)
app.use('/api/chats', chatRouter)
app.use('/api/messages', messageRouter)
app.use('/upload', fileRouter)



app.all('*', errorController.pageNotFound)
app.use(errorController.errorHandler)

module.exports = app

