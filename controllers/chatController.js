const { isValidObjectId, Types } = require('mongoose')
const { catchAsync, appError } = require('./errorController')
const Chat = require('../models/chatModel')
const { filterObjectByArray, apiFeatures } = require('../utils')
const Message = require('../models/messageModal')



// GET 	/api/chats/ 	+ protected
exports.getAllChats = catchAsync( async (req, res, next) => {
	const userId = req.session.user._id

	// Shows all chat's of current user
	const filter = { users: { $elemMatch: { $eq: userId }} }

	// // Shows all chat of Group Users
	// const filter = { 
	// 	isGroup: true, 									// Only show group chat
	// 	users: { 
	// 		$elemMatch: { $eq: userId } 	// of currentUser
	// 	} 
	// }
	const chats = await apiFeatures(Chat, req.query, filter).populate('users latestMessage') 	

	// // Find which users has logedIn user._id ==> Find Group of user self exists
	// const chats = await Chat.find({ users: { $elemMatch: { $eq: userId }} })
	// 	.sort('createdAt: -1')
	// 	.populate('users latestMessage') 								// direct property

	await Message.populate(chats, 'latestMessage.sender') 	// populated by others, then get sender

	res.status(200).json({
		status: 'success',
		count: chats.length,
		data: chats
	})
})


// GET 	/api/chats/:id 	+ protected
exports.getChatById = catchAsync( async (req, res, next) => {

	const chatId = req.params.id
	const logedInUserId = req.session.user._id
	
	if( !isValidObjectId(chatId) ) return next(appError('invalid id'))

	// handle group chat by chatId 
	const groupChat = await Chat.findOne({ 
		_id: chatId, 
		users: { $elemMatch: { $eq: logedInUserId }}
	}).populate('users')

	if(!groupChat) {
		/* if groupChat not exists, then it must be user-to-user single chat
				and the chat id will be userid instead: [ chatId === userId ]

				if logedInUser already have created chat with same user that
				find that chat, else create new user to user chat

				instead of creating 2 condition we can solve that by mongoDB
				update method with `upsert` keywork, which will create if update failed
		*/
		const otherUserId = chatId
		const userChat = await Chat.findOneAndUpdate({
			isGroup: false,
			users: {
				$size: 2,
				$all: [
					{ $elemMatch: { $eq: new Types.ObjectId( logedInUserId ) } },
					{ $elemMatch: { $eq: new Types.ObjectId( otherUserId ) } },
				]
			}
		},
		{
			$setOnInsert: {
				users: [ logedInUserId, otherUserId ]
			}
		}, {
			new: true, 				// return new modified doc
			upsert: true 			// Allow to create if not exists
		})
		.populate('users') 	// 

		return res.status(200).json({
			status: 'success',
			data: userChat
		})

	}

	res.status(200).json({
		status: 'success',
		data: groupChat
	})
})


// POST 	/api/chats 	+ protected
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




// PATCH 	/api/chats/:id 	+ protected
exports.updateChatById = catchAsync( async (req, res, next) => {
	const chatId = req.params.id
	if( !isValidObjectId(chatId) ) return next(appError('invalid id'))

	const filteredBody = filterObjectByArray(req.body, ['name', 'isGroup'] )
	const groupChat = await Chat.findByIdAndUpdate( chatId, filteredBody, { new: true } )

	res.status(200).json({
		status: 'success',
		data: groupChat
	})
})


// DELETE 	/api/chats/:id 	+ protected
exports.deleteChatById = catchAsync( async(req, res, next) => {
	const chatId = req.params.id
	if( !isValidObjectId(chatId) ) return next(appError('invalid chatId'))

	const groupChat = await Chat.findByIdAndDelete( chatId )
	await Message.deleteMany({ chat: new Types.ObjectId(chatId) }) 	// must be awaited
		// => Only delete group chat's messages, not user-to-user messages

	res.status(200).json({
		status: 'success',
		data: groupChat
	})
})