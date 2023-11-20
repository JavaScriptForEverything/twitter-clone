const { Schema, model, models } = require('mongoose')

const messageSchema = new Schema({

	message: { type: String, trim: true }, 									// => content
	sender: { type: Schema.Types.ObjectId, ref: 'User' },
	chat: { type: Schema.Types.ObjectId, ref: 'Chat' }, 		// Group Chat Id
	users: [{ type: Schema.Types.ObjectId, ref: 'User' }], 	// => readBy

}, { timestamps: true })

messageSchema.pre(/^find/, function(next) {
	this.populate('chat sender')
	next()
})

module.exports = models.Message || model('Message', messageSchema)