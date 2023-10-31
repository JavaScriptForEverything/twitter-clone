// console.log(logedInUser)

const tabContainer = $('[name=tab-container]')
// const tabContentContainer = $('[name=tab-content-container]')






const sideEffect = () => {
	let count = 0
	setInterval(() => {
		console.log(count)
		count++
	}, 1000);
}

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

