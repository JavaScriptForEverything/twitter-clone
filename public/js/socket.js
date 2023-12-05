/* Global Variables
		. logedInUser 			// comes from every page
		. socket 						// comes from /js/utils.js

*/

let isConnected = false

// console.log(socket)

if( logedInUser ) socket.emit('setup', logedInUser)
socket.on('connected', () => isConnected = true)


/* When user click on group chat list, join that chat to custom room */ 
const joinUserByChatId = (chatId) => {
	socket.emit('join-room', { chatId })
}

socket.on('room-joined', ({ chatId }) => {
	if( !chatId ) return checkJoined('room-joined failed') 	// defined in /js/message-chat.js
})



socket.on('typing', ({ chatId, message }) => {
	showTypingIndicatorInUI(chatId, message ) 			// defined in /js/message-chat.js
})


