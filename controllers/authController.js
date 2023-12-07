const Tweet = require('../models/tweetModel')
const User = require('../models/userModel')
const Chat = require('../models/chatModel')
const Notification = require('../models/notificationModel')
const { appError } = require('./errorController')
const { timeSince, filterObjectByArray } = require('../utils')
const { isValidObjectId } = require('mongoose')


exports.protect = (req, res, next) => {
	if(req.originalUrl.startsWith('/api')) return next()

	if(req.session?.user ) return next()
	res.redirect('/login')
	// next()
}



// // POST 	/api/users/login
// exports.login = async (req, res, next) => {
// 	const allowedFields = ['email', 'password']
// 	const filteredBody = filterObjectByArray(req.body, allowedFields)

// 	const { email, password } = filteredBody
// 	if(!email || !password) throw new Error(`Requried email and password`)

// 	const user = await User.findOne({ email }).select('+password')
// 	if(!user) throw new Error(`you are not registerted user, please register first`)
	
// 	const isPasswordValid = await user.isPasswordValid(password, user.password)
// 	if(!isPasswordValid) throw new Error(`Your password is incorrect`)
// 	user.password = undefined 		// Don't send password to user

// 	// req.session.user = user
// 	req.user = user
// 	console.log('login: ', user._id, req.user._id)

// 	res.status(201).json({
// 		status: 'success',
// 		token: 'alsdjfasldjfalskdjfasldfj',
// 		// data: user
// 	})	
// }








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
			timeSince
		}

		res.render('user/profile', payload)
		
	} catch (err) {
		console.log(err)
		res.render('notFound')	
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
			profileUser
		}

		res.render(`user/profile/following-and-followers`, payload)

	} catch (err) {
		const payload = {
			errorMessage: err.message
		}
		res.render('error', payload)	
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
		}

		res.render('tweet/tweetDetails', payload)

	} catch (error) {
		const payload = {
			pageTitle: 'Error',
			errorMessage: error.message
		}
		
		res.render('error', payload)
	}
}


// GET /search
exports.searchPage = (req, res) => {
	const payload = {
		pageTitle: 'Search',
		logedInUser: req.session.user,
	}

	res.render('user/profile/search-user-and-tweet', payload)
}


// GET /message
exports.messageInboxPage = (req, res) => {

	const payload = {
		pageTitle: 'Inbox',
		logedInUser: req.session.user,
	}

	res.render('message/inbox', payload)
}

// GET /message/:id 	id == chatId
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
			chat
		}

		res.render('message/chat', payload)

	} catch (error) {
		const payload = {
			pageTitle: 'Chat',
			errorMessage: error.message
		}
		redirect('error', payload)
	}
}

// GET /message/new
exports.newMessageInboxPage = (req, res) => {

	const payload = {
		pageTitle: 'New Message',
		logedInUser: req.session.user,
	}

	res.render('message/new', payload)
}


// GET /notification
exports.notificationPage = async (req, res) => {
	try {
		const notifications = await Notification.find({ userFrom: req.session.user._id })
		if(!notifications) throw new Error('no nitifications found')

		const payload = {
			pageTitle: 'Notification',
			logedInUser: req.session.user,
			notifications
		}

		res.render('notification', payload)

	} catch (error) {
		const payload = {
			pageTitle: 'Notification',
			logedInUser: req.session.user,
			errorMessage: error.message
		}
		res.render('notification', payload)
	}
}