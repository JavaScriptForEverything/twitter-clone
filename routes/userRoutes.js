const { Router } = require('express')
const userController = require('../controllers/userController')
const authController = require('../controllers/authController')


const router = Router()

router
	.use(authController.protect)
	.patch('/:id/following', userController.following)

module.exports = router