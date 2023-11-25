const User = require('../models/userModel')
const authController = require('./authController')
const { timeSince } = require('../utils')


// GET /
exports.homePage = (req, res, next) => {

	const payload = {
		pageTitle: 'Home',
		timeSince,
		user: req.session.user,
	}


	res.render('home', payload)
}


// GET /register
exports.registerPage = (req, res) => {
	const payload = {
		pageTitle: 'Register'
	}

	res.render('register', payload)
}

// POST /register
exports.registerPageHandler = async (req, res) => {

	// console.log(req.body)
	// return	res.render('register', { pageTitle: 'register' })
		


	try {
		// throw new Error('do not have avatar')
		const user = await User.create( req.body )
		if(!user) throw new Error(`user nor found`)

		res.redirect('/login')

	} catch (err) {
		
		const payload = {
			pageTitle: 'Register',
			...req.body,
			errorMessage: err.message,
		}

		res.render('register', payload)
	}
}



// Get /login
exports.loginPage = (req, res) => {
	const payload = {
		pageTitle: 'Login'
	}

	res.render('login', payload)
}


// POST /login
exports.loginPageHandler = async (req, res) => {
	try {
		const { email, password } = req.body
		if(!email || !password) throw new Error(`Requried email and password`)

		const user = await User.findOne({ email }).select('+password')
		if(!user) throw new Error(`you are not registerted user, please register first`)
		
		const isPasswordValid = await user.isPasswordValid(password, user.password)
		if(!isPasswordValid) throw new Error(`Your password is incorrect`)
		user.password = undefined 		// Don't send password to user

		req.session.user = user
		// res.redirect('/')

		res.redirect('/profile')
		// res.redirect('/docs')

		// res.redirect('/notification')
		// res.redirect('/message/new')
		// res.redirect('/message/655e019f890666a9ec090931')

	} catch (err) {
		const payload = {
			pageTitle: 'Login',
			...req.body,
			errorMessage: err.message,
		}

		res.render('login', payload)
		
	}
}

// GET /logout
exports.logout = (req, res) => {
	req.session.destroy(err => {
		if(err) return console.log(`error: ${err.message}`)
	})

	const payload = {
		pageTitle: 'Login',
	}
	res.render('login', payload)
}




// GET /testing
exports.testing = (req, res) => {
	const payload = {
		pageTitle: 'Testing',
	}
	res.render('_testing', payload)
}
