import { useState, createContext, useContext } from 'react'
import { Link, useHistory } from 'react-router-dom'

import { credentials } from '../../Auth'

import ModalLoginContext from '../../contexts/ModalLogin'

import './Track.css'
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

function Track({ track, timestamp, displayRank = false }) {
	const {
			id,
			title = '-',
			artists = ['-'],
			album = {},
			stats = {},
		} = track ?? {},
		history = useHistory(),
		tracklist = useContext(TracklistContext),
		{ setModalLogin } = useContext(ModalLoginContext)

	function vote(value) {
		if (!credentials.token) return setModalLogin(true)

		track
			.setVote(value)
			.then((ok) => ok && tracklist.setActive(false))
			.catch((err) => console.error(err)) // TODO: alert on error
	}

	function info() {
		history.push(`/utwor/${id}`)
	}

	return (
		<div
			className={['track', tracklist.active === id ? 'open' : ''].join(' ')}
			id={id}
		>
			<div
				className={
					'track-section-a ' + (timestamp || displayRank ? '' : 'empty')
				}
				onClick={() => info()}
			>
				{timestamp && <span className="track-timestamp">{timestamp}</span>}
				{displayRank && <span className="track-rank">{stats.rank}</span>}
				<img
					className="track-image"
					src={album.art ? album.art[2].url : def}
					alt="album cover"
				/>
			</div>

			<div className="track-section-b" onClick={() => info()}>
				<span className="track-title">{title}</span>
				<span className="track-artist">{artists.join(', ')}</span>
			</div>

			<div className="track-icons">
				<i
					className="icon-ellipsis-vert"
					onClick={() => {
						tracklist.setActive(id)
					}}
				></i>
			</div>
			<div className="track-more">
				<div
					className="track-more-button"
					data-set={stats.cast === 'up'}
					onClick={(e) => vote('up')}
				>
					<i className="icon-thumbs-up"></i>
				</div>

				<div
					className="track-more-button"
					data-set={stats.cast === 'down'}
					onClick={(e) => vote('down')}
				>
					<i className="icon-thumbs-down"></i>
				</div>

				<Link to={`/utwor/${id}`} className="track-more-button">
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
