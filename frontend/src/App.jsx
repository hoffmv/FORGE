import React from 'react'
import LeftPane from './panes/LeftPane'
import CenterPane from './panes/CenterPane'
import RightPane from './panes/RightPane'

export default function App() {
  return (
    <div className="grid">
      <LeftPane />
      <CenterPane />
      <RightPane />
    </div>
  )
}
