import Track from '../Track/Track'

import './Top.css'

function Top(props) {
	return (
		<div className="wrapper top">
			{props.tracks.map((track) => {
				return <Track key={track.id} rank={track.votes.rank} {...track} />
			})}
		</div>
	)
}

export default Top
