import { useContext } from 'react'

import Track, { Tracklist } from '../Track/Track'

import PlayingContext from '../../contexts/Playing'

import './History.css'

function History({ next, tracks, paused }) {
	const playing = useContext(PlayingContext)

	return (
		<div className="wrapper history">
			<Tracklist>
				{next && (
					<div className="history-section next">
						<span className="header">Następny:</span>
						<Track track={next} timestamp=">" />
					</div>
				)}

				{!paused && (
					<div className="history-section now">
						<span className="header">Gra teraz:</span>
						<Track track={playing} timestamp="~" />
					</div>
				)}

				<div className="history-section previous">
					<span className="header">Poprzednie:</span>

					{tracks.map((track) => {
						let time = track.timestamp ? new Date(track.timestamp) : '-:-'

						if (track.timestamp) {
							let h = time.getHours(),
								m = time.getMinutes()

							h = h < 10 ? '0' + h : h
							m = m < 10 ? '0' + m : m

							time = h + ':' + m
						}

						return (
							<Track
								key={track.id + '_' + track.timestamp}
								track={track}
								timestamp={time}
							/>
						)
					})}

					{tracks.length < 1 && (
						<span>Tutaj pojawią się poprzednie utwory</span>
					)}
				</div>
			</Tracklist>
		</div>
	)
}

export default History
