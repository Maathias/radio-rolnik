// import dotenv from 'dotenv'

// dotenv.config()

const events = {}

let socket,
	retries = 0

function open() {
	socket = new WebSocket(process.env.REACT_APP_WS_SERVER)

	socket.onopen = () => {
		console.info(`Socket: connected`)
		if (retries > 0) retries = 0
	}

	socket.onclose = () => {
		console.info(`Socket: closed`)
		reopen()
	}

	socket.onmessage = (e) => {
		let data = JSON.parse(e.data)

		console.debug(data)

		if (!Array.isArray(data)) data = [data]

		for (let chunk of data) {
			let category = events[chunk.cat]
			if (category)
				for (let e of category) if (typeof e === 'function') e(chunk)
		}
	}
}

function reopen() {
	if (socket.readyState === WebSocket.OPEN) return

	if (retries > 5) {
		console.info(`Socket: too many reconnect attempts`)
	} else
		setTimeout(() => {
			console.info(`Socket: attempting reconnect, #${retries + 1}`)
			retries++
			open()
		}, 4e3)
}

function addEvent(cat, event) {
	let category = events[cat] ? events[cat] : (events[cat] = [])
	category.push(event)
}

open()

export { socket, addEvent }
