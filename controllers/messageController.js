const { isValidObjectId } = require('mongoose')
const { filterObjectByArray, apiFeatures } = require('../utils')
const { appError, catchAsync } = require('./errorController')
const Message = require('../models/messageModal')
const Chat = require('../models/chatModel')


// GET /api/messages
// GET /api/chats/:chatId/messages
exports.getAllMessages = catchAsync( async (req, res, next) => {
	const chatId = req.params.chatId
	const filter = {}
	if(chatId) filter.chat = chatId
	
	let messages = await apiFeatures(Message, req.query, filter)

	res.status(201).json({
		status: 'success',
		count: messages.length,
		data: messages
	})
})




// POST /api/messages
exports.createMessage = catchAsync( async (req, res, next) => {

	const allowedFields = ['message', 'chat', 'sender']
	const filteredBody = filterObjectByArray(req.body, allowedFields)

	// console.log(filteredBody)

	if( !isValidObjectId(filteredBody.chat) ) return next(appError('chat is not valid ObjectId'))
	if( !isValidObjectId(filteredBody.sender) ) return next(appError('sender is not valid ObjectId'))

	let message = await Message.create( filteredBody )
			message = await message.populate('sender')
			message = await message.populate('chat')

			// await User.populate(message, 'chat.users')
			// // 1. `chat` is available in Message Schema, so it populate from Message.Query.populate()
			// // 2. and in Chat schem has `users` property, so we have 2 ways
			// // 		a) populate from Chat Query or
			// // 		b) populate from User Model, 	: here used the user model


	if(!message) return next( appError('create messae is failed') )

	const chat = await Chat.findByIdAndUpdate(filteredBody.chat, { latestMessage: message._id })
	if(!chat) return next( appError('update chat.latestMessage is failed') )

	res.status(201).json({
		status: 'success',
		data: message
	})
})