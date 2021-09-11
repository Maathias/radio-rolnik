import ky from 'ky'

var tracks = {}

class Track {
	constructor(tdata) {
		Object.assign(this, tdata)
	}

	get listen() {
		return `https://open.spotify.com/track/${this.id}`
	}

	get share() {
		return `https://radio-rolnik.mtps.pl/utwor/${this.id}`
	}

	setVote(value) {
		return new Promise((resolve, reject) => {
			ky.get(`/api/vote/${this.id}/${value}`)
				.json()
				.then((ok) => {
					if (ok) {
						this.votes.set = value
					}
					resolve(ok)
				})
				.catch((err) => reject(err))
		})
	}

	getVotes() {
		return new Promise((resolve, reject) => {
			getVotes(this.id).then((votes) => {
				this.votes = votes
				resolve(votes)
			})
		})
	}
}

function getVotes(id) {
	return new Promise((resolve, reject) => {
		ky.get(`/api/track/${id}?votes`)
			.json()
			.then((votes) => {
				resolve(votes)
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
		Promise.all(ids.map((id) => get(id))).then((tracks) => resolve(tracks))
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

export { tracks, get, getMultiple, search }
