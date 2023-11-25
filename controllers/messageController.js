const { isValidObjectId, Types } = require('mongoose')
const { filterObjectByArray, apiFeatures } = require('../utils')
const { appError, catchAsync } = require('./errorController')
const Message = require('../models/messageModal')
const Chat = require('../models/chatModel')
const User = require('../models/userModel')


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
	/* chat can be userId or chatId
			1. Chat Id handle bello way 	: ?
			2. userId handle bello way 		: ?  */
	const allowedFields = ['message', 'chat', 'sender']
	const filteredBody = filterObjectByArray(req.body, allowedFields)

	if( !isValidObjectId(filteredBody.chat) ) return next(appError('chat is not valid ObjectId'))
	if( !isValidObjectId(filteredBody.sender) ) return next(appError('sender is not valid ObjectId'))

	const chatId = filteredBody.chat
	const senderId = filteredBody.sender

	let messageDoc = await Message.create( filteredBody )
			messageDoc = await messageDoc.populate('sender')
			messageDoc = await messageDoc.populate('chat')

			// await User.populate(message, 'chat.users')
			// // 1. `chat` is available in Message Schema, so it populate from Message.Query.populate()
			// // 2. and in Chat schem has `users` property, so we have 2 ways
			// // 		a) populate from Chat Query or
			// // 		b) populate from User Model, 	: here used the user model
	if(!messageDoc) return next( appError('create messae is failed') )

	// Step-1: if user already exists then return that
	let chat = await Chat.findOne({ _id: chatId, users: { $elemMatch: { $eq: senderId }} }).populate('users')


	// Step-2: if user not exists then create one and return that
	if(!chat) {
		// that means chatId is not chatId it is userId for user-to-user chat
		const userId = chatId
		const foundUser = await User.findById( userId )
		if( !foundUser ) return next(appError('User not found by current chat.'))

		// also populate('users) here
		chat = await getChatByUsersId(userId, senderId)
	}



	// const chat = await Chat.findByIdAndUpdate(filteredBody.chat, { latestMessage: message._id }, { new: true })
	// if(!chat) return next( appError('update chat.latestMessage is failed') )

	res.status(201).json({
		status: 'success',
		data: messageDoc,
		// data: {
		// 	message: messageDoc,
		// 	chat
		// }
	})
})


const getChatByUsersId = (userId, senderId) => {
	return Chat.findOneAndUpdate(
		{
			isGroup: false, 														// Make sure not try to updateing group chat
			users: {
				$size: 2, 																// make sure only 2 users available
				$all: [ 																	// Make sure all query true
					{ $elemMatch: { $eq: new Types.ObjectId(userId) } },
					{ $elemMatch: { $eq: new Types.ObjectId(senderId) } }
				]
			}
		},
		{
			$setOnInsert: {
				users: [ userId, senderId ],
				new: true, 																// Return updated Doc instead of current doc
				upsert: true, 														// create current doc, if not exists, that we check on 1st block
			}
		}
	).populate('users') 														// finally populated users array
}