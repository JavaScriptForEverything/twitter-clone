const User = require('../models/userModel')  
const { catchAsync, appError } = require('./errorController')

// PATCH /api/users/:id/following + protect
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