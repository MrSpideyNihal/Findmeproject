import type { Metadata } from 'next';
import Image from 'next/image';
import { Award, Lightbulb, Users, CheckCircle2, FileText, Code2, GraduationCap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About | Raisoni-Projects',
  description: 'Learn about Raisoni-Projects, the student innovation showcase platform for G.H. Raisoni College of Engineering.',
};

export default function AboutPage() {
  return (
    <div style={{ padding: '3.5rem 0 6rem', minHeight: '85vh' }}>
      <div className="container" style={{ maxWidth: 860 }}>
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div
              style={{
                display: 'inline-flex',
                padding: '0.875rem 1.75rem',
                borderRadius: 'var(--radius-md)',
                background: '#ffffff',
                border: '1px solid var(--border-secondary)',
                boxShadow: 'var(--shadow-xs)',
              }}
            >
              <Image
                src="/raisoni-logo.webp"
                alt="GH Raisoni College of Engineering"
                width={220}
                height={72}
                style={{ objectFit: 'contain', height: 60, width: 'auto' }}
                priority
              />
            </div>
          </div>

          <h1 style={{ fontSize: 'clamp(2rem, 4.5vw, 2.75rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem', letterSpacing: '-0.03em' }}>
            About Raisoni-Projects
          </h1>

          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.65, maxWidth: 640, margin: '0 auto' }}>
            A unified academic project showcase platform designed to exhibit student innovations, promote engineering research, and connect tomorrow&apos;s engineers with industry leaders.
          </p>
        </div>

        {/* Mission Statement Card */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid var(--border-secondary)',
            borderRadius: 'var(--radius-lg)',
            padding: '2.25rem',
            marginBottom: '2.5rem',
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)' }}>
            Our Purpose
          </h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: '1.25rem' }}>
            At <strong>G.H. Raisoni College of Engineering (GHRCE)</strong>, innovation is at the core of our educational philosophy. Every year, students push boundaries in Artificial Intelligence, Software Engineering, Internet of Things (IoT), and Robotics to develop solutions for real-world dilemmas.
          </p>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: '1.25rem' }}>
            <strong>Raisoni-Projects</strong> serves as the central showcase vault for these student undertakings. The platform allows faculty advisors and mentors to catalog, verify, and present production-grade student work developed across all engineering departments.
          </p>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75 }}>
            By hosting verified source repositories, functional video demonstrations, and comprehensive team member profiles, we offer an accessible and transparent hub for potential employers, recruiters, and fellow scholars to discover, evaluate, and collaborate with student innovators.
          </p>
        </div>

        {/* Core Pillars */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '4rem' }}>
          {[
            { title: 'Exhibit Innovation', desc: 'Display engineering capabilities and code quality to recruiters globally.', icon: Lightbulb, color: '#d97706' },
            { title: 'Peer Collaboration', desc: 'Allow junior cohorts to reference and build upon senior project models.', icon: Users, color: '#2563eb' },
            { title: 'Academic Integrity', desc: 'Document verified ownership under guided mentor oversight.', icon: Award, color: '#059669' }
          ].map(({ title, desc, icon: Icon, color }) => (
            <div key={title} className="stat-card" style={{ padding: '1.5rem', textAlign: 'left' }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}
              >
                <Icon size={20} color={color} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                {title}
              </h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {desc}
              </p>
            </div>
          ))}
        </div>

        {/* Platform Credits Section */}
        <div style={{ borderTop: '1px solid var(--border-secondary)', paddingTop: '3.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-brand)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Academic Recognition
            </span>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
              Platform Credits & Leadership
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            {/* Concept */}
            <div className="project-card" style={{ height: '100%' }}>
              <span className="tag tag-batch" style={{ marginBottom: '0.85rem', alignSelf: 'flex-start' }}>
                Concept Proposed By
              </span>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                Dr. Achamma Thomas
              </h3>
              <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                Head of Department (AI)
              </p>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: 'auto' }}>
                Initiated the platform model to showcase technical projects and academic breakthroughs within the Artificial Intelligence department.
              </p>
            </div>

            {/* Maintenance */}
            <div className="project-card" style={{ height: '100%' }}>
              <span className="tag tag-group" style={{ marginBottom: '0.85rem', alignSelf: 'flex-start' }}>
                Faculty Oversight
              </span>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                Prof. Vijaya Choudhary
              </h3>
              <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                Faculty Advisor
              </p>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: 'auto' }}>
                Supervises platform configuration, faculty credentials, and ensures compliance with academic policies.
              </p>
            </div>

            {/* Developer */}
            <div className="project-card" style={{ height: '100%' }}>
              <span className="tag tag-accent" style={{ marginBottom: '0.85rem', alignSelf: 'flex-start' }}>
                Engineering & Architecture
              </span>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                Nihal Rodge
              </h3>
              <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                Student Engineer (Batch of 2027)
              </p>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: 'auto' }}>
                Engineered and architected the full-stack web application, database infrastructure, and UI design system.
              </p>
            </div>
          </div>

          {/* Contributors / Testing / Documentation */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
            {/* QA Card */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-secondary)',
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem',
                boxShadow: 'var(--shadow-xs)',
              }}
            >
              <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                <CheckCircle2 size={18} color="var(--color-success)" />
                Quality Assurance & Testing
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {[
                  { name: 'Sagar Meshram', dept: 'AI - 2027', role: 'Authentication & Security Testing' },
                  { name: 'Deepanshu Choudhary', dept: 'AI - 2027', role: 'Functionality Verification' },
                  { name: 'Yogini Nasare', dept: 'AIML - 2027', role: 'UI & Accessibility Audits' },
                  { name: 'Sumukh Nikhare', dept: 'AI - 2027', role: 'Routing & Navigation Auditing' },
                  { name: 'Kshitija Lanjewar', dept: 'IOT - 2027', role: 'Vulnerability Scanning' }
                ].map((tester, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: i < 4 ? '1px solid var(--border-subtle)' : 'none', paddingBottom: i < 4 ? '0.65rem' : '0', gap: '0.75rem' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{tester.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tester.dept}</div>
                    </div>
                    <span className="tag" style={{ fontSize: '0.725rem' }}>{tester.role}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Documentation Card */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-secondary)',
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem',
                boxShadow: 'var(--shadow-xs)',
              }}
            >
              <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                <FileText size={18} color="var(--accent-brand)" />
                Documentation & Specification
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {[
                  { name: 'Harsh Aknurwar', dept: 'AI - 2027', role: 'Technical Documentation' },
                  { name: 'Rohit Bhise', dept: 'AI - 2027', role: 'Schema & API Specification' }
                ].map((doc, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: i < 1 ? '1px solid var(--border-subtle)' : 'none', paddingBottom: i < 1 ? '0.65rem' : '0', gap: '0.75rem' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{doc.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{doc.dept}</div>
                    </div>
                    <span className="tag tag-batch" style={{ fontSize: '0.725rem' }}>{doc.role}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
