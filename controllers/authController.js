const Tweet = require('../models/tweetModel')
const User = require('../models/userModel')
const Chat = require('../models/chatModel')
const { appError } = require('./errorController')
const { timeSince, filterObjectByArray } = require('../utils')


exports.protect = (req, res, next) => {
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








// GET /profile 		: self-profile 
exports.profilePage = (req, res, next) => {

	const user = req.session.user
	// const user = {
	// 	_id: '652ad9ce8faff3b8cf3ff261',
	// 	firstName: 'Riajul',
	// 	lastName: 'Islam',
	// 	username: 'riajulislam',
	// 	email: 'riaz@gmail.com',
	// 	avatar: '/images/users/default.jpg',
	// 	createdAt: '2023-10-14T18:11:26.896Z',
	// 	updatedAt: '2023-10-28T12:27:03.442Z',

	// 	tweets: [
	// 		{
	// 			user: {
	// 				_id: '652ad9ce8faff3b8cf3ff261',
	// 				firstName: 'Riajul',
	// 				lastName: 'Islam',
	// 				username: 'riajulislam',
	// 				email: 'riaz@gmail.com',
	// 				avatar: '/images/users/default.jpg',
	// 				createdAt: '2023-10-14T18:11:26.896Z',
	// 				updatedAt: '2023-10-28T12:27:03.442Z',
	// 			},
	// 			createdAt: '2023-10-14T18:11:26.896Z',
	// 		},
	// 	]
	// }


	const payload = {
		pageTitle: 'Profile',
		user,
		timeSince
	}

	res.render('user/profile', payload)
}


// GET /profile/${userId}  	: Other users profile
exports.userProfilePage = async (req, res, next) => {
	try {
		const username = req.params.id
		
		const profileUser = await User.findOne({ username })
		if(!profileUser) return next(appError('profile user not found'))

		const payload = {
			pageTitle: `${profileUser.firstName} ${profileUser.lastName} Profile`,
			username,
			logedInUser: req.session.user,
			profileUser
		}

		res.render(`user/userProfile`, payload)

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
		const isValidTweetId = true
		if(!isValidTweetId) console.log('redirect to 404 page: tweetId is not valied')

		const tweet = await Tweet.findById(tweetId).populate('replyTo')
		if(!tweet) throw new Error('Tweet not found')
		const user = await User.populate(tweet, 'user')
		await Tweet.populate(user, 'user.retweets')


		const payload = {
			pageTitle: 'Tweet Details',
			timeSince,
			user: req.session.user,
			tweet
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

// GET /message/:id
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
exports.notificationPage = (req, res) => {

	const payload = {
		pageTitle: 'Notification',
		logedInUser: req.session.user,
	}

	res.render('notification', payload)
}