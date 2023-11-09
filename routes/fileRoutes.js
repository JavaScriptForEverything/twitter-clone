const { Router } = require('express')
const userControllder = require('../controllers/userController')

const router = Router()

router
	.get('/users/:avatar', userControllder.userAvatarRoute)


module.exports = router