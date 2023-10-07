const { Router } = require('express')
const userController = require('../controllers/userController')

const router = Router()

router.route('/')
	.post(userController.register)


module.exports = router