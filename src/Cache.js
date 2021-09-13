import ky from 'ky'

var tracks = {}

class Track {
	constructor(tdata) {
		Object.assign(this, tdata)

		this.stats = {
			up: -1,
			down: -1,
		}
		this.rank = -1
		this.cast = ''

		this.getVote()
	}

	get listen() {
		return `https://open.spotify.com/track/${this.id}`
	}

	get share() {
		return `https://${document.location.origin}/utwor/${this.id}`
	}

	setVote(value) {
		return new Promise((resolve, reject) => {
			if (value === this.cast) return
			ky.patch(`/api/vote/${this.id}`, { json: { uid: 'mathias', value } })
				.json()
				.then((ok) => {
					if (ok) {
						this.cast = value
						this.getStats()
					}
					resolve(ok)
				})
				.catch((err) => reject(err))
		})
	}

	getVote() {
		return new Promise((resolve, reject) => {
			ky.get(`/api/vote/${this.id}/cast`, { searchParams: { uid: 'mathias' } })
				.text()
				.then((cast) => {
					this.cast = cast
					resolve(cast)
				})
				.catch((err) => {
					console.error(err)
				})
		})
	}

	getStats() {
		return new Promise((resolve, reject) => {
			getStats(this.id)
				.then((stats) => {
					this.stats = stats
					resolve(stats)
				})
				.catch((err) => {
					console.error(err)
				})
		})
	}
}

function getStats(id) {
	return new Promise((resolve, reject) => {
		ky.get(`/api/vote/${id}`)
			.json()
			.then((stats) => {
				resolve(stats)
			})
			.catch((err) => reject(err))
	})
}

function get(id) {
	return new Promise((resolve, reject) => {
		if (typeof tracks[id] === 'undefined') {
			download(id)
				.then((track) => resolve(track))
				.catch((err) => reject(err))
		} else resolve(tracks[id])
	})
}

function getMultiple(ids) {
	return new Promise((resolve, reject) => {
		Promise.all(ids.map((id) => get(id)))
			.then((tracks) => resolve(tracks))
			.catch((err) => {
				console.error(err)
			})
	})
}

function download(id) {
	return new Promise((resolve, reject) => {
		ky.get('/api/track/' + id)
			.json()
			.then((track) => {
				tracks[track.id] = new Track(track)
				resolve(tracks[track.id])
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

export { tracks, get, getMultiple, search, getStats }
