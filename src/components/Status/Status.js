import { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import PlayingContext from '../../contexts/Playing'

import './Status.css'

function Status(props) {
	const {
			id,
			title = 'Tytuł',
			artists = ['Autor'],
			album = {},
			duration,
		} = useContext(PlayingContext),
		[progress, setProgress] = useState(0)

	const step = 1 / duration

	useEffect(
		(anim) => {
			if (progress < 1) {
				anim = setTimeout(() => {
					setProgress(progress + step)
				}, 1e3)
			} else if (progress > 1) {
				setProgress(1) // if FPU decides that 1 / duration * duration !== 1
			}
			return () => {
				clearInterval(anim)
			}
		},
		[progress, step]
	)

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
