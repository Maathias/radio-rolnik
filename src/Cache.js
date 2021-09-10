import ky from 'ky'

var tracks = {}

function get(id) {
	return new Promise((resolve, reject) => {
		if (typeof tracks[id] === 'undefined') {
			download(id).then((track) => resolve(track))
		} else resolve(tracks[id])
	})
}

function getMultiple(ids) {
	return new Promise((resolve, reject) => {
		Promise.all(ids.map((id) => get(id))).then((tracks) => resolve(tracks))
	})
}

function download(id) {
	return new Promise((resolve, reject) => {
		ky.get('/api/track/' + id)
			.json()
			.then((track) => {
				tracks[track.id] = track
				resolve(track)
			})
			.catch((err) => reject(err))
	})
}

function search(query) {
	return new Promise((resolve, reject) => {
		ky.get('/api/search/track/' + query)
			.json()
			.then((data) => resolve(data))
			.catch((err) => reject(err))
	})
}

export { tracks, get, getMultiple, search }
