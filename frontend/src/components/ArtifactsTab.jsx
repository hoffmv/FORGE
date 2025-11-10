import React, { useState, useEffect } from 'react'
import { listWorkspaceFiles, readWorkspaceFile } from '../api'

export default function ArtifactsTab({ selectedJob }) {
  const [files, setFiles] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)
  const [fileContent, setFileContent] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!selectedJob || selectedJob.status !== 'succeeded') {
      setFiles([])
      setSelectedFile(null)
      setFileContent(null)
      return
    }

    const fetchFiles = async () => {
      try {
        const result = await listWorkspaceFiles(selectedJob.id)
        setFiles(result.files || [])
      } catch (err) {
        console.error('Failed to list files:', err)
        setFiles([])
      }
    }

    fetchFiles()
  }, [selectedJob?.id, selectedJob?.status])

  const handleFileClick = async (file) => {
    setSelectedFile(file)
    setLoading(true)
    try {
      const result = await readWorkspaceFile(selectedJob.id, file.path)
      setFileContent(result.content)
    } catch (err) {
      console.error('Failed to read file:', err)
      setFileContent(`Error reading file: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (!selectedJob) {
    return (
      <div className="tab-placeholder">
        <div className="preview-icon">📦</div>
        <h4>Generated Artifacts</h4>
        <p>Select a successful build to view generated code</p>
      </div>
    )
  }

  if (selectedJob.status !== 'succeeded') {
    return (
      <div className="tab-placeholder">
        <div className="preview-icon">⏳</div>
        <h4>No Artifacts Yet</h4>
        <p>This build hasn't completed successfully</p>
        <p className="hint-text">Status: {selectedJob.status}</p>
      </div>
    )
  }

  if (files.length === 0) {
    return (
      <div className="tab-placeholder">
        <div className="preview-icon">📭</div>
        <h4>No Files Found</h4>
        <p>This workspace appears to be empty</p>
      </div>
    )
  }

  return (
    <div className="artifacts-container">
      <div className="artifacts-sidebar">
        <div className="artifacts-header">
          <h4>Generated Files</h4>
          <span className="file-count">{files.length} files</span>
        </div>
        <ul className="file-tree">
          {files.map((file, i) => (
            <li
              key={i}
              className={`file-item ${selectedFile?.path === file.path ? 'selected' : ''}`}
              onClick={() => handleFileClick(file)}
            >
              <span className="file-icon">
                {file.path.endsWith('.py') ? '🐍' : 
                 file.path.endsWith('.js') ? '📜' :
                 file.path.endsWith('.json') ? '📋' :
                 file.path.endsWith('.md') ? '📝' : '📄'}
              </span>
              <span className="file-name">{file.path}</span>
              <span className="file-size">{formatBytes(file.size)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="artifacts-viewer">
        {!selectedFile ? (
          <div className="viewer-placeholder">
            <div className="preview-icon">👈</div>
            <p>Select a file to view its contents</p>
          </div>
        ) : loading ? (
          <div className="viewer-placeholder">
            <div className="preview-icon">⏳</div>
            <p>Loading...</p>
          </div>
        ) : (
          <div className="file-viewer">
            <div className="viewer-header">
              <span className="viewer-title">{selectedFile.path}</span>
              <span className="viewer-size">{formatBytes(selectedFile.size)}</span>
            </div>
            <pre className="code-content">{fileContent}</pre>
          </div>
        )}
      </div>
    </div>
  )
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}
