'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Search, LayoutDashboard, LogIn, LogOut, Plus, Menu, X, Info, GitFork, Star } from 'lucide-react';

export default function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const isLinkActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(href);
  };

  return (
    <nav className="navbar">
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
        {/* Logo & Brand */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <Image
            src="/raisoni-logo.webp"
            alt="GH Raisoni College of Engineering"
            width={124}
            height={38}
            style={{ objectFit: 'contain', height: 38, width: 'auto' }}
            priority
          />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', borderLeft: '1px solid var(--border-secondary)', paddingLeft: '0.75rem', display: 'none' }} className="brand-subtitle">
            Project Hub
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} className="desktop-nav">
          <Link
            href="/projects"
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              color: isLinkActive('/projects') ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontSize: '0.875rem',
              fontWeight: isLinkActive('/projects') ? 600 : 500,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: isLinkActive('/projects') ? 'var(--bg-subtle)' : 'transparent',
              transition: 'all 0.15s',
            }}
          >
            <Search size={15} /> Explore Projects
          </Link>

          <Link
            href="/about"
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              color: isLinkActive('/about') ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontSize: '0.875rem',
              fontWeight: isLinkActive('/about') ? 600 : 500,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: isLinkActive('/about') ? 'var(--bg-subtle)' : 'transparent',
              transition: 'all 0.15s',
            }}
          >
            <Info size={15} /> About
          </Link>

          <a
            href="https://github.com/MrSpideyNihal/Findmeproject"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-secondary)',
              fontSize: '0.875rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.15s',
            }}
            title="Star on GitHub"
          >
            <Star size={15} /> GitHub
          </a>

          <div style={{ height: '20px', width: '1px', background: 'var(--border-secondary)', margin: '0 0.25rem' }} />

          {session ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link
                href="/dashboard"
                style={{
                  padding: '0.45rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  color: isLinkActive('/dashboard') ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontSize: '0.875rem',
                  fontWeight: isLinkActive('/dashboard') ? 600 : 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: isLinkActive('/dashboard') ? 'var(--bg-subtle)' : 'transparent',
                }}
              >
                <LayoutDashboard size={15} /> Dashboard
              </Link>

              <Link href="/add-project" className="btn btn-primary btn-sm">
                <Plus size={15} /> Add Project
              </Link>

              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="btn btn-secondary btn-sm"
                title="Sign out"
              >
                <LogOut size={15} /> Sign Out
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link
                href="/auth/login"
                style={{
                  padding: '0.45rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <LogIn size={15} /> Sign In
              </Link>
              <Link href="/auth/register" className="btn btn-primary btn-sm">
                Teacher Access
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            background: 'none',
            border: '1px solid var(--border-secondary)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.4rem',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            display: 'none',
          }}
          className="mobile-menu-btn"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div
          style={{
            background: '#ffffff',
            borderTop: '1px solid var(--border-secondary)',
            padding: '1rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <Link
            href="/projects"
            onClick={() => setMobileOpen(false)}
            style={{
              padding: '0.625rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: 500,
              fontSize: '0.9rem',
            }}
          >
            <Search size={16} /> Explore Projects
          </Link>

          <Link
            href="/about"
            onClick={() => setMobileOpen(false)}
            style={{
              padding: '0.625rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: 500,
              fontSize: '0.9rem',
            }}
          >
            <Info size={16} /> About
          </Link>

          <a
            href="https://github.com/MrSpideyNihal/Findmeproject"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileOpen(false)}
            style={{
              padding: '0.625rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: 500,
              fontSize: '0.9rem',
            }}
          >
            <Star size={16} /> GitHub Repository
          </a>

          <div style={{ height: '1px', background: 'var(--border-secondary)', margin: '0.25rem 0' }} />

          {session ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                style={{
                  padding: '0.625rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: 500,
                  fontSize: '0.9rem',
                }}
              >
                <LayoutDashboard size={16} /> Dashboard
              </Link>
              <Link
                href="/add-project"
                onClick={() => setMobileOpen(false)}
                className="btn btn-primary"
                style={{ justifyContent: 'flex-start', marginTop: '0.25rem' }}
              >
                <Plus size={16} /> Add Project
              </Link>
              <button
                onClick={() => {
                  signOut({ callbackUrl: '/' });
                  setMobileOpen(false);
                }}
                className="btn btn-secondary"
                style={{ justifyContent: 'flex-start', color: 'var(--color-danger)' }}
              >
                <LogOut size={16} /> Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                onClick={() => setMobileOpen(false)}
                style={{
                  padding: '0.625rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: 500,
                  fontSize: '0.9rem',
                }}
              >
                <LogIn size={16} /> Sign In
              </Link>
              <Link
                href="/auth/register"
                onClick={() => setMobileOpen(false)}
                className="btn btn-primary"
                style={{ justifyContent: 'flex-start' }}
              >
                Teacher Access
              </Link>
            </>
          )}
        </div>
      )}

      <style jsx>{`
        @media (min-width: 640px) {
          .brand-subtitle {
            display: inline-block !important;
          }
        }
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-btn {
            display: flex !important;
          }
        }
      `}</style>
    </nav>
  );
}
