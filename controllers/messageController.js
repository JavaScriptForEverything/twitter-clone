const { isValidObjectId, Types } = require('mongoose')
const { filterObjectByArray, apiFeatures } = require('../utils')
const { appError, catchAsync } = require('./errorController')
const Message = require('../models/messageModal')
const Chat = require('../models/chatModel')
const User = require('../models/userModel')
const Notification = require('../models/notificationModel')


// GET /api/messages
// GET /api/chats/:chatId/messages
exports.getAllMessages = catchAsync( async (req, res, next) => {
	const chatId = req.params.chatId
	const filter = {}
	// if(chatId) filter.chat = chatId

	let messages = await apiFeatures(Message, req.query, filter)

	res.status(201).json({
		status: 'success',
		count: messages.length,
		data: messages
	})
})


// 
exports.getAllMessagesOfSingleUser = catchAsync( async (req, res, next) => {
	const userId = req.params.userId

	let messages = await Message.find({ chat: new Types.ObjectId(userId) })

	res.status(201).json({
		status: 'success',
		count: messages.length,
		data: messages
	})
})



// POST /api/messages
exports.createMessage = catchAsync( async (req, res, next) => {
	/* req.body:
			{
				message: 'aa',
				sender: '65722b62c3fca2503dc7c793', 			// logedInUser._id
				chat: '655e019f890666a9ec090931' 					// chat._id  || user._id of private chat
			}
			chatId == chat._id || userId
				1. if chatId === chatId 			: 
				2. if chatId === userId 			: */

	// console.log(req.body)

	// return res.json({
	// 	status: 'success',
	// 	data: req.body
	// })





	const allowedFields = ['message', 'chat', 'sender']
	const filteredBody = filterObjectByArray(req.body, allowedFields)

	if( !isValidObjectId(filteredBody.chat) ) return next(appError('chat is not valid ObjectId'))
	if( !isValidObjectId(filteredBody.sender) ) return next(appError('sender is not valid ObjectId'))

	const chatId = filteredBody.chat
	const senderId = filteredBody.sender

	let messageDoc = await Message.create( filteredBody )
			messageDoc = await messageDoc.populate('sender')
			messageDoc = await messageDoc.populate('chat') 		// if chat === userId 	=> populate null
			await User.populate(messageDoc, 'chat.users') 		// null.users 					=> null


			// await User.populate(message, 'chat.users')
			// // 1. `chat` is available in Message Schema, so it populate from Message.Query.populate()
			// // 2. and in Chat schem has `users` property, so we have 2 ways
			// // 		a) populate from Chat Query or
			// // 		b) populate from User Model, 	: here used the user model
	if(!messageDoc) return next( appError('create messae is failed') )

	// Step-1: if user already exists then return that
	let chat = await Chat.findOne({ _id: chatId, users: { $elemMatch: { $eq: senderId }} })
	.populate('users')

	if(chat && messageDoc) {
		chat.latestMessage = messageDoc._id
		chat.isOpened = false
		await chat.save()
	}


	// Step-2: if user not exists then create one and return that
	if(!chat) {
		// that means chatId is not chatId it is userId for user-to-user chat
		const userId = chatId
		const foundUser = await User.findById( userId )
		if( !foundUser ) return next(appError('User not found by current chat.'))

		// also populate('users) here
		chat = await getChatByUsersId(userId, senderId)

		chat.latestMessage = messageDoc._id
		chat.isOpened = false
		await chat.save()
	}


	// // finally send notification to users
	// insertNotification(messageDoc, chat, next)


	res.status(201).json({
		status: 'success',
		data: messageDoc,
	})
})

// used in POST /api/messages above: if( !chat ) { ... }
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


// used in POST /api/messages above
const insertNotification = (message, chat, next) => {
	// if same user send more than one notification then it will delete old one and create new one 

	chat.users.forEach( async (user) => {
		if(!user.id) return next( appError('POST /api/messages: chat.users not populated'))
		if(!message.sender.id) return next( appError('POST /api/messages: message.sender not populated'))

		// if( user._id.toString() === message.sender._id.toString() ) return 		// don't nofity self
		if( user.id === message.sender.id ) return 		// don't nofity self

		await Notification.insertNotification({
			entityId: message.chat._id, 						// on which message it will triggered
			userFrom: user._id, 										// Who message it ?
			userTo: message.sender._id, 						// which user create this tweet ?
			type: 'new-message', 										// ['like', 'retweet', 'replyTo', 'follow', 'new-message']
			kind: 'message', 												// ['user', 'tweet', 'message' ]
		})
	})
}



// DELETE 	/api/messages/:userId
exports.deleteAllMessagesByUserId = catchAsync(async (req, res, next) => {
	const userId = req.params.userId

	const chat = await Chat.findOne({ 
		isGroup: false,
		users: {
			$size: 2,
			$all : { $elemMatch: { $eq: new Types.ObjectId(userId) } } 
		}
	})
	if(!chat) return next(appError('Sorry it is not a group chat, it is private chat'))

	const messages = await Message.deleteMany({ sender: userId })
	console.log({ length: messages.length })

	res.status(200).json({
		status: 'success',
		data: null
	})
})