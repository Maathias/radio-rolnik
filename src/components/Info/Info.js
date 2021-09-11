import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { get } from '../../Cache'

import './Info.css'

function Info() {
	const { id } = useParams(),
		[track, setTrack] = useState({
			title: '-',
			votes: {},
			album: {},
			artists: ['-'],
		}),
		[meta, setMeta] = useState('...')

	useEffect(() => {
		setMeta(`Pobieranie... ${id}`)
		get(id)
			.then((track) => {
				setTrack(track)
				setMeta(false)
			})
			.catch((err) => {
				setMeta(`Wystąpił błąd przy pobieraniu informacji o utworze`)
			})
	}, [id])

	function vote(value) {
		track
			.setVote(value)
			.then((ok) =>
				ok
					? setMeta(`Zmieniono głos na ${{ up: '👎', down: '👍' }[value]}`)
					: setMeta('Wystąpił bład przy zmienianiu głosu')
			)
	}

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

				{meta && <span className="info-meta">{meta}</span>}

				{track.id && (
					<div className="info-list">
						<div className="buttons">
							<i
								className="icon-thumbs-up"
								data-set={track.votes.set === 'up'}
								onClick={(e) => vote('up')}
							></i>
							<i
								className="icon-thumbs-down"
								data-set={track.votes.set === 'down'}
								onClick={(e) => vote('down')}
							></i>
						</div>
						<div className="buttons">
							<i
								className="icon-export"
								onClick={(e) => {
									if (navigator.share)
										navigator.share({
											url: track.share,
											title: 'radio-rolnik',
											text: `Sprawdź "${track.title}" na radio-rolnik`,
										})
								}}
							></i>
							<i
								className="icon-music"
								onClick={(e) => {
									window.open(track.listen)
								}}
							></i>
							<i
								className="icon-flag"
								onClick={(e) => {
									window.confirm(`Napewno chcesz zgłosić ten utwór?`) &&
										track.setVote('report')
								}}
							></i>
						</div>
						<div>{`${track.title} - ${track.artists.join(', ')} - ${
							track.album.name ?? '-'
						} (${track.album.year ?? '-'})`}</div>
						<div>Liczba głosów: {track.votes.up + track.votes.down}</div>
						<div>Miejsce: #{track.votes.rank}</div>
						{track.banned && (
							<div>
								<span>
									Utwór zablokowany <i className="icon-cancel-circled"></i>
								</span>
							</div>
						)}
					</div>
				)}
			</div>
			<span className="info-data">{id}</span>
		</div>
	)
}

export default Info
