// import { 
// 	onJoinSussess, 
// 	showTypingIndicatorInUI,
// 	handleMessageReceiveUI 
// } from '/js/page/messageChat.js'



/* Global Variables
		. io 								// socket.io.js script file
		. logedInUser 			// comes from every page

*/

const socket = io()
// console.log(socket, logedInUser)

let isConnected = false

// To create private room by user._id instead of useless socket.id
socket.emit('setup', logedInUser)
socket.on('connected', () => isConnected = true)



if( logedInUser ) socket.emit('setup', logedInUser)
socket.on('connected', () => isConnected = true)


/* When user click on group chat list, join that chat to custom room */ 
export const joinUserByChatId = (chatId) => {
	socket.emit('join-room', { chatId })
}

// socket.on('room-joined', ({ chatId }) => {
// 	if( !chatId ) return onJoinSussess({ error: 'room-joined failed' })
// 	onJoinSussess({ message: 'room-joined succeed' })
// })



// socket.on('typing', ({ chatId, message }) => {
// 	showTypingIndicatorInUI(chatId, message ) 			// defined in /js/message-chat.js
// })


socket.on('message-received', ({ roomId, messageDoc }) => {
	// handleMessageReceiveUI(roomId, messageDoc)
})


// // its not firing from outside of /notification page
// socket.on('message-received', ({ roomId, messageDoc }) => {

// 	console.log(messageDoc.message)

// 	Snackbar({
// 		severity: 'info',
// 		message: `${messageDoc.message}`,
// 		// position: 'top-1 right-1' 						// tailwind class
// 		variant: 'filled', 									// text | contained | filled
// 		action: true,
// 		// autoClose: true,
// 		// closeTime: 20000,
// 		// title: 'Testing'
// 	})
// })