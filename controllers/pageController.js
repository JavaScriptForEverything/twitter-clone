const User = require('../models/userModel')
const authController = require('./authController')


// GET /
// exports.homePage = authController.requireLogin, (req, res, next) => {
exports.homePage = (req, res, next) => {

	const payload = {
		pageTitle: 'Home'
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
	try {
		// throw new Error('do not have avatar')
		const user = await User.create( req.body )
		if(!user) throw new Error(`user nor found`)

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


exports.logout = (req, res) => {
	req.session.destroy(err => {
		if(err) return console.log(`error: ${err.message}`)
	})

	const payload = {
		pageTitle: 'Login',
	}
	res.render('login', payload)
}