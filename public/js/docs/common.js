
/* Global Variables
		.hljs 				: from highlight.js plugin script

*/ 
hljs.highlightAll()

// document.querySelectorAll('pre code').forEach( (block) => {
// 	hljs.highlightElement( block )
// })

;(() => {
	const $ = (selector) => document.querySelector( selector )
	const sm = 640

	const leftArrowButton = $('#left-panel button[name=left-arrow]')
	// const hamburger = $('#middle-section button[name=hamburger]')
	const hamburger = $('button[name=hamburger]')
	const leftPanel = $('#left-panel')

	if(!leftArrowButton) console.log(`${leftArrowButton} undefined`)
	if(!hamburger) console.log(`${hamburger} undefined`)
	if(!leftPanel) console.log(`${leftPanel} undefined`)


	leftArrowButton.addEventListener('click', (evt) => {
		leftPanel.style.width = 0

		setTimeout(() => {
			hamburger.style.display = 'block'
			hamburger.style.opacity = 0
		}, 200)
		
		setTimeout(() => {
			leftPanel.style.width = `${sm}px`
			leftPanel.style.display = 'none'
			hamburger.style.opacity = 1
		}, 500)
	})
	hamburger.addEventListener('click', (evt) => {
		leftPanel.style.display = 'block'
		leftPanel.style.width = 0

		setTimeout(() => {
			leftPanel.style.width = `${sm}px`
			hamburger.style.display = 'none'
		}, 200)
	})

})();