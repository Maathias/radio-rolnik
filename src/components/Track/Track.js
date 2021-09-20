import { useState, createContext, useContext } from 'react'
import { Link, useHistory } from 'react-router-dom'

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
		tracklist = useContext(TracklistContext)

	function vote(value) {
		track
			.setVote(value)
			.then((ok) => ok && tracklist.setActive(false))
			.catch((err) => console.error(err))
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
				<img className="track-image" src={album.art ?? def} alt="album cover" />
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
				<div className="track-more-button" data-set={stats.cast === 'up'}>
					<i className="icon-thumbs-up" onClick={(e) => vote('up')}></i>
				</div>

				<div className="track-more-button" data-set={stats.cast === 'down'}>
					<i className="icon-thumbs-down" onClick={(e) => vote('down')}></i>
				</div>

				<Link to={`/utwor/${id}`} className="track-more-button">
					<i className="icon-info"></i>
				</Link>

				<div className="track-more-button">
					<i
						className="icon-cancel-circled"
						onClick={() => {
							tracklist.setActive(false)
						}}
					></i>
				</div>
			</div>
		</div>
	)
}

export default Track
export { Track, Tracklist }
