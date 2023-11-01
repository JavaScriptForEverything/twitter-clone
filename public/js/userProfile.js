/** We have global variables from server-side
 * 		profileUser
 * 		logedInUser
 */ 


//-----[ following Button ]-----
const followingBtn = $('button[name=follow]')

followingBtn.classList.toggle('follow-active-button', logedInUser.following.includes(profileUser._id))

followingBtn.addEventListener('click', async (evt) => {
	const { data, error } = await axios({
		url: `/api/users/${profileUser._id}/following`,
		method: 'PATCH',
	})
	if(error) return console.log('show error in UI')

	const updatedLogedInUser = data.data
	evt.target.textContent = updatedLogedInUser?.following.includes(profileUser._id) ? 'following' : 'follow'
	evt.target.classList.toggle('follow-active-button')
})

//-----[ Tabs container ]-----
const tabContainer = $('[name=tab-container]')
// const tabContentContainer = $('[name=tab-content-container]')

const handlePostsContaier = (evt) => {
	console.log('fetch posts')
}
const handleRepliesContainer = (evt) => {
	console.log('fetch replies')
}

tabContainer.addEventListener('click', (evt) => {
	if(evt.target.id === '0') handlePostsContaier(evt)
	if(evt.target.id === '1') handleRepliesContainer(evt)
})

