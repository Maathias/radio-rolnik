import Track from '../Track/Track'

import './History.css'

function History(props) {
	return (
		<div className="wrapper history">
			<span>Następny:</span>
			<Track {...props.next} />
			<span>Gra teraz:</span>
			<Track {...props.playing} />
			<span>Poprzednie:</span>
			{props.tracks.map((track) => {
				return <Track key={track.id} {...track} />
			})}
		</div>
	)
}

export default History
