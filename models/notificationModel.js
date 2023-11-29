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


/*
// GET /api/tweets/:id/retweet
	...
	if(!deletedTweet) {
		await Notification.insertNotification({
			entityId: updatedTweet._id, 						// on which notification user liked ?
			userFrom: userId, 											// Who liked it ?
			userTo: updatedTweet.user._id, 					// which user create this tweet ?
			type: 'retweet', 												// ['like', 'retweet', 'replyTo', 'follow']
			kind: 'tweet', 													// ['tweet', 'message' ]
		})
	}
*/ 
notificationSchema.statics.insertNotification = async function ( data ) {
	await this.deleteOne(data) 				// if already exist one, then delete that before create new one
	return this.create(data)
}

notificationSchema.pre(/^find/, function(next) {
	this.populate('userFrom userTo')

	next()
})
module.exports = models.Notification || model('Notification', notificationSchema)