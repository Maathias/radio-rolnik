import { useContext, useEffect, useState } from 'react'
import { useParams, Redirect } from 'react-router-dom'

import Modal from '../Modal/Modal'

import { get } from '../../Cache'

import PlayingContext from '../../contexts/Playing'

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
		[showModal, setShowModal] = useState(true),
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
						setMeta(false).catch((err) => console.error(err))
					})
					.catch((err) => console.error(err))
			})
			.catch((err) => {
				setMeta(`Wystąpił błąd przy pobieraniu informacji o utworze`)
			})
	}, [last]) // eslint-disable-line

	if (!id && last) return <Redirect to={`/utwor/${last}`} />

	function vote(value) {
		track
			.setVote(value)
			.then((ok) => {
				track
					.getStats()
					.then(() => {
						ok
							? setMeta(`Zmieniono głos na ${{ up: '👍', down: '👎' }[value]}`)
							: setMeta('Wystąpił bład przy zmienianiu głosu')
					})
					.catch((err) => console.error(err))
			})
			.catch((err) => console.error(err))
	}

	const total = track.stats.up + track.stats.down,
		percent =
			total > 0
				? (track.stats.up / (track.stats.up + track.stats.down)) * 100
				: 50

	document.setTitle(track.title)

	const toggleModal = () => setShowModal(!showModal)
	const report = () => {
		track.setVote('report')
	}

	return (
		<div className="wrapper info">
			<img
				src={track.album.art ?? def}
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

				{meta && <span className="info-meta">{meta}</span>}

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
								onClick={(e) => {
									toggleModal()
								}}
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
								<strong>{total}</strong>
							</div>
						)}

						{track.stats.rank > 0 && (
							<div>
								<i className="icon-list-numbered"></i> Miejsce:&nbsp;
								<strong>#{track.stats.rank}</strong>
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
			{showModal ? (
				<Modal>
					<div className="modal-text">
						<div>
							Czy na pewno chcesz zgłosić utwór{' '}
							<i>
								<b>{track.title}</b>
							</i>
							?
						</div>
					</div>
					<div className="modal-buttons-2">
						<button onClick={toggleModal} className="modal-button">
							Nie
						</button>
						<button onClick={report} className="modal-button">
							Tak
						</button>
					</div>
				</Modal>
			) : null}
		</div>
	)
}

export default Info
