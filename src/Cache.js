import ky from 'ky'
import { credentials } from './Auth'

var Tracks = {}

/** Object representation for track metadata */
class Track {
	/**
	 *
	 * @param {Object} tdata track information fetched from API
	 * @param {String} tdata.id
	 * @param {String} tdata.title
	 * @param {Object} tdata.album
	 * @param {String} tdata.album.title
	 * @param {Array} tdata.album.art array of available album arts (3)
	 * @param {Number} tdata.album.year
	 * @param {Number} tdata.duration duration in milliseconds
	 * @param {Boolean} tdata.explicit does the track contain explicit language
	 * @param {Boolean} tdata.banned is the track blocked from Top
	 */
	constructor(tdata) {
		Object.assign(this, tdata)

		// this.getVote()
	}

	/**
	 * Link to track's playback
	 */
	get listen() {
		return `https://open.spotify.com/track/${this.id}`
	}

	/**
	 * Self link to open Track's Info page
	 */
	get share() {
		return `${document.location.origin}/utwor/${this.id}`
	}

	/**
	 * Change users vote for track
	 * @param {('up'|'down'|'report'|'')} value
	 * @returns {Promise} was the vote changed? (Boolean)
	 */
	setVote(value) {
		return new Promise((resolve, reject) => {
			if (value === this.stats.cast) return
			ky.patch(`/api/vote/${this.id}`, {
				json: { value },
				headers: { authorization: credentials.token },
			})
				.json()
				.then((ok) => {
					if (ok) {
						if (value === 'report') return
						this.stats.cast = value
						this.getStats()
					}
					resolve(ok)
				})
				.catch((err) => reject(err))
		})
	}

	/**
	 * Get user's vote for track
	 * @returns {Promise} vote value
	 */
	getVote() {
		return new Promise((resolve, reject) => {
			if (!credentials.token) {
				return resolve('')
			}

			ky.get(`/api/vote/${this.id}/cast`, {
				headers: { authorization: credentials.token },
			})
				.text()
				.then((cast) => {
					this.stats.cast = cast
					resolve(cast)
				})
				.catch((err) => reject(err))
		})
	}

	/**
	 * Update Track's stats
	 * @returns {Promise} stats object
	 */
	getStats() {
		if (this._stats) return this._stats
		else
			return (this._stats = new Promise((resolve, reject) => {
				getStats(this.id)
					.then((stats) => {
						this.stats = stats
						resolve(this)
					})
					.catch((err) => reject(err))
			}))
	}
}

/**
 * Requests Track stats (votes upd and down)
 * @param {String} id track id
 * @returns {Promise} stats object
 */
function getStats(id) {
	return new Promise((resolve, reject) => {
		ky.get(`/api/vote/${id}`, {
			headers: { authorization: credentials.token },
		})
			.json()
			.then((stats) => {
				resolve(stats)
			})
			.catch((err) => reject(err))
	})
}

/**
 * Get Track from cache of fetch
 * @param {String} id track id
 * @returns {Track} Track object
 */
function get(id) {
	if (typeof Tracks[id] === 'undefined') {
		Tracks[id] = download(id)
	}

	return Tracks[id]
}

/**
 * Get multiple Tracks
 * @param {Array} ids Array of track ids
 * @returns {Array} Array of Tracks
 */
function getMultiple(ids = []) {
	let missing = ids.filter((id) => !Tracks[id]) // filter tracks missing from cache

	// if none are missing, return from cache
	if (missing.length < 1) return ids.map((id) => Tracks[id])
	else {
		return downloadMultiple(missing)
	}
}

/**
 * Fetch track data from API
 * @param {String} id track id
 * @returns {Track} Track object
 */
function download(id) {
	return new Promise((resolve, reject) => {
		ky.get('/api/track/' + id)
			.json()
			.then((track) => {
				resolve(new Track(track))
			})
			.catch((err) => reject(err))
	})
}

function downloadMultiple(tids) {
	let promises = {}

	// prepare promises
	// store res, rej
	tids.forEach((tid) => {
		Tracks[tid] = new Promise((resolve, reject) => {
			promises[tid] = { resolve, reject }
		})
	})

	ky.post('/api/track/batch', {
		json: { tids },
	})
		.json()
		.then((tracks) => {
			tracks.forEach((tdata) => {
				promises[tdata.id].resolve(new Track(tdata))
			})
		})
		.catch((err) => console.error(err))

	return tids.map((tid) => Tracks[tid])
}

/**
 * Runs a text query for tracks
 * @param {String} query
 * @returns {Array} Array of track ids
 */
function search(query) {
	return new Promise((resolve, reject) => {
		ky.get('/api/search/track/' + query)
			.json()
			.then((data) => resolve(data))
			.catch((err) => reject(err))
	})
}

export { Tracks as tracks, get, getMultiple, search, getStats }
