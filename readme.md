

- Tailwind With express
- Creating Project with browser reload
- MongoDB Database wiht mongoose
- Configure express-session


```
$ yarn add -D tailwindcss postcss autoprefixer
$ yarn tailwindcss init

/tailwind.config.js:

        module.exports = {
                content: ["**/*.{pug,html}"],
                theme: {
                extend: {},
                },
                plugins: [],
        }


/tailwind.css:
        @tailwind base;
        @tailwind components;
        @tailwind utilities;


/package.json:
{
        "name": "twitter-clone",
        "version": "1.0.0",
        "main": "server.js",
        "license": "MIT",
        "scripts": {
                "tailwind": "tailwindcss --input tailwind.css --output public/style.css --watch",
                "start": "PORT=5000 NODE_ENV=production node .",
                "watch": "PORT=5000 NODE_ENV=development nodemon . --ext js,pug --ignore public",
                "dev": "concurrently --kill-others \"yarn tailwind\" \"yarn watch\""
        },
        "dependencies": {
                "dotenv": "^16.3.1",
                "express": "^4.18.2",
                "express-session": "^1.17.3",
                "mongoose": "^7.6.0",
                "pug": "^3.0.2"
        },
        "devDependencies": {
                "autoprefixer": "^10.4.16",
                "concurrently": "^8.2.1",
                "connect-livereload": "^0.6.1",
                "livereload": "^0.9.3",
                "nodemon": "^3.0.1",
                "postcss": "^8.4.31",
                "tailwindcss": "^3.3.3"
        }
}

```


#### Creating Project with browser reload

```
const path = require('path')
const express = require('express')

const livereload = require('livereload') 			// for reload browser
const connectLivereload = require('connect-livereload') 	// for reload browser
...

const publicDirectory = path.join(process.cwd(), 'public')

// for LiveReload
const livereloadServer = livereload.createServer() 		// for reload browser
livereloadServer.watch(publicDirectory)
livereloadServer.server.once('connection', () => {
	setTimeout(() => livereloadServer.refresh('/') , 10);
})


const app = express()
...
app.use(express.static(publicDirectory))
app.use(connectLivereload()) 				// for reload browser
...
```

#### MongoDB Database wiht mongoose
- Step-1: Creating Connection function

``` /models/dbConnect.js:

const { connect, connection } = require('mongoose')

const { NODE_ENV, DB_LOCAL_URL, DB_REMOTE_URL } = process.env || {}
const DATABASE = NODE_ENV === 'production' ? DB_REMOTE_URL : DB_LOCAL_URL

const dbConnect = async () => {
	try {
		if(connection.readyState >= 1) return
		const conn = await connect(DATABASE)	
		const { host, port, name } = conn.connection
		console.log(`---- Database connected to : [${host}:${port}/${name}]----` )

	} catch (err) {
		console.log(`database connection failed: ${err.message}`)
	}
}

module.exports = dbConnect
```

- Step-2: Connect database with App

``` /server.js:

require('dotenv').config()
const app = require('./app')

const dbConnect = require('./models/dbConnect')

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
	console.log(`server running on http://localhost:${PORT} - ${process.env.NODE_ENV}`)
	dbConnect()
})

```





#### Configure express-session
- Step-1: Set session as middleware
```
...
app.use(express.static(publicDirectory))
...

// Use after express.static() middleware and before templete engine
app.use(session({
	secret: process.env.SESSION_SECRET,
	resave: true,
	saveUninitialized: false,
	cookie: {
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'strict',
		maxAge: 1000*60*60*24*30 		// One month
	}
}))

app.set('view engine', 'pug') 				// Setup pug as Templete 
...
```

- Step-2: Add data to session object after login:

```
// POST /login
exports.loginPageHandler = async (req, res) => {
	try {
		const { email, password } = req.body

		const user = await User.findOne({ email })
		if(!user) throw new Error(`you are not registerted user, please register first`)
		if(user.password !== password) throw new Error(`Your password is incorrect`)

		req.session.user = user
		res.redirect('/')

	} catch (err) {
		const payload = {
			pageTitle: 'Login',
			...req.body,
			errorMessage: err.message,
		}

		res.render('login', payload)
	}
}
```

- Step-3: Protect any route: 

``` /controllers/authController.js:

exports.protect = (req, res, next) => {
	if(req.session.user ) return next()

	res.redirect('login')
}
```

``` /routes/pageRoutes.js:

const { Router } = require('express')
const authController = require('../controllers/authController')
...

const router = Router()

router.get('/', authController.protect, pageController.homePage)
```

``` /app.js:
...
const pageRouter = require('./routes/pageRoutes')
...
app.use('/', pageRouter)
...
```

- Step-4: Destroy session to logout: seperate route:


``` /controllsers/pageController.js:
...
exports.logout = (req, res) => {
	req.session.destroy(err => {
		if(err) return console.log(`error: ${err.message}`)
	})

	const payload = { pageTitle: 'Login' }
	res.render('login', payload)
}
```
 