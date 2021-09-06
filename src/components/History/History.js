import Track from '../Track/Track'

import './History.css'

function History(props) {
	return (
		<div className="wrapper history">
			<span>Następny:</span>
			<Track {...props.next} timestamp=">" />
			<span>Gra teraz:</span>
			<Track {...props.playing} timestamp="~" />
			<span>Poprzednie:</span>
			{props.tracks.map((track) => {
				return <Track key={track.id} {...track} timestamp="14:33" />
			})}
		</div>
	)
}

export default History
