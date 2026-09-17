'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Mail, Lock, User, Loader2, Eye, EyeOff, KeyRound } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';

export default function RegisterPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', accessCode: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: [] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.issues) {
          setErrors(data.issues);
        } else {
          showToast(data.error || 'Registration failed', 'error');
        }
        return;
      }

      // Auto sign-in after registration
      const result = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (result?.ok) {
        showToast('Account created successfully. Welcome to Raisoni-Projects', 'success');
        router.push('/dashboard');
        router.refresh();
      } else {
        showToast('Account created. Please sign in.', 'success');
        router.push('/auth/login');
      }
    } catch {
      showToast('Something went wrong. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { id: 'name', label: 'Faculty Name', type: 'text', placeholder: 'Prof. / Dr. Full Name', icon: User, autocomplete: 'name' },
    { id: 'email', label: 'Institutional Email', type: 'email', placeholder: 'faculty@raisoni.net', icon: Mail, autocomplete: 'email' },
    { id: 'password', label: 'Password', type: showPassword ? 'text' : 'password', placeholder: 'Minimum 8 characters, 1 uppercase, 1 number', icon: Lock, autocomplete: 'new-password' },
    { id: 'confirmPassword', label: 'Confirm Password', type: showPassword ? 'text' : 'password', placeholder: '••••••••', icon: Lock, autocomplete: 'new-password' },
    { id: 'accessCode', label: 'Teacher Access Code', type: 'text', placeholder: 'College authorization code', icon: KeyRound, autocomplete: 'off' },
  ];

  return (
    <div style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: 460 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link href="/" style={{ display: 'inline-block', marginBottom: '1rem' }}>
            <Image
              src="/raisoni-logo.webp"
              alt="GH Raisoni College"
              width={160}
              height={50}
              style={{ objectFit: 'contain', height: 48, width: 'auto' }}
              priority
            />
          </Link>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
            Faculty Registration
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Create an account to catalog student projects
          </p>
        </div>

        <div
          style={{
            background: '#ffffff',
            border: '1px solid var(--border-secondary)',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            {fields.map(({ id, label, type, placeholder, icon: Icon, autocomplete }) => (
              <div key={id} className="form-group">
                <label className="form-label required" htmlFor={id}>
                  {label}
                </label>
                <div style={{ position: 'relative' }}>
                  <Icon
                    size={16}
                    style={{
                      position: 'absolute',
                      left: '0.85rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)',
                      pointerEvents: 'none',
                    }}
                  />
                  <input
                    id={id}
                    type={type}
                    value={form[id as keyof typeof form]}
                    onChange={(e) => handleChange(id, e.target.value)}
                    placeholder={placeholder}
                    className={`form-input ${errors[id]?.length ? 'error' : ''}`}
                    style={{
                      paddingLeft: '2.4rem',
                      paddingRight: id === 'password' || id === 'confirmPassword' ? '2.4rem' : '0.85rem',
                    }}
                    autoComplete={autocomplete}
                  />
                  {id === 'password' && (
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '0.85rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-muted)',
                      }}
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  )}
                </div>
                {errors[id]?.map((err, i) => (
                  <span key={i} className="form-error">
                    {err}
                  </span>
                ))}
              </div>
            ))}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              id="register-submit"
              style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Creating account...
                </>
              ) : (
                'Complete Registration'
              )}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Already have faculty access?{' '}
          <Link href="/auth/login" style={{ color: 'var(--accent-brand)', fontWeight: 600 }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
