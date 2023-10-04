const path = require('path')
const express = require('express')
const livereload = require('livereload') 									// for reload browser
const connectLivereload = require('connect-livereload') 	// for reload browser

const publicDirectory = path.join(process.cwd(), 'public')

const livereloadServer = livereload.createServer() 				// for reload browser
livereloadServer.watch(publicDirectory)
livereloadServer.server.once('connection', () => {
	setTimeout(() => livereloadServer.refresh('/') , 10);
})


const app = express()
app.use(connectLivereload()) 															// for reload browser
app.use(express.static(publicDirectory))

app.set('view engine', 'pug')
// app.set('views', 'views') 						// (default) lockings views to folder /views

app.get('/', (req, res, next) => {

	const payload = {
		pageTitle: 'Home'
	}

	res.render('home', payload)
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
	console.log(`server running on http://localhost:${PORT} - ${process.env.NODE_ENV}`)
})