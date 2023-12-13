const path = require('path')
const User = require('../models/userModel')  
const Notification = require('../models/notificationModel')  
const { removeFile, apiFeatures } = require('../utils')
const { catchAsync, appError } = require('./errorController')



// GET /api/users
exports.getAllUsers = catchAsync(async (req, res, next) => {
	// const filter = {}

	// if( req.query.search ) {
	// 	filter.search = {
	// 		$or: [
	// 			{ firstName: { $regex: req.query.search, $options: 'i' }},
	// 			{ lastName: { $regex: req.query.search, $options: 'i' }},
	// 			{ username: { $regex: req.query.search, $options: 'i' }},
	// 		]
	// 	}
	// }

	// const users = await User.find({})
	const users = await apiFeatures(User, req.query)

	res.status(200).json({
		status: 'success',
		count: users.length,
		data: users
	})
})





// PATCH /api/users/:id/following 	(with protect middleware)
exports.following = catchAsync(async (req, res, next) => {
	
	const profileUserId = req.params.id
	const profileUser = await User.findById(profileUserId)
	if(!profileUser) return next(appError('profile user not found by name'))

	const logedInUser = req.session.user
	const userId = logedInUser._id

	const isFollowing = profileUser.followers?.includes(logedInUser._id) 
	const operator = isFollowing ? '$pull' : '$addToSet'


	// Step-1: add profileUser._id to following array of logedInUser
	const updatedUser = await User.findByIdAndUpdate(logedInUser._id, { [operator]: { following: profileUserId }}, { new: true })
	req.session.user = updatedUser 

	// Step-2: add logedInUser._id to followers array of profileUser
	const updatedProfileUser = await User.findByIdAndUpdate(profileUserId, { [operator]: { followers: logedInUser._id }} )
	
	if( !isFollowing ) {
		await Notification.insertNotification({
			entityId: updatedUser._id, 						// on which notification user following ?
			userFrom: userId, 											// Who following it ?
			userTo: updatedUser.following.find(userId => userId === userId),		// tweet.user._id, 	// which user create this tweet ?
			type: 'follow', 												// ['like', 'retweet', 'replyTo', 'follow']
			kind: 'user', 													// ['tweet', 'message', 'user' ]
		})
	}
	
	res.status(201).json({
		status: 'success',
		// data: updatedUser
		data: updatedProfileUser
	})
})


// POST /api/users/avatar 		+ protect + upload.single('avatar')
exports.userAvatarUpload = async(req, res, next) => {
	try {
		const userId = req.session.user._id

		// remove project path:
		const publicUrl = req.file.path.slice( process.cwd().length ) 	// start from length to end of string

		// Remove existing picture after user updated, else removed the old user
		removeFile(req.session.user.avatar)

		const user = await User.findByIdAndUpdate(userId, { avatar: publicUrl }, { new: true, validate: true })
		if(!user) return next(appError('update avatar failed'))

		// if user modified then update session, so that logedInUser has updated data
		req.session.user = user
		
		res.status(201).json({
			status: 'success',
			data: user
		})
	} catch (err) {
		// const publicUrl = req.file.path.slice( process.cwd().length ) 	// start from length to end of string
		// removeFile(publicUrl)
		next( appError(err.message)	)
	}
}

/* 	GET /upload/users/:avatar
		When create any route rather than static route (like above we upload avatar) that
		route not be accessable via client. So we have to create another route as though 
		image ask for another request to server, like 3rd party image or files does.  */
exports.userAvatarRoute = (req, res, next) => {
	try {
		const avatar = req.params.avatar
		const file = path.join( process.cwd(), 'upload', 'users', avatar)
		res.sendFile(file)
		
	} catch (err) {
		next(appError(err.message))		
	}
}


// POST /api/users/coverPhoto 		+ protect + upload.single('coverPhoto')
exports.userCoverPhotoUpload = async(req, res, next) => {
	try {
		if(!req.file) return next(appError('req.file is empty'))

		const logedInUser = req.session.user
		const userId = logedInUser._id


		// remove project path:
		const publicUrl = req.file.path.slice( process.cwd().length ) 	// start from length to end of string

		// // Remove existing picture after user updated, else removed the old user
		if(logedInUser.coverPhoto) removeFile(logedInUser.coverPhoto)

		const updatedUser = await User.findByIdAndUpdate(userId, { coverPhoto: publicUrl }, { new: true, validate: true })
		if(!updatedUser) return next(appError('update coverPhoto failed'))

		// if user modified then update session, so that logedInUser has updated data
		req.session.user = updatedUser
		
		res.status(201).json({
			status: 'success',
			data: updatedUser
		})
	} catch (err) {
		// const publicUrl = req.file.path.slice( process.cwd().length ) 	// start from length to end of string
		// removeFile(publicUrl)
		next( appError(err.message)	)
	}
}



