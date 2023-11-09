const path = require('path')
const User = require('../models/userModel')  
const { removeFile } = require('../utils')
const { catchAsync, appError } = require('./errorController')

// PATCH /api/users/:id/following 	(with protect middleware)
exports.following = catchAsync(async (req, res, next) => {
	
	const profileUserId = req.params.id
	const profileUser = await User.findById(profileUserId)
	if(!profileUser) return next(appError('profile user not found by name'))

	const logedInUser = req.session.user

	const isFollowing = profileUser.followers?.includes(logedInUser._id) 
	const operator = isFollowing ? '$pull' : '$addToSet'


	// Step-1: add profileUser._id to following array of logedInUser
	req.session.user = await User.findByIdAndUpdate(logedInUser._id, { [operator]: { following: profileUserId }}, { new: true })

	// Step-2: add logedInUser._id to followers array of profileUser
	await User.findByIdAndUpdate(profileUserId, { [operator]: { followers: logedInUser._id }} )
	
	res.status(201).json({
		status: 'success',
		data: req.session.user
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