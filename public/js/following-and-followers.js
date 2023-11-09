// console.log(profileUser.followers)


//-----[ following Button ]-----
// console.log(profileUser.following)
// console.log(profileUser.followers)

$('[name=tab-content-container]').addEventListener('click', async (evt) => {
	if(evt.target.tagName !== 'BUTTON' || !evt.target.id  ) return

		const button = evt.target
		const field = button.name 		// following | followers

		// console.log(button.name, button.id)

		const doc = profileUser?.[field].find( user => user._id == button.id)
		const profileUsersFollowingOrFowwlowersId = doc._id 
		console.log(profileUsersFollowingOrFowwlowersId)


		const { data, error } = await axios({
			url: `/api/users/${profileUsersFollowingOrFowwlowersId}/following`,
			method: 'PATCH',
		})

		if(error) return console.log('show error in UI')
		const updatedLogiedInUser = data?.data
		console.log(updatedLogiedInUser)


		evt.target.closest('[name=follow-list]').remove()

})






// const followingBtn = $('button[name=follow]')

// followingBtn.classList.toggle('follow-active-button', logedInUser.following.includes(profileUser._id))

// followingBtn.addEventListener('click', async (evt) => {
// 	const { data, error } = await axios({
// 		url: `/api/users/${profileUser._id}/following`,
// 		method: 'PATCH',
// 	})
// 	if(error) return console.log('show error in UI')

// 	const updatedLogedInUser = data.data
// 	evt.target.textContent = updatedLogedInUser?.following.includes(profileUser._id) ? 'following' : 'follow'
// 	evt.target.classList.toggle('follow-active-button')

// 	$('[name=followers-value]').textContent = updatedLogedInUser.following.length + ' '
// })
