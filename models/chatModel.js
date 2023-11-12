const { Schema, model, models } = require('mongoose')

const chatSchema = new Schema({

	name: { type: String, trim: true },
	isGroup: { type: Boolean, default: false },
	users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
	latestMessage: { type: Schema.Types.ObjectId, ref: 'Message' }, 	// not created yet

}, { timestamps: true })

module.exports = models.Chat || model('Chat', chatSchema)