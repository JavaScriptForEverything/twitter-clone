const { Schema, model, models } = require('mongoose')

const messageSchema = new Schema({

	message: { 									// => content
		type: String, 
		trim: true,
		required: true, 
	}, 
	sender: { 
		type: Schema.Types.ObjectId, 
		ref: 'User',
		required: true, 
	},
	chat: { 																								// for GroupChat 	: Chat._id
		type: Schema.Types.ObjectId, 
		ref: 'Chat',
		required: true, 
	}, 		
	users: [{ type: Schema.Types.ObjectId, ref: 'User' }], 	// => readBy

}, { timestamps: true })

messageSchema.pre(/^find/, function(next) {
	this.populate('chat sender')
	next()
})

module.exports = models.Message || model('Message', messageSchema)