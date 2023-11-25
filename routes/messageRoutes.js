const { Router } = require('express')
const messageController = require('../controllers/messageController')
const authController = require('../controllers/authController')

// /api/messages
const router = Router({ mergeParams: true })

router
	.use(authController.protect)
	.get('/', messageController.getAllMessages)
	.post('/', messageController.createMessage)

module.exports = router