
/* Global Variables
		.hljs 				: from highlight.js plugin script

*/ 
hljs.highlightAll()

// document.querySelectorAll('pre code').forEach( (block) => {
// 	hljs.highlightElement( block )
// })

;(() => {
	const $ = (selector) => document.querySelector( selector )
	const leftPanel = $('#left-panel')
	const hamburgerIcon = $('button[name=hamburger]')
	const leftArrowIcon = $('button[name=left-arrow]')
	const leftPanelList = $('#left-panel-list')
	const apiRouteButton = $('a[href="#api-routes"] + [name=list-left-arrow]')
	const apiRoutesContainer = $('[name=api-routes-container]')

	hamburgerIcon.addEventListener('click', (evt) => {
		leftPanel.classList.remove('hide-left-panel')
	})
	leftArrowIcon.addEventListener('click', (evt) => {
		leftPanel.classList.add('hide-left-panel')
	})

	leftPanelList.querySelectorAll('a').forEach(list => {
		list.addEventListener('click', () => {
			leftPanel.classList.add('hide-left-panel')
		})
	})

	// rotate API Routes's button
	apiRouteButton?.addEventListener('click', (evt) => {
		const isRotated = evt.target.classList.contains('rotate-list-button-rotate')
		evt.target.classList.toggle('rotate-list-button-rotate', !isRotated)

		if(!isRotated) {
			apiRoutesContainer.style.display = 'block'
			apiRoutesContainer.style.opacity = 0
			apiRoutesContainer.style.transition = 'all'
			setTimeout(() => {
				apiRoutesContainer.style.opacity = 1
			}, 100);

		} else {
			apiRoutesContainer.style.opacity = 0
			setTimeout(() => {
				apiRoutesContainer.style.display = 'none'
			}, 100);
		}

	})


})();

// ;(() => {
// 	const $ = (selector) => document.querySelector( selector )
// 	const sm = 640

// 	const leftArrowButton = $('#left-panel button[name=left-arrow]')
// 	// const hamburger = $('#middle-section button[name=hamburger]')
// 	const hamburger = $('button[name=hamburger]')
// 	const leftPanel = $('#left-panel')

// 	if(!leftArrowButton) console.log(`${leftArrowButton} undefined`)
// 	if(!hamburger) console.log(`${hamburger} undefined`)
// 	if(!leftPanel) console.log(`${leftPanel} undefined`)


// 	leftArrowButton.addEventListener('click', (evt) => {
// 		leftPanel.style.width = 0

// 		setTimeout(() => {
// 			hamburger.style.display = 'block'
// 			hamburger.style.opacity = 0
// 		}, 200)
		
// 		setTimeout(() => {
// 			leftPanel.style.width = `${sm}px`
// 			leftPanel.style.display = 'none'
// 			hamburger.style.opacity = 1
// 		}, 500)
// 	})
// 	hamburger.addEventListener('click', (evt) => {
// 		leftPanel.style.display = 'block'
// 		leftPanel.style.width = 0

// 		setTimeout(() => {
// 			leftPanel.style.width = `${sm}px`
// 			hamburger.style.display = 'none'
// 		}, 200)
// 	})

// })();