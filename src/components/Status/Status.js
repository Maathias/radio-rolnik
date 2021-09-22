import { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { setColor, setDefault } from '../../Color'
import { socket } from '../../socket'

import PlayingContext from '../../contexts/Playing'
import SettingsContext from '../../contexts/Settings'

import './Status.css'
import def from '../../media/default.png'

function Status({ progress, paused }) {
	const {
			id,
			title = '-',
			artists = ['-'],
			album = {},
			duration,
		} = useContext(PlayingContext),
		[elapsed, setElapsed] = useState(),
		{ settings } = useContext(SettingsContext)

	const step = 1e3,
		tread = step / duration

	useEffect(() => {
		if (!settings.hueFromArt) setDefault()
		else if (album.art) setColor(album.art, 1)
	}, [album.art, settings.hueFromArt])

	useEffect(() => {
		setElapsed(progress ? progress / duration : 0)
	}, [progress, duration])

	useEffect(
		(anim) => {
			if (!paused) {
				if (elapsed < 1) {
					anim = setTimeout(() => {
						setElapsed(elapsed + tread)
					}, step)
				} else if (elapsed > 1) {
					setElapsed(1) // if FPU decides that 1 / duration * duration !== 1
				}
			}

			return () => {
				clearTimeout(anim)
			}
		},
		[elapsed, tread, paused]
	)

	return (
		<Link
			className={['status', paused ? 'paused' : ''].join(' ')}
			to={`/utwor/${id}`}
		>
			<img className="status-image" alt="album cover" src={album.art ?? def} />
			<span className="status-track">{title}</span>
			<span className="status-artist">{artists.join(', ')}</span>
			<i
				className={`icon-${
					socket.readyState === socket.OPEN ? 'info' : 'unlink'
				}`}
			></i>
			<div
				className="status-progress"
				style={{ width: `calc(var(--max) * ${elapsed})` }}
			></div>
		</Link>
	)
}

export default Status
