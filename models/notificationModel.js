const { Schema, models, model } = require('mongoose')

/* Show notification when user:

		. follow user
		. replyTo a tweet
		. retweet a tweet
		. like a tweet

*/



			// notificationType: 'Tweet', 							// notification for 'tweet
			// entityId: updatedTweet._id, 						// on which notification user liked ?
			// userFrom: userId, 											// Who liked it ?
			// userTo: updatedTweet.user._id, 					// this tweet created by whom ?

/*
{
	entityId: '',
	userFrom: '',
	userTo: '',
	type: 'like', 			// ['like', 'retweet', 'replyTo', 'follow']
	kind: 'tweet', 			// ['tweet', 'message' ]
	isOpened: false
}

*/


const notificationSchema = new Schema({
	entityId: {
		type: Schema.Types.ObjectId, 								// On which task notification applied on
		required: true,
	},
	userFrom: { 
		type: Schema.Types.ObjectId, 								// Who create notification
		ref: 'User',
		required: true
	}, 		
	userTo: { 
		type: Schema.Types.ObjectId, 								// on which user's task notification apploed on
		ref: 'User',
		required: true
	}, 			
	
	type: { 																			// for which task this notification this
		type: String,
		enum: ['like', 'retweet', 'replyTo', 'follow'],
		required: true,
	},

	kind: { 																			// what kind of notification is this
		type: String,
		enum: ['user', 'tweet', 'message' ],
		required: true,
	},

	isOpened: {  																	// To check it notification clicked: seen or unseen
		type: Boolean, 
		default: false 
	}

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

	if( !isLiked ) { 														// Show notification only when liked, skip unlike senerio
		await Notification.insertNotification({
			notificationType: 'Tweet', 							// notification for 'tweet
			entityId: updatedTweet._id, 						// on which notification user liked ?
			userFrom: userId, 											// Who liked it ?
			userTo: updatedTweet.user._id, 					// this tweet created by whom ?
		})
	}


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
	// const { userFrom, userTo, notificationType, entityId } = data

	await this.deleteOne(data) 				// if all 4 argument matched then delete that before clreate one
	return this.create(data)
}

notificationSchema.pre(/^find/, function(next) {
	this.populate('userFrom userTo')

	next()
})
module.exports = models.Notification || model('Notification', notificationSchema)