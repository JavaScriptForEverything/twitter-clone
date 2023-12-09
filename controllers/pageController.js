const { isValidObjectId } = require('mongoose')
const { timeSince } = require('../utils')
const { appError } = require('./errorController')
const User = require('../models/userModel')
const Chat = require('../models/chatModel')
// const Tweet = require('../models/tweetModel')
// const Notification = require('../models/notificationModel')

// GET /
exports.homePage = (req, res, next) => {

	const payload = {
		pageTitle: 'Home',
		timeSince,
		user: req.session.user,
		logedInUserJs: JSON.stringify(req.session.user)
	}


	res.render('page/home', payload)
}


// GET /register
exports.registerPage = (req, res) => {
	const payload = {
		pageTitle: 'Register'
	}

	res.render('./page/register', payload)
}

// POST /register
exports.registerPageHandler = async (req, res) => {
	// console.log(req.body)
	// return	res.render('register', { pageTitle: 'register' })

	try {
		// throw new Error('do not have avatar')
		const user = await User.create( req.body )
		if(!user) throw new Error(`user nor found`)

		res.redirect('./page/login')

	} catch (err) {
		
		const payload = {
			pageTitle: 'Register',
			...req.body,
			errorMessage: err.message,
		}

		res.render('./page/register', payload)
	}
}



// Get /login
exports.loginPage = (req, res) => {
	const payload = {
		pageTitle: 'Login'
	}

	res.render('./page/login', payload)
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

		// res.redirect('/profile')
		res.redirect('/profile/user1user')
		// res.redirect('/docs')
		// res.redirect('/notification')
		// res.redirect('/tweet/655e49891df7aefe26c80ddf')
		// res.redirect('message/65608f4ea47a8dfa30e846f7')

		// res.redirect('/message')
		// res.redirect('/message/new')

		// res.redirect('/testing')

	} catch (err) {
		const payload = {
			pageTitle: 'Login',
			...req.body,
			errorMessage: err.message,
		}

		res.render('./page/login', payload)
		
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
	res.render('./page/login', payload)
}


// GET /search 		+ protected
exports.searchPage = (req, res) => {
	const payload = {
		pageTitle: 'Search',
		logedInUser: req.session.user,
		logedInUserJs: JSON.stringify(req.session.user),
	}

	res.render('./page/search', payload)
}

// GET /notification + protect
exports.notificationPage = async (req, res) => {
	const payload = {
		pageTitle: 'Notification',
		logedInUser: req.session.user,
		logedInUserJs: JSON.stringify(req.session.user),
	}

	res.render('./page/notification', payload)
}


// GET /message 	+ protect
exports.messageInboxPage = (req, res) => {

	const payload = {
		pageTitle: 'Inbox',
		logedInUser: req.session.user,
		logedInUserJs: JSON.stringify(req.session.user),
	}

	res.render('./page/message', payload)
}

// GET /message/:id 	id == chatId 		+ protect
exports.chatMessagePage = async (req, res) => {
	try {
		const chatId = req.params.id
		const logedInUserId = req.session.user._id

		const chat = await Chat.findOne({ 
			_id: chatId, 
			users: { $elemMatch: { $eq: logedInUserId }} 
		})

		const payload = {
			pageTitle: 'Chat',
			logedInUser: req.session.user,
			logedInUserJs: JSON.stringify(req.session.user),
			chat
		}

		res.render('./page/messageChat', payload)

	} catch (error) {
		const payload = {
			pageTitle: 'Chat',
			errorMessage: error.message
		}
		redirect('error', payload)
	}
}

// GET /message/new 	+ protect
exports.newMessageInboxPage = (req, res) => {

	const payload = {
		pageTitle: 'New Message',
		logedInUser: req.session.user,
		logedInUserJs: JSON.stringify(req.session.user),
	}

	res.render('./page/messageNew', payload)
}



// GET /profile 				: self-profile 
// GET /profile/${id}  	: Other users profile
exports.profilePage = async (req, res, next) => {
	try {
		const logedInUser = req.session.user
		const userId = req.params.id
		const filter = userId ? { username: userId } : { _id: logedInUser._id, }  

		const profileUser = await User.findOne( filter )
		if(!profileUser) return next(appError('profile user not found'))

		const payload = {
			pageTitle: `${profileUser.firstName} ${profileUser.lastName} Profile`,
			logedInUser,
			profileUser,
			logedInUserJs: JSON.stringify(logedInUser),
			profileUserJs: JSON.stringify(profileUser),
			timeSince
		}

		res.render('./page/profile', payload)
		
	} catch (err) {
		console.log(err)
		res.render('./page/notFound')	
	}
}



// GET 	/profile/:id/following  	+ 	GET /profile/:id/followers
exports.followingAndFollwers = async (req, res, next) => {
	try {
		const username = req.params.id
		
		const profileUser = await User.findOne({ username }).populate('following followers')
		if(!profileUser) return next(appError('profile user not found'))

		const payload = {
			pageTitle: 'following-and-followers',
			username,
			logedInUser: req.session.user,
			profileUser,
			logedInUserJs: JSON.stringify(req.session.user),
			profileUserJs: JSON.stringify(profileUser),
		}

		res.render(`./page/follow`, payload)

	} catch (err) {
		const payload = {
			errorMessage: err.message
		}
		res.render('./page/error', payload)	
	}
}





// GET /tweets/${tweetId}
exports.tweetDetailsPage = async(req, res, next) => {
	try {
		const tweetId = req.params.id
		const isValidTweetId = isValidObjectId(tweetId)
		if(!isValidTweetId) throw new Error('tweetId is invalid')

		const payload = {
			pageTitle: 'Tweet Details',
			tweetId,
			timeSince,
			logedInUser: req.session.user,
			logedInUserJs: JSON.stringify(req.session.user),
		}

		res.render('./page/tweetDetails', payload)

	} catch (error) {
		const payload = {
			pageTitle: 'Error',
			errorMessage: error.message
		}
		
		res.render('./page/error', payload)
	}
}

// GET /testing
exports.testing = (req, res) => {
	const payload = {
		pageTitle: 'Testing',
	}
	res.render('_testing', payload)
}
