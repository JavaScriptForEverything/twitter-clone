const { Router } = require('express')
const authController = require('../controllers/authController')
const notificationController = require('../controllers/notificationController')


//=> /api/notifications
const router = Router()

	router
		.use(authController.protect)
		.get('/', notificationController.getAllNotifications)
		.patch('/:id', notificationController.update)
		.delete('/:id', notificationController.deleteById)

module.exports = router