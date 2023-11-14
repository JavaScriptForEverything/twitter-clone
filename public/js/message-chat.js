const dialog = $('[name=change-group-name]')
const dialogCloseButton = $('[name=dialog-close-button]')
const dialogCancelButton = $('[name=dialog-cancel-button]')
const dialogSubmitButton = $('[name=dialog-submit-button]')
const groupName = $('[name=dialog-tweet-input]')
const editChat = $('[name=edit-chat]')


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
		.forEach( (user) => {
		const htmlString = `
			<img src='${user.avatar}' />
		`
		$('[name=chat-image-container]').insertAdjacentHTML('beforeend', htmlString)
	})


}
const chatId = location.pathname.split('/').pop()
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



$('#send-input').addEventListener('keydown', (evt) => {

	setTimeout(() => {
		console.log(evt.target.value)
		
	}, 0);
})