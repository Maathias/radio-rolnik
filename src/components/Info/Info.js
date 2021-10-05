import { useContext, useEffect, useState } from 'react'
import { useParams, Redirect } from 'react-router-dom'

import Modal from '../Modal/Modal'

import { get } from '../../Cache'
import { credentials } from '../../Auth'

import PlayingContext from '../../contexts/Playing'
import ModalLoginContext from '../../contexts/ModalLogin'

import './Info.css'
import def from '../../media/default.png'

var last

function Info() {
	const { id } = useParams(),
		[track, setTrack] = useState({
			title: '-',
			stats: {},
			album: {},
			artists: ['-'],
		}),
		[meta, setMeta] = useState('...'),
		[modalReport, setModalReport] = useState(false),
		{ setModalLogin } = useContext(ModalLoginContext),
		playing = useContext(PlayingContext)

	if (!id) last = playing.id ?? ''
	else last = id

	useEffect(() => {
		setMeta(`Pobieranie... ${last}`)
		get(last)
			.then((track) => {
				track
					.getStats()
					.then((stats) => {
						setTrack(track)
						setMeta(false)
					})
					.catch((err) =>
						setMeta(`Wystąpił błąd przy pobieraniu statystyk utworu`)
					)
			})
			.catch((err) =>
				setMeta(`Wystąpił błąd przy pobieraniu informacji o utworze`)
			)
	}, [last]) // eslint-disable-line

	if (!id && last) return <Redirect to={`/utwor/${last}`} />

	function vote(value) {
		if (!credentials.token) return setModalLogin(true)

		setMeta('Zmienianie głosu...')
		track
			.setVote(value)
			.then((ok) => {
				track
					.getStats()
					.then(() => {
						ok
							? setMeta(`Zmieniono głos na ${{ up: '👍', down: '👎' }[value]}`)
							: setMeta('Głos nie został zmieniony')
					})
					.catch((err) =>
						setMeta('Wystąpił błąd przy aktualizacji statystyk utworu')
					)
			})
			.catch((err) => setMeta('Wystąpił błąd podczas wysyłania głosu'))
	}

	function report() {
		track.setVote('report')
		setModalReport(false)
	}

	const total = track.stats.up + track.stats.down,
		percent =
			total > 0
				? (track.stats.up / (track.stats.up + track.stats.down)) * 100
				: 50

	document.setTitle(track.title)

	return (
		<div className="wrapper info">
			{/* <Image
				images={track.album.art}
				fallback={def}
				className="info-image"
				alt="album cover"
			/> */}
			<img
				src={track.album.art ? track.album.art[0].url : def}
				className="info-image"
				alt="album cover"
			/>
			<div className="info-wrapper">
				<span className="title">{track.title}</span>

				<span className="artist">{track.artists[0]}</span>

				<div className="info-balance" disabled={total < 1}>
					<div className="up" style={{ width: `${percent}%` }}>
						{track.stats.up}
					</div>
					<div className="down" style={{ width: `${100 - percent}%` }}>
						{track.stats.down}
					</div>
				</div>

				<span className="info-meta">&nbsp;{meta}</span>

				{track.id && (
					<div className="info-list">
						<div className="buttons">
							<i
								className="icon-thumbs-up"
								data-set={track.stats.cast === 'up'}
								onClick={(e) => vote('up')}
							></i>
							<i
								className="icon-thumbs-down"
								data-set={track.stats.cast === 'down'}
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
								onClick={(e) => setModalReport(true)}
							></i>
						</div>

						<div>
							<span>{track.artists.join(', ')}</span>
						</div>

						<div>
							<span>
								{track.album.name ?? '-'} ({track.album.year ?? '-'})
							</span>
						</div>

						{total > 0 && (
							<div>
								<i className="icon-thumbs-up"></i> Liczba głosów:&nbsp;
								<b>{total}</b>
							</div>
						)}

						{track.stats.rank > 0 && (
							<div>
								<i className="icon-list-numbered"></i> Miejsce:&nbsp;
								<b>#{track.stats.rank}</b>
							</div>
						)}

						{track.banned && (
							<div>
								<span>
									<i className="icon-cancel-circled"></i> Utwór zablokowany
								</span>
							</div>
						)}

						{track.explicit && (
							<div>
								<span>
									<i className="icon-cancel-circled"></i> Przekleństwa
								</span>
							</div>
						)}
					</div>
				)}
			</div>
			<span className="info-data">{id}</span>
			{modalReport && (
				<Modal>
					<div class="modal-title">Czy na pewno chcesz zgłosić utwór?</div>
					<div class="modal-body">
						Zgłoszone utwory trafiają do sprawdzenia przez administrację. Jeżeli
						<b> {track.title}</b> zawiera treści nieodpowiednie lub
						<i> bardzo</i> nie chciałbyś go usłyszeć na korytarzu, zalecamy
						zgłoszanie tego utworu.
					</div>
					<div className="modal-buttons">
						<button
							onClick={() => setModalReport(false)}
							className="modal-button"
						>
							Anuluj
						</button>
						<button onClick={report} className="modal-button">
							Zgłoś
						</button>
					</div>
				</Modal>
			)}
		</div>
	)
}

export default Info
