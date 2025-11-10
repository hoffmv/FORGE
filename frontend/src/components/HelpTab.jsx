import React, { useState, useEffect, useRef } from 'react'
import { getUserManual, askHelpQuestion, searchManual } from '../api'
import ReactMarkdown from 'react-markdown'

export default function HelpTab() {
  const [activeMode, setActiveMode] = useState('browse') // 'browse', 'search', 'ask'
  const [manualContent, setManualContent] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [askQuery, setAskQuery] = useState('')
  const [askAnswer, setAskAnswer] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const [asking, setAsking] = useState(false)
  const contentRef = useRef(null)

  useEffect(() => {
    loadManual()
  }, [])

  const loadManual = async () => {
    setLoading(true)
    try {
      const result = await getUserManual()
      setManualContent(result.content)
    } catch (err) {
      console.error('Failed to load manual:', err)
      setManualContent('# Error\n\nFailed to load user manual.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setSearching(true)
    try {
      const result = await searchManual(searchQuery)
      setSearchResults(result.results || [])
    } catch (err) {
      console.error('Search failed:', err)
      alert(`Search failed: ${err.message}`)
    } finally {
      setSearching(false)
    }
  }

  const handleAsk = async (e) => {
    e.preventDefault()
    if (!askQuery.trim()) return

    setAsking(true)
    try {
      const result = await askHelpQuestion(askQuery)
      setAskAnswer(result)
    } catch (err) {
      console.error('Question failed:', err)
      alert(`Failed to get answer: ${err.message}`)
    } finally {
      setAsking(false)
    }
  }

  const scrollToSection = (sectionTitle) => {
    if (!contentRef.current) return
    const headings = contentRef.current.querySelectorAll('h1, h2, h3, h4')
    for (const heading of headings) {
      if (heading.textContent.includes(sectionTitle)) {
        heading.scrollIntoView({ behavior: 'smooth', block: 'start' })
        break
      }
    }
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      background: '#1C1C1C'
    }}>
      {/* Mode Switcher */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        padding: '15px',
        borderBottom: '2px solid #2B2B2B',
        background: '#1a1a1a'
      }}>
        <button
          onClick={() => setActiveMode('browse')}
          style={{
            flex: 1,
            padding: '10px',
            background: activeMode === 'browse' ? '#FF6E00' : '#2B2B2B',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '13px'
          }}
        >
          📖 Browse Manual
        </button>
        <button
          onClick={() => setActiveMode('search')}
          style={{
            flex: 1,
            padding: '10px',
            background: activeMode === 'search' ? '#FF6E00' : '#2B2B2B',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '13px'
          }}
        >
          🔍 Search Manual
        </button>
        <button
          onClick={() => setActiveMode('ask')}
          style={{
            flex: 1,
            padding: '10px',
            background: activeMode === 'ask' ? '#FF6E00' : '#2B2B2B',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '13px'
          }}
        >
          💬 Ask AI
        </button>
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {/* Browse Mode */}
        {activeMode === 'browse' && (
          <div ref={contentRef} style={{ 
            maxWidth: '800px', 
            margin: '0 auto',
            color: '#fff'
          }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                Loading manual...
              </div>
            ) : (
              <ReactMarkdown
                components={{
                  h1: ({node, ...props}) => <h1 style={{ color: '#FF6E00', marginTop: '40px', marginBottom: '15px' }} {...props} />,
                  h2: ({node, ...props}) => <h2 style={{ color: '#FF6E00', marginTop: '30px', marginBottom: '12px', fontSize: '20px' }} {...props} />,
                  h3: ({node, ...props}) => <h3 style={{ color: '#FF8533', marginTop: '20px', marginBottom: '10px', fontSize: '16px' }} {...props} />,
                  p: ({node, ...props}) => <p style={{ lineHeight: '1.6', marginBottom: '12px', color: '#ccc' }} {...props} />,
                  code: ({node, inline, ...props}) => 
                    inline ? 
                      <code style={{ background: '#2B2B2B', padding: '2px 6px', borderRadius: '3px', color: '#FF6E00' }} {...props} /> :
                      <code style={{ display: 'block', background: '#2B2B2B', padding: '15px', borderRadius: '6px', overflow: 'auto', color: '#fff' }} {...props} />,
                  ul: ({node, ...props}) => <ul style={{ marginLeft: '20px', marginBottom: '12px', color: '#ccc' }} {...props} />,
                  ol: ({node, ...props}) => <ol style={{ marginLeft: '20px', marginBottom: '12px', color: '#ccc' }} {...props} />,
                  a: ({node, ...props}) => <a style={{ color: '#FF6E00', textDecoration: 'none' }} {...props} />,
                  blockquote: ({node, ...props}) => <blockquote style={{ borderLeft: '4px solid #FF6E00', paddingLeft: '15px', margin: '15px 0', color: '#aaa' }} {...props} />,
                }}
              >
                {manualContent}
              </ReactMarkdown>
            )}
          </div>
        )}

        {/* Search Mode */}
        {activeMode === 'search' && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <form onSubmit={handleSearch} style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search the manual... (e.g., 'upload file', 'download code')"
                  style={{
                    flex: 1,
                    padding: '12px 15px',
                    background: '#2B2B2B',
                    border: '1px solid #444',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '14px'
                  }}
                />
                <button
                  type="submit"
                  disabled={searching || !searchQuery.trim()}
                  style={{
                    padding: '12px 24px',
                    background: searching || !searchQuery.trim() ? '#444' : '#FF6E00',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    cursor: searching || !searchQuery.trim() ? 'not-allowed' : 'pointer',
                    opacity: searching || !searchQuery.trim() ? 0.5 : 1
                  }}
                >
                  {searching ? 'Searching...' : 'Search'}
                </button>
              </div>
            </form>

            {searchResults.length > 0 ? (
              <div>
                <div style={{ color: '#888', marginBottom: '15px', fontSize: '13px' }}>
                  Found {searchResults.length} matching sections
                </div>
                {searchResults.map((result, i) => (
                  <div 
                    key={i}
                    style={{
                      background: '#2B2B2B',
                      padding: '15px',
                      borderRadius: '6px',
                      marginBottom: '12px',
                      border: '1px solid #444',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      setActiveMode('browse')
                      setTimeout(() => scrollToSection(result.section), 100)
                    }}
                  >
                    <div style={{ 
                      color: '#FF6E00', 
                      fontWeight: 'bold', 
                      marginBottom: '8px',
                      fontSize: '15px'
                    }}>
                      {result.section}
                    </div>
                    <div style={{ color: '#ccc', fontSize: '13px', lineHeight: '1.5' }}>
                      {result.content.substring(0, 200)}...
                    </div>
                    <div style={{ 
                      color: '#888', 
                      fontSize: '11px', 
                      marginTop: '8px'
                    }}>
                      {result.relevance} matches • Click to view full section
                    </div>
                  </div>
                ))}
              </div>
            ) : searchResults.length === 0 && !searching ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                No results yet. Try searching for something!
              </div>
            ) : null}
          </div>
        )}

        {/* Ask Mode */}
        {activeMode === 'ask' && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ 
              background: '#2B2B2B', 
              padding: '15px', 
              borderRadius: '6px', 
              marginBottom: '20px',
              border: '1px solid #FF6E00'
            }}>
              <div style={{ color: '#FF6E00', fontWeight: 'bold', marginBottom: '8px' }}>
                💡 Ask the AI Assistant
              </div>
              <div style={{ color: '#ccc', fontSize: '13px', lineHeight: '1.5' }}>
                Ask any question about FORGE and get instant answers powered by AI. 
                The assistant has access to the complete user manual.
              </div>
            </div>

            <form onSubmit={handleAsk} style={{ marginBottom: '20px' }}>
              <textarea
                value={askQuery}
                onChange={(e) => setAskQuery(e.target.value)}
                placeholder="Ask a question... e.g., 'How do I upload a specification file?' or 'What LLM providers are supported?'"
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  background: '#2B2B2B',
                  border: '2px solid #444',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '14px',
                  marginBottom: '10px',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  lineHeight: '1.5'
                }}
                onFocus={(e) => e.target.style.borderColor = '#FF6E00'}
                onBlur={(e) => e.target.style.borderColor = '#444'}
              />
              <button
                type="submit"
                disabled={asking || !askQuery.trim()}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: asking || !askQuery.trim() ? '#444' : '#FF6E00',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  cursor: asking || !askQuery.trim() ? 'not-allowed' : 'pointer',
                  opacity: asking || !askQuery.trim() ? 0.5 : 1
                }}
              >
                {asking ? '🤔 Thinking...' : '🚀 Ask AI Assistant'}
              </button>
            </form>

            {askAnswer && (
              <div style={{
                background: '#1a1a1a',
                padding: '20px',
                borderRadius: '6px',
                border: '2px solid #FF6E00'
              }}>
                <div style={{ 
                  color: '#FF6E00', 
                  fontWeight: 'bold', 
                  marginBottom: '12px',
                  fontSize: '15px'
                }}>
                  ❓ {askAnswer.question}
                </div>
                <div style={{ 
                  color: '#fff', 
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap'
                }}>
                  {askAnswer.answer}
                </div>
                <div style={{ 
                  marginTop: '15px', 
                  paddingTop: '15px', 
                  borderTop: '1px solid #2B2B2B',
                  color: '#888',
                  fontSize: '12px'
                }}>
                  Source: {askAnswer.source}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
