module.exports = (io) => (socket) => {
	console.log('connection established: ', socket.id)

	/* 	By default every user has it's one private room which created by socket.id
			but that room is useless for us, because we have mongodb id for every user and
			based on that id we can get whole user info, that is useful.
			
			so we create private room for every user by logedInUser._id instead of defualt useless socket.id, 
			so that we can chat by 1:1 private chat by userId
	*/

	// Step-1: Creating Private Room for every user.
	socket.on('setup', (logedInUser) => {
		socket.join(logedInUser._id) 			
		socket.emit('connected')
	})

	// Step-2: Creating Custom Room for Group Chat
	socket.on('join-room', ({ chatId }) => {
		socket.join(chatId)
		socket.emit('room-joined', { chatId })	
	})

	// Step-3: Send 'typing' event to every user on the room except self
	socket.on('typing', ({ chatId , message }) => {
		socket.to(chatId).emit('typing', { chatId }) 		
	})

	socket.on('new-message', ({ chatId, messageDoc }) => {

		/* Method-1: (in-correct) Send to all user in chat room
		
					if( !messageDoc ) return socket.to(chatId).emit('error', { message: `messageDoc not found` })
					socket.to(chatId).emit('message-received', { chatId, messageDoc })

			This method has 2 problem:
				1. What happend if user outside of the room, visiting another route ? he will never got that emit
				2. If the user in multiple group then do we search every group that he has or not

			Instead of send emit to group chat Room, we will send emit to every user's private room. But why ?
				- Because if we send to chat room then if user outside of the group chat page, then he will got no
					notification, because he is outside of chat room.
		
					So that's the reason we send to every user's private room one by one, then no matter where he is
					will get the emit
			
			The Second reason is that if user is member of multiple group (room) then we have to send message 
			again and again for multiple chat by finding on that. Instead send message to user's private room
		*/

		const chat = messageDoc.chat
		if( !chat.users ) return console.log('messageDoc.chat.users is undefined')

		chat.users.forEach( (user) => {
			if( !user._id ) return console.log(`messageDoc.chat.users are not populated`)
			if( !messageDoc.sender._id ) return console.log(`messageDoc.sender not populated`)

			// Don't send message to me self or Don't broadcast to self room
			if( user._id == messageDoc.sender._id ) return 

			socket.to(user._id).emit('message-received', { chatId, messageDoc })
		})


	})








	//-
	socket.on('disconnect', () => console.log('connection closed'))
}