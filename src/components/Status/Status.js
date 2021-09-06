import { useContext } from 'react'
import { Link } from 'react-router-dom'

import PlayingContext from '../../contexts/Playing'

import './Status.css'

function Status(props) {
	let playing = useContext(PlayingContext)

	return (
		<Link className="status" to={`/utwor/${playing.id}`}>
			<img
				className="status-image"
				alt="album cover"
				src={playing.album.art}
			/>
			<span className="status-track">{playing.title}</span>
			<span className="status-artist">{playing.artists.join(', ')}</span>
			<i className="icon-info"></i>
			<div
				className="status-progress"
				style={{ width: `calc(var(--max) * ${playing.progress})` }}
			></div>
		</Link>
	)
}

export default Status
