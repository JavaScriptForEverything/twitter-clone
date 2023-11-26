module.exports = (io) => (socket) => {

	socket.on('setup', (logedInUser) => {
		socket.join(logedInUser._id)
		socket.emit('connected')
	})

	socket.on('join-room', ({ chatId: roomId }) => {
		socket.join(roomId)
		socket.emit('room-joined', { roomId })	
	})

	socket.on('typing', ({ chatId: roomId, message }) => {
		socket.to(roomId).emit('typing', { roomId })
	})

	socket.on('new-message', ({ chatId: roomId, messageDoc }) => {
		// if( !messageDoc.users.length ) return console.log('messageDoc.users not defined')

		// messageDoc.user.forEach( (user) => {
		// 	if( user._id === messageDoc.sender._id ) return 	// don't send message to self logedInUser
		// 	socket.to(user._id).emit('message-received', { roomId, messageDoc })
		// 		//=> We added every logedInUser to a room, on('setup') listener
		// 		//=> And now sending message to every user's parsonal room.
		// 		// On the client-side:
		// 		// 		1. if user in the chat page: /message/${messageDoc._id} add new chat 
		// 		// 		2. if not than show alert on bottom-right or top-right, new message comes
				
		// })

		if( !messageDoc ) return socket.to(roomId).emit('error', { message: `messageDoc not found` })
		socket.to(roomId).emit('message-received', { roomId, messageDoc })
	})








	//-
	socket.on('disconnect', () => console.log('connection closed'))
}