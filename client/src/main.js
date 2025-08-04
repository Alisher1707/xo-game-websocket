import "./main.css"
import { io } from "socket.io-client"

// Constants
const WIN_PATTERNS = [
	[0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
	[0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
	[0, 4, 8], [2, 4, 6] // diagonals
]

// User data will be initialized in modal
let userData = {}

// Utility Functions
function getDisplaySymbol(symbol) {
	return symbol === "x" ? "❌" : "⭕"
}

function checkWinner(gameState) {
	for (const pattern of WIN_PATTERNS) {
		const [a, b, c] = pattern
		if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
			return { winner: gameState[a], pattern }
		}
	}

	if (gameState.every(cell => cell !== null)) {
		return { winner: 'draw', pattern: null }
	}

	return null
}

function resetGameUI() {
	const buttons = document.querySelectorAll("#game-matrix button")
	const select = document.querySelector(".symbol-selector")
	const gameStatus = document.querySelector("#game-status")

	select.removeAttribute("disabled")
	gameStatus.textContent = ""
	gameStatus.className = ""

	select.querySelectorAll("option").forEach(option => {
		if (option.value !== "-") {
			option.removeAttribute("disabled")
		}
	})

	buttons.forEach(button => {
		button.textContent = ""
		button.removeAttribute("disabled")
		button.setAttribute("disabled", "true")
		button.classList.remove("winning-cell")
	})
}

function highlightWinningCells(pattern) {
	if (pattern) {
		const buttons = document.querySelectorAll("#game-matrix button")
		pattern.forEach(index => {
			buttons[index].classList.add('winning-cell')
		})
	}
}

function updateGameStatus(result, currentUserData, isCurrentPlayer, isComputerMode = false, opponentData = null) {
	const gameStatus = document.querySelector("#game-status")
	
	if (result.winner === 'draw') {
		gameStatus.textContent = "🤝 It's a draw!"
		gameStatus.className = "draw"
	} else if (isCurrentPlayer) {
		gameStatus.textContent = "🎉 YOU WIN! 🏆"
		gameStatus.className = "winner"
	} else {
		if (isComputerMode) {
			gameStatus.textContent = "😔 🤖 Computer wins!"
		} else if (opponentData) {
			const opponentAvatar = opponentData.avatarType === 'emoji' ? opponentData.avatar : '👤'
			gameStatus.textContent = `😔 ${opponentAvatar} ${opponentData.username} wins!`
		} else {
			gameStatus.textContent = `😔 ${getDisplaySymbol(result.winner)} Player wins!`
		}
		gameStatus.className = "winner"
	}
	
	if (result.pattern) {
		setTimeout(() => highlightWinningCells(result.pattern), 500)
	}
}

// Initialize app
initializeModal()

function initializeModal() {
	const modal = document.getElementById('user-modal')
	const avatarOptions = document.querySelectorAll('.avatar-option')
	const usernameInput = document.getElementById('username-input')
	const startGameBtn = document.getElementById('start-game-btn')
	const usernameError = document.getElementById('username-error')
	
	// File upload elements
	const avatarUpload = document.getElementById('avatar-upload')
	const uploadTrigger = document.getElementById('upload-trigger')
	const removeAvatar = document.getElementById('remove-avatar')
	const avatarPreview = document.getElementById('avatar-preview')
	const previewImage = document.getElementById('preview-image')
	const previewEmoji = document.getElementById('preview-emoji')
	
	// Game mode elements
	const multiplayerBtn = document.getElementById('multiplayer-btn')
	const computerBtn = document.getElementById('computer-btn')
	const modeButtons = document.querySelectorAll('.mode-btn')

	// Initialize user data - fresh start every time
	userData = {
		avatar: '🎮',
		avatarType: 'emoji',
		avatarData: null,
		username: '',
		isProfileComplete: false,
		gameMode: 'multiplayer'
	}

	// Always show modal on page load - user can modify profile anytime

	// Game mode selection
	modeButtons.forEach(btn => {
		btn.addEventListener('click', () => {
			modeButtons.forEach(b => b.classList.remove('active'))
			btn.classList.add('active')
			userData.gameMode = btn.dataset.mode
		})
	})

	// File upload functionality
	uploadTrigger.addEventListener('click', () => {
		avatarUpload.click()
	})

	avatarUpload.addEventListener('change', (e) => {
		const file = e.target.files[0]
		if (file) {
			handleImageUpload(file)
		}
	})

	removeAvatar.addEventListener('click', () => {
		removeCustomAvatar()
	})

	// Avatar selection (emoji)
	avatarOptions.forEach(option => {
		option.addEventListener('click', () => {
			selectEmojiAvatar(option.dataset.avatar)
		})
	})

	function handleImageUpload(file) {
		// Validate file type
		if (!file.type.startsWith('image/')) {
			showError('Please select a valid image file')
			return
		}

		// Validate file size (max 5MB)
		if (file.size > 5 * 1024 * 1024) {
			showError('Image size must be less than 5MB')
			return
		}

		const reader = new FileReader()
		reader.onload = (e) => {
			const img = new Image()
			img.onload = () => {
				// Resize image if needed
				const canvas = document.createElement('canvas')
				const ctx = canvas.getContext('2d')
				const maxSize = 200
				
				let { width, height } = img
				if (width > height) {
					if (width > maxSize) {
						height = (height * maxSize) / width
						width = maxSize
					}
				} else {
					if (height > maxSize) {
						width = (width * maxSize) / height
						height = maxSize
					}
				}

				canvas.width = width
				canvas.height = height
				ctx.drawImage(img, 0, 0, width, height)

				const resizedDataUrl = canvas.toDataURL('image/jpeg', 0.8)
				
				// Update userData
				userData.avatarType = 'image'
				userData.avatarData = resizedDataUrl
				userData.avatar = null

				// Update preview
				updateAvatarPreview()
				validateForm()
				clearError()
			}
			img.src = e.target.result
		}
		reader.readAsDataURL(file)
	}

	function selectEmojiAvatar(emoji) {
		avatarOptions.forEach(opt => opt.classList.remove('active'))
		const selectedOption = document.querySelector(`[data-avatar="${emoji}"]`)
		if (selectedOption) {
			selectedOption.classList.add('active')
		}

		userData.avatarType = 'emoji'
		userData.avatar = emoji
		userData.avatarData = null

		updateAvatarPreview()
		validateForm()
	}

	function removeCustomAvatar() {
		userData.avatarType = 'emoji'
		userData.avatar = '🎮'
		userData.avatarData = null

		// Reset to default emoji
		selectEmojiAvatar('🎮')
		
		// Reset file input
		avatarUpload.value = ''
		updateAvatarPreview()
	}

	function updateAvatarPreview() {
		if (userData.avatarType === 'image' && userData.avatarData) {
			previewImage.src = userData.avatarData
			previewImage.style.display = 'block'
			previewEmoji.style.display = 'none'
			removeAvatar.style.display = 'inline-block'
		} else {
			previewImage.style.display = 'none'
			previewEmoji.style.display = 'block'
			previewEmoji.textContent = userData.avatar
			removeAvatar.style.display = 'none'
		}
	}

	// Username input
	usernameInput.addEventListener('input', (e) => {
		userData.username = e.target.value.trim()
		validateForm()
		clearError()
	})

	usernameInput.addEventListener('keypress', (e) => {
		if (e.key === 'Enter' && !startGameBtn.disabled) {
			startGame()
		}
	})

	// Start game button
	startGameBtn.addEventListener('click', startGame)

	function validateForm() {
		const isValid = userData.username.length >= 2 && userData.username.length <= 15
		startGameBtn.disabled = !isValid
		
		if (userData.username.length > 0 && userData.username.length < 2) {
			showError('Username must be at least 2 characters')
		} else if (userData.username.length > 15) {
			showError('Username must be less than 15 characters')
		} else {
			clearError()
		}
	}

	function showError(message) {
		usernameError.textContent = message
		usernameInput.style.borderColor = '#ff6b6b'
	}

	function clearError() {
		usernameError.textContent = ''
		usernameInput.style.borderColor = ''
	}

	function startGame() {
		if (userData.username.trim().length < 2) {
			showError('Please enter a valid username')
			usernameInput.focus()
			return
		}

		userData.isProfileComplete = true
		
		// Hide modal with animation
		modal.style.animation = 'modalFadeOut 0.5s ease forwards'
		setTimeout(() => {
			modal.classList.add('hidden')
			updatePlayerInfo()
			
			// Start game based on selected mode
			if (userData.gameMode === 'multiplayer') {
				run()
			} else {
				runComputerGame()
			}
		}, 500)
	}

	// Reset to default avatar
	selectEmojiAvatar('🎮')
	
	// Always clear username input on page load
	usernameInput.value = ''
	userData.username = ''
	validateForm()

	// Reset file input
	avatarUpload.value = ''

	// Initial preview update
	updateAvatarPreview()
}

function updatePlayerInfo() {
	const playerAvatarImg = document.getElementById('player-avatar-img')
	const playerAvatar = document.getElementById('player-avatar')
	const playerName = document.getElementById('player-name')

	if (userData.avatarType === 'image' && userData.avatarData) {
		playerAvatarImg.src = userData.avatarData
		playerAvatarImg.style.display = 'block'
		playerAvatar.style.display = 'none'
	} else {
		playerAvatarImg.style.display = 'none'
		playerAvatar.style.display = 'block'
		playerAvatar.textContent = userData.avatar
	}

	playerName.textContent = userData.username
}

// Computer Game Logic
function runComputerGame() {
	let symbol = 'x' // User always plays X
	let gameState = new Array(9).fill(null)
	let currentPlayer = 'human'
	
	const buttons = document.querySelectorAll("#game-matrix button")
	const select = document.querySelector(".symbol-selector")
	const resetButton = document.querySelector(".reset-button")
	const gameStatus = document.querySelector("#game-status")

	// Auto start computer game
	initializeComputerGame()

	function initializeComputerGame() {
		// Hide symbol selector and auto-start
		select.style.display = 'none'
		buttons.forEach(button => button.removeAttribute("disabled"))
		gameStatus.textContent = "Your turn! (You are X)"
		gameStatus.className = ""
	}

	resetButton.onclick = () => {
		gameState = new Array(9).fill(null)
		currentPlayer = 'human'
		buttons.forEach(button => {
			button.textContent = ""
			button.removeAttribute("disabled")
			button.classList.remove("winning-cell")
		})
		gameStatus.textContent = "Your turn! (You are X)"
		gameStatus.className = ""
	}

	function makeComputerMove() {
		gameStatus.textContent = "🤖 Computer is thinking..."
		
		setTimeout(() => {
			const availableMoves = gameState.map((cell, index) => cell === null ? index : null).filter(val => val !== null)
			
			if (availableMoves.length > 0) {
				const randomIndex = Math.floor(Math.random() * availableMoves.length)
				const move = availableMoves[randomIndex]
				
				const computerSymbol = symbol === 'x' ? 'o' : 'x'
				gameState[move] = computerSymbol
				
				buttons[move].textContent = getDisplaySymbol(computerSymbol)
				buttons[move].setAttribute("disabled", "true")
				
				const result = checkWinner(gameState)
				if (result) {
					updateGameStatus(result, userData, result.winner === symbol, true)
					buttons.forEach(button => button.setAttribute("disabled", "true"))
				} else {
					currentPlayer = 'human'
					gameStatus.textContent = "Your turn! (You are X)"
				}
			}
		}, 1000)
	}

	buttons.forEach((button, index) => {
		button.onclick = () => {
			if (currentPlayer === 'human' && gameState[index] === null) {
				gameState[index] = symbol
				button.textContent = getDisplaySymbol(symbol)
				button.setAttribute("disabled", "true")
				
				const result = checkWinner(gameState)
				if (result) {
					updateGameStatus(result, userData, result.winner === symbol, true)
					buttons.forEach(button => button.setAttribute("disabled", "true"))
				} else {
					currentPlayer = 'computer'
					makeComputerMove()
				}
			}
		}
	})
}

function run() {

	let symbol = null
	const socket = io( "http://localhost:3001" )

	const buttons = document.querySelectorAll( "#game-matrix button" )
	const select = document.querySelector( ".symbol-selector" )
	const resetButton = document.querySelector( ".reset-button" )
	const gameStatus = document.querySelector( "#game-status" )

	// Show symbol selector for multiplayer
	select.style.display = 'block'

	resetButton.onclick = () => {
		socket.emit( "reset" )
	}

	select.onchange = () => {
		symbol = select.value
		buttons.forEach( button => button.removeAttribute( "disabled" ) )
		select.setAttribute( "disabled", "true" )

		socket.emit( "set_symbol", {
			symbol,
			username: userData.username,
			avatar: userData.avatar,
			avatarType: userData.avatarType,
			avatarData: userData.avatarData
		})
	}

	socket.on( "update", ( { index, symbol } ) => {
		buttons[ index ].textContent = getDisplaySymbol(symbol)
		buttons[ index ].setAttribute( "disabled", "true" )
	} )

	socket.on( "busy_symbol", symbol => {
		[ ...select.children ].forEach( option => {
			if ( option.value === symbol ) {
				option.setAttribute( "disabled", "true" )
			}
		} )
	} )

	socket.on( "reset", () => {
		symbol = null
		resetGameUI()
	} )

	socket.on( "game_over", data => {
		const result = { winner: data.symbol, pattern: null }
		const isCurrentPlayer = data.symbol === symbol
		
		if (data.symbol === 'draw') {
			updateGameStatus(result, userData, false, false)
		} else {
			if (isCurrentPlayer) {
				updateGameStatus(result, userData, true, false)
			} else {
				// Show opponent's info
				updateGameStatus(result, userData, false, false, data.player)
			}
			
			// Add winning animation for multiplayer
			setTimeout(() => {
				highlightMultiplayerWinningCells()
			}, 500)
		}

		buttons.forEach( button => {
			button.setAttribute( "disabled", "true" )
		} )
	} )
	
	// Highlight winning cells for multiplayer (server doesn't send pattern)
	function highlightMultiplayerWinningCells() {
		for (const pattern of WIN_PATTERNS) {
			const [a, b, c] = pattern
			if (buttons[a].textContent && 
				buttons[a].textContent === buttons[b].textContent && 
				buttons[a].textContent === buttons[c].textContent) {
				
				highlightWinningCells(pattern)
				break
			}
		}
	}

	buttons.forEach( ( button, index ) => {
		button.onclick = () => {
			if ( symbol && ( symbol === "x" || symbol === "o" ) ) {
				socket.emit( "action", { index, symbol } )
			}
		}
	} )
}
