import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { get } from '../../Cache'

import './Info.css'

function Info() {
	const { id } = useParams(),
		[track, setTrack] = useState({
			title: 'Tytuł',
			votes: {},
			album: {},
			artists: ['Autor'],
		})

	useEffect(() => {
		get(id).then((track) => {
			setTrack(track)
		})
	}, [id])

	const percent = (track.votes.up / (track.votes.up + track.votes.down)) * 100

	document.title = `${track.title} | radio-rolnik`

	return (
		<div className="wrapper info">
			<img
				src={track.album.art ?? '/media/default.png'}
				className="info-image"
				alt="album cover"
			/>
			<div className="info-wrapper">
				<span className="title">{track.title}</span>
				<span className="artist">{track.artists[0]}</span>
				<div className="info-balance">
					<div className="up" style={{ width: `${percent}%` }}>
						{track.votes.up}&nbsp;
					</div>
					<div className="down" style={{ width: `${100 - percent}%` }}>
						{track.votes.down}
					</div>
				</div>
				<div className="info-list">
					<div>
						<i className="icon-thumbs-up"></i>
						<i className="icon-thumbs-down"></i>
					</div>
					<div>
						<i className="icon-export"></i>
						<i className="icon-music"></i>
						<i className="icon-flag"></i>
					</div>
					<div>{`${track.title} - ${track.artists.join(', ')} - ${
						track.album.name
					} (${track.album.year})`}</div>
					<div>Liczba głosów: {track.votes.up + track.votes.down}</div>
					<div>Miejsce: {track.votes.rank}</div>
					<div>Zablokowane: {track.banned ? 'Tak' : 'Nie'}</div>
				</div>
			</div>
		</div>
	)
}

export default Info
