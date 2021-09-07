import { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import PlayingContext from '../../contexts/Playing'

import './Status.css'

function Status(props) {
	const { id, album, title, duration, artists } = useContext(PlayingContext),
		[progress, setProgress] = useState(0)

	const step = 1 / duration

	useEffect(() => {
		let anim = setInterval(() => {
			setProgress((progress) => progress + step)
			if (progress >= 1) clearInterval(anim)
		}, 1e3)
		return () => {
			clearInterval(anim)
		}
	}, []) // eslint-disable-line react-hooks/exhaustive-deps

	return (
		<Link className="status" to={`/utwor/${id}`}>
			<img className="status-image" alt="album cover" src={album.art} />
			<span className="status-track">{title}</span>
			<span className="status-artist">{artists.join(', ')}</span>
			<i className="icon-info"></i>
			<div
				className="status-progress"
				style={{ width: `calc(var(--max) * ${progress})` }}
			></div>
		</Link>
	)
}

export default Status
