import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

import './Modal.css'

const modalRoot = document.getElementById('modal')

function Modal({ children, title, content, buttons }) {
	const elRef = useRef(null)
	if (!elRef.current) {
		elRef.current = document.createElement('div')
	}
	useEffect(() => {
		modalRoot.appendChild(elRef.current)
		return () => modalRoot.removeChild(elRef.current)
	}, [])

	return createPortal(
		<div className={'modal'}>
			{children ?? (
				<>
					<div className="modal-title">{title}</div>
					<div className="modal-body">{content}</div>
					<div className="modal-buttons">
						{buttons.map(([label, e]) => (
							<button onClick={e} className="modal-button" key={label}>
								{label}
							</button>
						))}
					</div>
				</>
			)}
		</div>,
		elRef.current
	)
}

export default Modal
