import { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import PlayingContext from '../../contexts/Playing'

import './Status.css'

function Status(props) {
	let playing = useContext(PlayingContext),
		[progress, setProgress] = useState(0)

	let step = 1 / playing.duration

	useEffect(() => {
		let anim = setInterval(() => {
			setProgress((progress += step))
			if (progress >= 1) clearInterval(anim)
		}, 1e3)
	}, [])

	return (
		<Link className="status" to={`/utwor/${playing.id}`}>
			<img className="status-image" alt="album cover" src={playing.album.art} />
			<span className="status-track">{playing.title}</span>
			<span className="status-artist">{playing.artists.join(', ')}</span>
			<i className="icon-info"></i>
			<div
				className="status-progress"
				style={{ width: `calc(var(--max) * ${progress})` }}
			></div>
		</Link>
	)
}

export default Status
