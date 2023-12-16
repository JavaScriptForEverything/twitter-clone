import { updateMessageBadge } from './module/utils.js'
import { 
	onJoinSussess, 
	showTypingIndicatorInUI,
	handleMessageReceiveUI 
} from '/js/page/messageChat.js'

/* Global Variables
		. io 								// socket.io.js script file
		. logedInUser 			// comes from every page

*/

const socket = io()
let isConnected = false



/* To create a connection with server we need to send user._id
		. user._id will be available after loged in, in home page
		. so we have call this function to home page and take logedInUser and send to backend

	 And Create private room for every logedInUser, instead of default private rooms by socket.id */
export const joinedToPrivateRoom = (logedInUser) => {
	socket.emit('setup', logedInUser)
}

// Step-2: after server get user._id send this event.
socket.on('connected', () => {
	isConnected = true
	console.log('connected to server successfull')
})


// Step-3: From client Send chatId from message/chatId  page to Server to create custom room for group chat
export const joinUserByChatId = (chatId) => {
	socket.emit('join-room', { chatId })
}

// Step-4: If this event (comes from server) is successfull that means group chat room is created
socket.on('room-joined', ({ chatId }) => {
	if( !chatId ) return onJoinSussess({ error: 'room-joined failed' })
	onJoinSussess({ message: 'room-joined succeed' })
})



export const sendTypingEvent = (chatId, message ) => {
	socket.emit('typing', { chatId, message })
}

socket.on('typing', ({ chatId, message }) => {
	showTypingIndicatorInUI(chatId, message ) 			// defined in /js/message-chat.js
})


export const sendingNewMessageEvent = (chatId, messageDoc) => {
	socket.emit('new-message', { chatId, messageDoc })
}

socket.on('message-received', ({ chatId, messageDoc }) => {
	handleMessageReceiveUI(chatId, messageDoc)
	updateMessageBadge()
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