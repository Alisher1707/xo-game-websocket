import { Server } from "socket.io"
import { createServer } from "http"

const state = new Map()
let lastSymbol = null
const players = new Map() // Store player info: symbol -> {username, avatar}

function checkWinner() {
	const winPatterns = [
		[0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
		[0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
		[0, 4, 8], [2, 4, 6] // diagonals
	]

	for (const pattern of winPatterns) {
		const [a, b, c] = pattern
		if (state.get(a) && state.get(a) === state.get(b) && state.get(a) === state.get(c)) {
			return state.get(a)
		}
	}

	if (state.size === 9) {
		return 'draw'
	}

	return null
}

const httpServer = createServer()
const io = new Server( httpServer, {
	cors: {
		origin: "http://localhost:3000",
		methods: [ "GET", "POST" ],
	}
} )

httpServer.listen( 3001, () => {

	console.log( "Server listening on port 3001" )
} )

io.on( "connection", client => {

	client.on( "set_symbol", data => {
		const { symbol, username, avatar, avatarType, avatarData } = data
		
		// Store player info
		players.set(symbol, { 
			username, 
			avatar, 
			avatarType, 
			avatarData,
			socketId: client.id 
		})
		
		io.emit( "busy_symbol", symbol )
	} )

	client.on( "reset", () => {
		lastSymbol = null
		state.clear()
		players.clear()
		io.emit( "reset" )
	} )

	client.on( "action", ( { index, symbol } ) => {
		if ( state.has( index ) ) {
			return
		}

		if ( symbol !== lastSymbol ) {
			lastSymbol = symbol
			state.set( index, symbol )
			
			io.emit( "update", { index, symbol } )

			const winner = checkWinner()
			if (winner) {
				let winnerData = null
				if (winner !== 'draw' && players.has(winner)) {
					winnerData = players.get(winner)
				}
				io.emit( "game_over", { symbol: winner, player: winnerData } )
			}
		}
	} )
} )
