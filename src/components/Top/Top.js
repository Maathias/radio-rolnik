import Track, { Tracklist } from '../Track/Track'

import './Top.css'

function Top({ tracks, timestamp }) {
	const date = timestamp ?? new Date(),
		weekName = [
			'Niedziela',
			'Poniedziałek',
			'Wtorek',
			'Środa',
			'Czwartek',
			'Piątek',
			'Sobota',
		][date.getDay()],
		day = date.toLocaleTimeString('pl-PL')

	return (
		<div className="wrapper top">
			<span className="top-header">
				TOP: {weekName} {timestamp ? day : '-'}
			</span>
			<Tracklist>
				{tracks.map((track, rank) => {
					return <Track key={track.id} track={track} displayRank={true} />
				})}
			</Tracklist>
		</div>
	)
}

export default Top
