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
						let time = track.timestamp
							? new Date(track.timestamp).toISOString().slice(11, 16)
							: '-:-'

						return <Track key={track.id} track={track} timestamp={time} />
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
