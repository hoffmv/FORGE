import React from 'react'

export default function RightPane() {
  return (
    <div className="pane right">
      <h3>Preview</h3>
      <div className="preview-placeholder">
        <div className="preview-icon">🔨</div>
        <h4>Artifact Preview</h4>
        <p>Built artifacts will appear here</p>
        <p className="hint-text">Future: serve HTML/static files from workspace</p>
      </div>
    </div>
  )
}
