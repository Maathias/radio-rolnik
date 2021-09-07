import { useContext } from 'react'

import Track from '../Track/Track'

import PlayingContext from '../../contexts/Playing'

import './History.css'

function History({ next, tracks }) {
	const playing = useContext(PlayingContext)

	return (
		<div className="wrapper history">
			<span>Następny:</span>
			<Track {...next} timestamp=">" />
			<span>Gra teraz:</span>
			<Track {...playing} timestamp="~" />
			<span>Poprzednie:</span>
			{tracks.map((track) => {
				return <Track key={track.id} {...track} timestamp="14:33" />
			})}
		</div>
	)
}

export default History
