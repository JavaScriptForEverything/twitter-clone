const Notification = require('../models/notificationModel')
const { filterObjectByArray, apiFeatures } = require('../utils')
const { catchAsync, appError } = require('./errorController')

// GET 	/api/notifications
exports.getAllNotifications = catchAsync(async (req, res, next) => {
	const notifications = await apiFeatures(Notification, req.query)
	if(!notifications) return next(appError('notification update failed'))

	setTimeout(() => {

	res.status(201).json({
		status: 'success',
		count: notifications.length,
		data: notifications
	})
	}, 500)
})


// PATCH 	/api/notifications
exports.updateAllNotifications = catchAsync(async (req, res, next) => {
	const userId = req.session.user._id

	const notifications = await Notification.updateMany(
		{ userTo: userId },
		{ isOpened: true }
	)
	if(!notifications) return next(appError('notification update failed'))


	res.status(201).json({
		status: 'success',
		data: notifications
	})
})





// PATCH 	/api/notifications/:id
exports.update = catchAsync(async (req, res, next) => {
	const notificationId = req.params.id

	const allowedFields = ['isOpened']
	const filteredBody = filterObjectByArray(req.body, allowedFields)

	const notification = await Notification.findByIdAndUpdate(notificationId, filteredBody, { new: true })
	if(!notification) return next(appError('notification update failed'))

	res.status(201).json({
		status: 'success',
		data: notification
	})
})


// DELETE 	/api/notifications/:id
exports.deleteById = catchAsync(async (req, res, next) => {
	const notificationId = req.params.id


	const notification = await Notification.findByIdAndDelete(notificationId)
	if(!notification) return next(appError('notification deletation failed'))

	res.status(201).json({
		status: 'success',
		data: notification
	})
})