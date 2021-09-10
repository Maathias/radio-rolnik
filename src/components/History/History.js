import { useContext } from 'react'

import Track from '../Track/Track'

import PlayingContext from '../../contexts/Playing'

import './History.css'

function History({ next, tracks }) {
	const playing = useContext(PlayingContext)

	return (
		<div className="wrapper history">
			{next && (
				<div className="history-section next">
					<span>Następny:</span>
					<Track {...next} timestamp=">" />
				</div>
			)}

			<div className="history-section now">
				<span>Gra teraz:</span>
				<Track {...playing} timestamp="~" />
			</div>

			<div className="history-section previous">
				<span>Poprzednie:</span>
				{tracks.map((track) => {
					let time = track.timestamp
						? new Date(track.timestamp).toISOString().slice(11, 16)
						: '-:-'

					return <Track key={track.id} {...track} timestamp={time} />
				})}
			</div>
		</div>
	)
}

export default History
