const User = require('../models/userModel')
const authController = require('./authController')


// GET /
// exports.homePage = authController.requireLogin, (req, res, next) => {
exports.homePage = (req, res, next) => {
	const payload = {
		pageTitle: 'Home'
	}

	// console.log(req.session.user)

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
	try {
		// throw new Error('do not have avatar')
		const user = await User.create( req.body )
		console.log(user)

		res.redirect('login')

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
		const payload = {
			pageTitle: 'Login',
		}
		const user = await User.findOne({ email: req.body.email })
		if(!user) throw new Error(`user not found, please register first`)

		req.session.user = user
		// console.log(user)

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