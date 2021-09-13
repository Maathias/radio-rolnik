import Track from '../Track/Track'

import './Top.css'

function Top(props) {
	return (
		<div className="wrapper top">
			{props.tracks.map((track, rank) => {
				return <Track key={track.id} rank={rank + 1} track={track} />
			})}
		</div>
	)
}

export default Top
