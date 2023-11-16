const { Router } = require('express')
const messageController = require('../controllers/messageController')

// /api/messages
const router = Router({ mergeParams: true })

router
	.get('/', messageController.getAllMessages)
	.post('/', messageController.createMessage)

module.exports = router