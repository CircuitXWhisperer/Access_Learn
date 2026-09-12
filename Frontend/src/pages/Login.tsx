import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { z } from 'zod';

const loginSchema = z.object({ email: z.string().min(1) });

export function Login() {
  const [role, setRole] = useState<'student' | 'admin'>('student');
  const [email, setEmail] = useState('MH2720720060278925');
  const [name, setName] = useState('');
  const [className, setClassName] = useState('Class 10');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const submit = async (e: FormEvent) => {
    e.preventDefault();

    const parsed = loginSchema.safeParse({ email });

    if (!parsed.success) {
      setError('Enter a valid email address.');
      return;
    }

    try {
      await login(role, email, password, name, className);
    } catch (requestError: any) {
      setError(requestError.response?.data?.message ?? requestError.message ?? 'Unable to sign in. Check your administration credentials.');
      return;
    }

    navigate(
      role === 'admin' ? '/admin' : '/dashboard',
      {
        replace: true,
        state: {
          from: location.state?.from,
        },
      }
    );
  };

  return (
    <div className="login-page">
      <div className="login-visual">
        <div className="logo-lockup">
          <span className="brand-mark">A</span>
          <span>AccessLearn</span>
        </div>

        <h1>Learning without barriers.</h1>

        <p>
          An inclusive learning platform with accessible content, AI support
          and tools built around the learner.
        </p>

        <div className="feature-stack">
          <div>
            <b>◉ Audio-first learning</b>
            <span>Listen to lessons and explanations.</span>
          </div>

          <div>
            <b>◌ Simple Mode</b>
            <span>Reduce complexity and stay focused.</span>
          </div>

          <div>
            <b>⌁ AI Sahayak</b>
            <span>Ask questions in natural language.</span>
          </div>
        </div>
      </div>

      <div className="login-card-wrap">
        <form
          className="card login-card"
          onSubmit={submit}
          noValidate
        >
          <div className="eyebrow">
            WELCOME TO ACCESSLEARN
          </div>

          <h2>Choose your entry</h2>

          <p className="muted">
            Use the student portal for learning or the admin portal for
            educator tools.
          </p>

          <div className="role-tabs">
            <button
              type="button"
              className={role === 'student' ? 'selected' : ''}
              onClick={() => { setRole('student'); setEmail('MH2720720060278925'); setPassword(''); setError(''); }}
            >
              Student Entry
            </button>

            <button
              type="button"
              className={role === 'admin' ? 'selected' : ''}
              onClick={() => { setRole('admin'); setEmail('admin@accesslearn.demo'); setPassword(''); setError(''); }}
            >
              Admin Portal
            </button>
          </div>

          {role === 'student' ? (
            <>
              <label>
                UDID Number
                <input
                  value={email}
                  readOnly
                  aria-describedby="temporary-udid-note"
                  aria-invalid={Boolean(error)}
                />

                <small id="temporary-udid-note">Temporary test UDID. Aadhaar and UDID verification are disabled.</small>

                {error && (
                  <span className="field-error">
                    {error}
                  </span>
                )}
              </label>

              <label>
                Name
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>

              <label>
                Class
                <select value={className} onChange={(e) => setClassName(e.target.value)}>
                  <option>Class 8</option>
                  <option>Class 9</option>
                  <option>Class 10</option>
                  <option>Class 11</option>
                  <option>Class 12</option>
                </select>
              </label>
            </>
          ) : (
            <>
              <label>
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={Boolean(error)}
                />

                {error && (
                  <span className="field-error">
                    {error}
                  </span>
                )}
              </label>

              <label>
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
            </>
          )}

          <button
            className="btn primary full"
            type="submit"
          >
            Continue as {role === 'student' ? 'Student' : 'Admin'} →
          </button>
        </form>
      </div>
    </div>
  );
}

