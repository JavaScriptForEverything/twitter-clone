const Chat = require('../models/chatModel')
const { catchAsync, appError } = require('./errorController')

exports.createChat = catchAsync( async (req, res, next) => {
	if(!req.body.length) return next(appError('please send user._id as array '))
	
	const userIds = [ ...req.body, req.session.user._id ]
	const body = { users: userIds, isGroup: true }

	const chat = await Chat.create( body )

	res.status(201).json({
		status: 'success',
		data: chat
	})
})
