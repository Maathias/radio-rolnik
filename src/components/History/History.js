import { useContext } from 'react'

import Track, { Tracklist } from '../Track/Track'

import { getMultiple } from '../../Cache'

import PlayingContext from '../../contexts/Playing'

import './History.css'
import './playing.css'

function History({ next, tracks, paused }) {
	const { tid } = useContext(PlayingContext)

	getMultiple(tracks.map(([tid]) => tid))

	return (
		<div className="wrapper history">
			<Tracklist>
				{next && (
					<div className="history-section next">
						<span className="header">Następny:</span>
						<Track tid={next} timestamp=">" />
					</div>
				)}

				{!paused && (
					<div className="history-section now">
						<span className="header">Gra teraz:</span>
						<Track tid={tid} timestamp="~" />
					</div>
				)}

				<div className="history-section previous">
					<span className="header">Poprzednie:</span>

					{tracks.map(([tid, timestamp]) => {
						let time = timestamp ? new Date(timestamp) : '-:-'

						if (timestamp) {
							let h = time.getHours(),
								m = time.getMinutes()

							h = h < 10 ? '0' + h : h
							m = m < 10 ? '0' + m : m

							time = h + ':' + m
						}

						return (
							<Track key={tid + '_' + timestamp} tid={tid} timestamp={time} />
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
