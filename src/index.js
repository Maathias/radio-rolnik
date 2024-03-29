import React from 'react'
import ReactDOM from 'react-dom'

import reportWebVitals from './reportWebVitals'

import Main from './components/Main/Main'

import './index.css'

ReactDOM.render(
	<React.StrictMode>
		<Main />
	</React.StrictMode>,
	document.getElementById('root')
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.info))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
