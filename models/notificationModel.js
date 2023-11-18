const { Schema, models, model } = require('mongoose')

const notificationSchema = new Schema({
	userFrom: { type: Schema.Types.ObjectId, ref: 'User' }, 		// (Fixed ref)
	userTo: { type: Schema.Types.ObjectId, ref: 'User' },
	
	// redirectTo: 	to generate redirectTo url, or we can send directly
	notificationType: String, 				// [ 'User', 'Chat', 'Tweet', ... ] 		: Model Names
	entityId: Schema.Types.ObjectId, 	// (Dynamic ref):	ref: notificationType : Populate dynamically to redirect to details by Id 

	// isVisited ? 'text-slate-200' : 'text-blue-200
	isOpend: { type: Boolean, default: false }

}, { timestamps: true })


// const notification = await Notification.insertNotification({ fromUser, userTo, notificationType, entityId })
/* 
POST /api/users/:id/follow

	if( !following ) = await Notification.insertNotification({ 
		fromUser 				: req.session.user._id, 
		userTo 					: req.params.id, 
		notificationType: 'follow', 
		entityId 				: req.session.user._id,
	})


POST /api/tweets/ 	: self post or replyTo the post

	if( !following ) = await Notification.insertNotification({ 
		fromUser 				: req.session.user._id, 
		userTo 					: updatedTweet.replyTo.postBy._id, 				// Tweet.populat(updatedPost, 'replyTo' )
		notificationType: 'replyTo', 
		entityId 				: updatedPost._id,
	})


PATCH /api/tweets/:id/retweet

	if( !deleteTweet ) = await Notification.insertNotification({ 
		fromUser 				: req.session.user._id, 
		userTo 					: tweet.user._id, 							// post.postedBy._id
		notificationType: 'retweet', 
		entityId 				: tweet._id, 										// post._id
	})


PATCH /api/tweets/:id/like

	if( !isLiked ) = await Notification.insertNotification({ 
		fromUser 				: req.session.user._id, 
		userTo 					: tweet.user._id, 							// post.postedBy._id
		notificationType: 'postLike', 
		entityId 				: tweet._id, 										// post._id
	})


POST /api/messages/

	let messageDoc = await Message.create( req.body )
			messageDoc.pupulate('sender')
			messageDoc.pupulate('chat')
		messageDoc = await User.pupulate(messageDoc, 'chat.users')

	const chatDoc = await chat.findByIdAndUpdate(req.body.chatId, { latestMessage: messageDoc._id })

	chatDoc.users.forEach( userId => {
		if( userId === message.sender._id.toString() ) return 		// don't send message to self
	})

	await Notification.insertNotification({ 
		fromUser 				: messageDoc.sender._id, 
		userTo 					: req.body.user._id, 						
		notificationType: 'newMessage', 
		entityId 				: messageDoc.chat._id, 									
	})


*/

notificationSchema.statics.insertNotification = async function ( data ) {
	await this.deleteOne(data)
	return await this.create(data)
}

module.exports = models.Notification || model('Notification', notificationSchema)