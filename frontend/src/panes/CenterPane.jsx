import React, { useEffect, useState } from 'react'
import { listJobs, getJob } from '../api'

export default function CenterPane() {
  const [jobs, setJobs] = useState([])
  const [current, setCurrent] = useState(null)

  useEffect(() => {
    const t = setInterval(async () => {
      const js = await listJobs()
      setJobs(js)
      if (current) {
        setCurrent(await getJob(current.id))
      }
    }, 1000)
    return () => clearInterval(t)
  }, [current])

  return (
    <div className="pane center">
      <h3>Jobs</h3>
      <ul className="joblist">
        {jobs.map(j => (
          <li
            key={j.id}
            onClick={() => setCurrent(j)}
            className={j.status + (current?.id === j.id ? ' selected' : '')}
          >
            <b>{j.project_name}</b> <span className="status-badge">({j.status})</span>
          </li>
        ))}
      </ul>
      
      <div className="logs">
        <h4>Status Report</h4>
        <pre>{current ? JSON.stringify(current.report || {}, null, 2) : 'Select a job to view details'}</pre>
      </div>
    </div>
  )
}
