import { useState, createContext, useContext } from 'react'
import { Link, useHistory } from 'react-router-dom'

import { credentials } from '../../Auth'
import { get } from '../../Cache'

import ModalLoginContext from '../../contexts/ModalLogin'

import './Track.css'
import './loading.css'

import def from '../../media/default.png'

const TracklistContext = createContext({})

function Tracklist({ children }) {
	const [active, setActive] = useState(''),
		value = { active, setActive }

	return (
		<TracklistContext.Provider value={value}>
			{children}
		</TracklistContext.Provider>
	)
}

function Track({ tid, timestamp, rank }) {
	const history = useHistory()

	const tracklist = useContext(TracklistContext),
		{ setModalLogin } = useContext(ModalLoginContext)

	const [track, setTrack] = useState({})

	get(tid)
		.then((tdata) => {
			setTrack(tdata)
			if (!tdata.stats) tdata.getStats().then((ntdata) => setTrack(ntdata))
		})
		.catch((err) => {
			setTrack(err)
		})

	function vote(value) {
		if (!credentials.token) return setModalLogin(true)

		track
			.setVote(value)
			.then((ok) => ok && tracklist.setActive(false))
			.catch((err) => console.error(err)) // TODO: alert on error
	}

	function info() {
		history.push(`/utwor/${tid}`)
	}

	return (
		<div
			className={[
				'track',
				tracklist.active === tid ? 'open' : '',
				track.id ? 'loaded' : 'loading',
				track instanceof Error ? 'failed' : '',
			].join(' ')}
			id={tid}
		>
			<div
				className={'track-section-a ' + (timestamp || rank ? '' : 'empty')}
				onClick={() => info()}
			>
				{timestamp && <span className="track-timestamp">{timestamp}</span>}
				{rank && (
					<span className="track-rank" data-votes={track?.stats?.total}>
						{rank}
					</span>
				)}
				<img
					className="track-image"
					src={track.album?.art ? track.album?.art[2].url : def}
					alt="album cover"
				/>
			</div>

			<div className="track-section-b" onClick={() => info()}>
				{track instanceof Error ? (
					<>
						<span className="track-title">{tid}</span>
						<span className="track-artist">Wystąpił błąd {track.message}</span>
					</>
				) : (
					<>
						<span className="track-title">{track.title}</span>
						<span className="track-artist">{track.artists?.join(', ')}</span>
					</>
				)}
			</div>

			<div className="track-icons">
				<i
					className="icon-ellipsis-vert"
					onClick={() => tracklist.setActive(tid)}
				></i>
			</div>

			<div className="track-more">
				<div
					className="track-more-button"
					data-set={track.stats?.cast === 'up'}
					onClick={(e) => vote('up')}
				>
					<i className="icon-thumbs-up"></i>
				</div>

				<div
					className="track-more-button"
					data-set={track.stats?.cast === 'down'}
					onClick={(e) => vote('down')}
				>
					<i className="icon-thumbs-down"></i>
				</div>

				<Link to={`/utwor/${tid}`} className="track-more-button">
					<i className="icon-info"></i>
				</Link>

				<div
					className="track-more-button"
					onClick={() => {
						tracklist.setActive(false)
					}}
				>
					<i className="icon-cancel-circled"></i>
				</div>
			</div>
		</div>
	)
}

export default Track
export { Track, Tracklist }
