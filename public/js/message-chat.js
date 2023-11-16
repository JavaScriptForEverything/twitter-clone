const dialog = $('[name=change-group-name]')
const dialogCloseButton = $('[name=dialog-close-button]')
const dialogCancelButton = $('[name=dialog-cancel-button]')
const dialogSubmitButton = $('[name=dialog-submit-button]')
const groupName = $('[name=dialog-tweet-input]')
const editChat = $('[name=edit-chat]')
const sendInput = $('#send-input')
const sendButton = $('#send-button')

const chatId = location.pathname.split('/').pop()

const getAllMessagesOfSingleChat = async (chatId) => {
	const { data, error } = await axios({
		url: `/api/chats/${chatId}/messages`,
		method: 'GET'
	})
	if(error) return console.log(`fetch all messages failed: ${error.message}`)

	const messageDocs = data.data
	messageDocs.forEach( messageDoc => {
		addMessage(messageDoc, logedInUser)
	})

}
getAllMessagesOfSingleChat(chatId)




// fetch chats in server-side in /authController.chatMessagePage not here
const getChatById = async (chatId) => {
	const { data, error } = await axios({ url: `/api/chats/${chatId}`, method: 'GET' })
	if(error) return console.log(`getChatById error: ${error.message}`)

	const chat = data.data
	editChat.textContent = data?.data.name || 'Group Name'
	// console.log(data.data)

	const threshold = 3
	if(chat.users.length >= threshold) {

		const remainingUsers = chat.users.length - threshold
		if(remainingUsers) {
			$('[name=more-image-placeholder]').textContent = `+${remainingUsers}`
		}

		chat.users.length = threshold 	// limit users

	}


	chat.users
		.filter( user => user._id !== logedInUser._id )
		.forEach( (user, index) => {
		const htmlString = `
			<img src='${user.avatar}' class='z-[${-index}]' />
		`
		$('[name=chat-image-container]').insertAdjacentHTML('beforeend', htmlString)
	})


}
getChatById( chatId )





dialogSubmitButton.disabled = true
groupName.value = ''

const closeHandler = () => {
	groupName.value = ''
	dialog.close()
	dialogSubmitButton.disabled = true
}

dialogCloseButton.addEventListener('click', closeHandler)
dialogCancelButton.addEventListener('click', closeHandler)
groupName.addEventListener('input', (evt) => dialogSubmitButton.disabled = !evt.target.value.trim() )
editChat.addEventListener('click', (evt) => dialog.showModal())

dialogSubmitButton.addEventListener('click', async (evt) => {
	const url = new URL(location.href)
	const chatId = url.pathname.split('/').pop()
	
	const { error, data } = await axios({
		url: `/api/chats/${chatId}`,
		method: 'PATCH',
		data: { name: groupName.value, isGroup: true }
	})
	if(error) return console.log(`show update groupName: ${error.message}`)

	editChat.textContent = data?.data.name || 'Group Name'

	// console.log( data.data )
	closeHandler()
})


$('#send-message-form').addEventListener('submit', async (evt) => {
	evt.preventDefault()


	const url = new URL(location.href)
	const chatId = url.pathname.split('/').pop()

	const formData = new FormData(evt.target)

	const message = formData.get('send-input')
	if(!message.trim()) return console.log('Your message is empty')



	const { data, error } = await axios({
		url: '/api/messages',
		method: 'POST',
		data: {
			message,
			sender: logedInUser._id,
			chat: chatId,
			// users: [{ type: Schema.Types.ObjectId, ref: 'User' }], 	// => readBy
		}
	})

	if(error) {
		sendInput.value = message
		console.log(`POST /api/messages: ${error.message}`)
		return
	}
	// console.log(data.data)
	addMessage(data.data, logedInUser)
	sendInput.value=''
	sendInput.focus()
})

const addMessage = (messageDoc, logedInUser) => {

	const thierMessage = `
		<div class='my-1 flex items-end gap-2 '>
			<img src='/images/users/default.jpg' class='w-6 h-6 rounded-full' />
			<p class='w-2/3 bg-slate-100 text-slate-600 px-2 py-1 rounded-lg'>${messageDoc.message}</p>
		</div>
	`
	const myMessage = `
		<div class='my-1 flex justify-end items-center gap-2 '>
			<p class='w-2/3 bg-blue-500 text-slate-50 px-2 py-1 rounded-lg'>${messageDoc.message}</p>
		</div>
	`

	if(!messageDoc.sender._id) return console.log('make sure messageDoc.sender is populated ')

	const htmlString = messageDoc?.sender._id === logedInUser._id ? myMessage : thierMessage
	$('[name=message-container]').insertAdjacentHTML('beforeend', htmlString)
}

