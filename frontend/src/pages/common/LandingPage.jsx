import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 120, damping: 20 }
    }
  };

  return (
    <div className="landing-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F9FAFB', fontFamily: 'Inter, sans-serif' }}>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        style={{ padding: '20px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E5E7EB', background: '#fff' }}
      >
        <div className="brand" style={{ fontSize: '20px' }}>
          <div className="brand-mark" style={{ background: '#111827' }}>BS</div>
          <div>
            <strong style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '-0.5px' }}>bhuSETU</strong>
            <small style={{ fontSize: '9px', letterSpacing: '1px', color: '#6B7280' }}>LAND MANAGEMENT</small>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/login" className="button button-outline" style={{ height: '40px', fontSize: '13px' }}>Sign In</Link>
          <Link to="/register" className="button button-primary" style={{ height: '40px', fontSize: '13px' }}>Create Account</Link>
        </div>
      </motion.header>

      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyItems: 'center', paddingTop: '100px', paddingBottom: '64px', paddingLeft: '24px', paddingRight: '24px', textAlign: 'center' }}
      >
        <div style={{ maxWidth: '800px' }}>
          <motion.span variants={itemVariants} className="eyebrow" style={{ justifyContent: 'center', marginBottom: '24px', fontSize: '11px', color: '#111827' }}>
            SIH-26014 PROTOTYPE
          </motion.span>
          <motion.h1 variants={itemVariants} style={{ fontSize: '64px', fontWeight: '800', lineHeight: '1.05', color: '#111827', margin: '0 0 24px', letterSpacing: '-2px', fontFamily: '"Inter Tight", sans-serif' }}>
            The Future of <br />Land Records & Registry
          </motion.h1>
          <motion.p variants={itemVariants} style={{ fontSize: '18px', color: '#6B7280', margin: '0 auto 48px', lineHeight: '1.6', maxWidth: '600px' }}>
            Bhu Setu is an advanced, high-performance platform designed to modernize property management,
            streamline application processing, and resolve land conflicts securely and efficiently.
          </motion.p>

          <motion.div variants={itemVariants} style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/register" className="button button-primary" style={{ padding: '0 32px', height: '48px', fontSize: '14px', borderRadius: '8px' }}>
                Get Started
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/login" className="button button-outline" style={{ padding: '0 32px', height: '48px', fontSize: '14px', borderRadius: '8px' }}>
                Access Dashboard
              </Link>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginTop: '100px', maxWidth: '1000px', width: '100%' }}
        >
          <motion.div variants={itemVariants} whileHover={{ y: -8, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} className="card content-card" style={{ textAlign: 'left', padding: '32px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 12px', color: '#111827', fontFamily: '"Inter Tight", sans-serif' }}>For Citizens</h3>
            <p style={{ fontSize: '14px', color: '#6B7280', margin: 0, lineHeight: '1.5' }}>View your property wallet, apply for mutations, and track applications in real-time.</p>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ y: -8, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} className="card content-card" style={{ textAlign: 'left', padding: '32px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 12px', color: '#111827', fontFamily: '"Inter Tight", sans-serif' }}>For Officers</h3>
            <p style={{ fontSize: '14px', color: '#6B7280', margin: 0, lineHeight: '1.5' }}>Efficiently process cases, analyze spatial data, and resolve conflicts through the GIS dashboard.</p>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ y: -8, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} className="card content-card" style={{ textAlign: 'left', padding: '32px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 12px', color: '#111827', fontFamily: '"Inter Tight", sans-serif' }}>Secure & Verified</h3>
            <p style={{ fontSize: '14px', color: '#6B7280', margin: 0, lineHeight: '1.5' }}>Tamper-proof record tracking, robust conflict detection, and seamless ULPIN integration.</p>
          </motion.div>
        </motion.div>
      </motion.main>

      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 1 }}
        style={{ padding: '32px', textAlign: 'center', fontSize: '13px', color: '#9CA3AF', borderTop: '1px solid #E5E7EB', background: '#fff' }}
      >
        &copy; {new Date().getFullYear()} Bhu Setu - SIH-26014. All rights reserved.
      </motion.footer>
    </div>
  );
}
