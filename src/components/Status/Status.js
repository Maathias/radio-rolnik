import { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { setColor, setDefault } from '../../Color'
import { socket } from '../../socket'

import PlayingContext from '../../contexts/Playing'
import SettingsContext from '../../contexts/Settings'

import './Status.css'
import def from '../../media/default.png'
import { get } from '../../Cache'

function Status({ progress: [progress, duration], paused }) {
	const { tid } = useContext(PlayingContext),
		{ settings } = useContext(SettingsContext)

	const [elapsed, setElapsed] = useState(),
		[track, setTrack] = useState({})

	if (tid)
		get(tid).then((tdata) => {
			setTrack(tdata)
		})

	const step = 1e3,
		tread = step / track?.duration

	// update theme color based on track
	useEffect(() => {
		if (!settings.hueFromArt) setDefault()
		else if (track?.album?.art) setColor(track?.album?.art[1]?.url, 1)
	}, [track?.album?.art, settings.hueFromArt])

	// update progress on track change
	useEffect(() => {
		setElapsed(progress ? progress / duration : 0)
	}, [progress, duration, tid])

	// animate progress bar
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
			className={['status', paused || !tid ? 'paused' : ''].join(' ')}
			to={`/utwor/${tid}`}
		>
			<img
				className="status-image"
				alt="album cover"
				src={track?.album?.art ? track?.album?.art[1]?.url : def}
			/>
			<span className="status-track">{track?.title}</span>
			<span className="status-artist">{track?.artists?.join(', ')}</span>
			<i
				className={`icon-${
					track.id
						? socket.readyState === socket.OPEN
							? 'info'
							: 'unlink'
						: 'spin4 animate-spin'
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
