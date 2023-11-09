const path = require('path')
const multer = require('multer')
const { appError } = require('../controllers/errorController')


exports.profilePicture = multer({
	storage: multer.diskStorage({
		destination: path.join( process.cwd(), 'upload/users' ),
		filename: (req, file, callback) => {
			const userId = req.session.user._id
			const ext = file.mimetype.split('/').pop()
			const filename = `${file.fieldname}-${userId}-${Date.now()}.${ext}`

			callback(null, filename)
		}
	}),
	fileFilter: (req, file, callback) => {
		if( !file.mimetype.match('image/*') ) callback(appError('please inser image file'), false)
		callback(null, true)
	}
	
})