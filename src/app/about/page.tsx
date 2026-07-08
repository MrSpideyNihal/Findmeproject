import type { Metadata } from 'next';
import Image from 'next/image';
import { Award, Code, Lightbulb, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn about Raisoni-Projects, the student showcase platform for G.H. Raisoni College of Engineering.',
};

export default function AboutPage() {
  return (
    <div style={{ padding: '3.5rem 0 6rem' }}>
      <div className="container" style={{ maxWidth: 800 }}>
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }} className="animate-fade-in-up">
        {/* College Logo */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div className="glass-card" style={{ display: 'inline-flex', padding: '0.875rem 1.75rem', borderRadius: 16 }}>
              <Image
                src="/raisoni-logo.webp"
                alt="GH Raisoni College of Engineering"
                width={220}
                height={72}
                style={{ objectFit: 'contain', height: 72, width: 'auto' }}
                priority
              />
            </div>
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, marginBottom: '1.25rem' }}>
            About <span className="gradient-text">Raisoni-Projects</span>
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 640, margin: '0 auto' }}>
            A unified academic project showcase platform designed to exhibit student innovations, promote research, and connect tomorrow&apos;s engineers with industry leaders.
          </p>
        </div>

        {/* Content Card */}
        <div className="glass-card glow-border" style={{ padding: '2.5rem', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Our Purpose
          </h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
            At <strong>G.H. Raisoni College of Engineering (GHRCE)</strong>, innovation is at the core of our educational philosophy. Every year, students push boundaries in Artificial Intelligence, Software Engineering, Internet of Things (IoT), and Robotics to create answers for real-world dilemmas.
          </p>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
            <strong>Raisoni-Projects</strong> serves as the central showcase archive for these student undertakings. The platform allows faculty advisors and mentors to catalog, publish, and present production-ready projects developed across all engineering departments. 
          </p>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            By hosting source repositories, functional video demos, and complete member profiles, we provide a transparent, accessible vault for potential employers, recruiters, and fellow scholars to discover, evaluate, and collaborate with student innovators.
          </p>
        </div>

        {/* Core Pillars */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '4.5rem' }}>
          {[
            { title: 'Exhibit Innovation', desc: 'Display engineering capabilities and code quality to recruiters globally.', icon: Lightbulb, color: 'var(--accent-tertiary)' },
            { title: 'Peer Collaboration', desc: 'Allow junior cohorts to reference and build upon senior project models.', icon: Users, color: 'var(--accent-secondary)' },
            { title: 'Academic Integrity', desc: 'Document verified ownership under guided mentor oversight.', icon: Award, color: 'var(--accent-primary-light)' }
          ].map(({ title, desc, icon: Icon, color }) => (
            <div key={title} className="stat-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.5rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Icon size={20} color={color} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{title}</h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>

        {/* Credits Section */}
        <div style={{ borderTop: '1px solid var(--border-secondary)', paddingTop: '3.5rem' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, textAlign: 'center', marginBottom: '2.5rem' }}>
            System <span className="gradient-text">Credits & Roles</span>
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
            {/* Proposal */}
            <div className="project-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <span className="tag tag-amber" style={{ marginBottom: '1rem', alignSelf: 'flex-start' }}>Concept Proposed By</span>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.25rem' }}>Dr. Achamma Thomas</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.75rem' }}>Head of Department (AI)</p>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: 'auto' }}>
                Initiated the platform model to showcase technical projects and academic breakthroughs within the Artificial Intelligence department.
              </p>
            </div>

            {/* Maintenance */}
            <div className="project-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <span className="tag tag-cyan" style={{ marginBottom: '1rem', alignSelf: 'flex-start' }}>Maintained By</span>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.25rem' }}>Prof. Vijaya Choudhary</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.75rem' }}>Faculty Advisor</p>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: 'auto' }}>
                Supervises site configuration adjustments, teacher authentications, and ensures compliance with GHRCE academic policies.
              </p>
            </div>

            {/* Developer */}
            <div className="project-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <span className="tag" style={{ marginBottom: '1rem', alignSelf: 'flex-start' }}>Developed By</span>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.25rem' }}>Nihal Rodge</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.75rem' }}>Student (Batch of 2027)</p>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: 'auto' }}>
                Designed and engineered the complete full-stack platform. Built the responsive client interface, secure NextAuth integrations, SheetJS Excel import pipelines, high-performance search indexing, and global routing middlewares.
              </p>
            </div>
          </div>

          {/* Testers placeholder */}
          <div className="glass-card glow-border" style={{ marginTop: '2rem', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Code size={18} color="var(--accent-tertiary)" />
            </div>
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>Quality Assurance & Testers</h4>
              <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>The list of QA team members and project testers will be updated soon.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
