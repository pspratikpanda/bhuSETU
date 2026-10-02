import { ArrowRight, CheckCircle2, Fingerprint, LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { demoUsers } from '../../data/mockUsers';
import { signIn, verifyEKYC } from '../../services/auth/authService';
import { Badge, Brand, Button } from '../../components/ui';
import { motion } from 'framer-motion';

export function LoginPage() {
  const [authMethod, setAuthMethod] = useState('role');
  const [role, setRole] = useState('Citizen');
  const [aadhaar, setAadhaar] = useState('');
  const [notice, setNotice] = useState('');
  const navigate = useNavigate();

  const enter = async () => {
    if (authMethod === 'ekyc') {
      if (!aadhaar || aadhaar.length < 12) {
        setNotice('Please enter a valid 12-digit Aadhaar number.');
        return;
      }
      const kycResult = await verifyEKYC(aadhaar, '123456');
      if (kycResult.success) {
        setNotice(`Aadhaar e-KYC Verified for ${kycResult.user.name}`);
        setTimeout(() => navigate('/citizen/dashboard'), 500);
      } else {
        setNotice(kycResult.message || 'Verification failed.');
      }
      return;
    }

    const user = await signIn(role);
    setNotice(`Signed in with JWT as ${user.name}`);
    setTimeout(() => navigate(role === 'Citizen' ? '/citizen/dashboard' : '/officer/dashboard'), 300);
  };

  return (
    <div className="auth-page">
      <motion.aside 
        initial={{ opacity: 0, x: -50 }} 
        animate={{ opacity: 1, x: 0 }} 
        transition={{ duration: 0.6, ease: "easeOut" }} 
        className="auth-aside"
      >
        <Brand />
        <div className="auth-aside-copy">
          <span className="eyebrow">ONE RECORD. MANY SERVICES.</span>
          <h1>Land records,<br />connected.</h1>
          <p>A unified view of land information and services for citizens and public officers.</p>
          <div className="auth-trust">
            <span><ShieldCheck size={17} />JWT Authenticated</span>
            <span><Fingerprint size={17} />Aadhaar e-KYC Ready</span>
          </div>
        </div>
        <div className="auth-aside-foot">
          <span>BHARAT · JHARKHAND</span>
          <span>SIH-26014 · AUTH ENGINE</span>
        </div>
        <div className="auth-orb auth-orb-one" />
        <div className="auth-orb auth-orb-two" />
      </motion.aside>
      <motion.main 
        initial={{ opacity: 0, x: 50 }} 
        animate={{ opacity: 1, x: 0 }} 
        transition={{ duration: 0.5, delay: 0.1, type: "spring", stiffness: 100, damping: 20 }} 
        className="auth-main"
      >
        <div className="auth-card">
          <div className="auth-mobile-brand"><Brand /></div>
          <span className="eyebrow">WELCOME TO BHU SETU</span>
          <h2>Sign in to your account</h2>
          <p className="auth-subtitle">Select your authentication method to access the workspace.</p>

          <div className="filter-tabs compact-tabs" style={{ marginBottom: '1.25rem' }}>
            <button
              type="button"
              onClick={() => setAuthMethod('role')}
              className={authMethod === 'role' ? 'filter-tab-active' : ''}
            >
              Role & JWT Auth
            </button>
            <button
              type="button"
              onClick={() => setAuthMethod('ekyc')}
              className={authMethod === 'ekyc' ? 'filter-tab-active' : ''}
            >
              Aadhaar e-KYC Verification
            </button>
          </div>

          {authMethod === 'role' ? (
            <>
              <label className="form-field">
                <span>Workspace role & permissions</span>
                <div className="role-options">
                  {demoUsers.map((user) => (
                    <button
                      key={user.role}
                      type="button"
                      onClick={() => setRole(user.role)}
                      className={`role-option ${role === user.role ? 'role-selected' : ''}`}
                    >
                      <span className="role-radio">{role === user.role && <i />}</span>
                      <span>
                        <strong>{user.role}</strong>
                        <small>{user.location}</small>
                      </span>
                    </button>
                  ))}
                </div>
              </label>
              <label className="form-field">
                <span>Email address</span>
                <div className="input-icon">
                  <Fingerprint size={16} />
                  <input type="email" placeholder="name@example.gov.in" defaultValue="ananya.soren@example.in" />
                </div>
              </label>
              <label className="form-field">
                <span>Password</span>
                <div className="input-icon">
                  <LockKeyhole size={16} />
                  <input type="password" placeholder="Enter password" defaultValue="prototype2026" />
                </div>
              </label>
            </>
          ) : (
            <>
              <div className="document-ai-banner" style={{ marginBottom: '1rem' }}>
                <span><ShieldCheck size={18} /></span>
                <div>
                  <strong>Aadhaar e-KYC Gateway</strong>
                  <small>Instant biometric / OTP verified citizen login</small>
                </div>
                <Badge tone="blue">e-KYC VERIFIED</Badge>
              </div>
              <label className="form-field">
                <span>12-digit Aadhaar Number</span>
                <div className="input-icon">
                  <Fingerprint size={16} />
                  <input
                    type="text"
                    maxLength={12}
                    placeholder="e.g. 9988 7766 5544"
                    value={aadhaar}
                    onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
              </label>
              <label className="form-field">
                <span>Enter One-Time Password (OTP)</span>
                <div className="input-icon">
                  <LockKeyhole size={16} />
                  <input type="text" maxLength={6} placeholder="Enter 6-digit OTP" defaultValue="123456" />
                </div>
              </label>
            </>
          )}

          {notice && <div className="inline-success"><CheckCircle2 size={16} />{notice}</div>}

          <Button className="auth-submit" icon={ArrowRight} onClick={enter}>
            {authMethod === 'ekyc' ? 'Verify e-KYC & Sign In' : 'Authenticate & Continue'}
          </Button>

          <div className="prototype-notice">
            <ShieldCheck size={16} />
            <span>
              <strong>Authenticated Session</strong>
              <small>Tokens are signed via backend HMAC-SHA256 JWT key and verified with server-side RBAC.</small>
            </span>
          </div>

          <div className="auth-register">
            New to Bhu Setu? <Link to="/register">Create an account <ArrowRight size={14} /></Link>
          </div>
        </div>
        <div className="auth-legal">
          By continuing, you agree to the <a href="#terms">Terms of use</a> and <a href="#privacy">Privacy notice</a>.
        </div>
      </motion.main>
    </div>
  );
}

export function RegisterPage() {
  return (
    <div className="auth-page">
      <motion.aside 
        initial={{ opacity: 0, x: -50 }} 
        animate={{ opacity: 1, x: 0 }} 
        transition={{ duration: 0.6, ease: "easeOut" }} 
        className="auth-aside"
      >
        <Brand />
        <div className="auth-aside-copy">
          <span className="eyebrow">CITIZEN SERVICES</span>
          <h1>Your land<br />services, together.</h1>
          <p>Create a citizen profile to access unified land records and services.</p>
        </div>
        <div className="auth-aside-foot">
          <span>BHARAT · JHARKHAND</span>
          <span>SIH-26014 · AUTH ENGINE</span>
        </div>
      </motion.aside>
      <motion.main 
        initial={{ opacity: 0, x: 50 }} 
        animate={{ opacity: 1, x: 0 }} 
        transition={{ duration: 0.5, delay: 0.1, type: "spring", stiffness: 100, damping: 20 }} 
        className="auth-main"
      >
        <div className="auth-card">
          <div className="auth-mobile-brand"><Brand /></div>
          <span className="eyebrow">GET STARTED</span>
          <h2>Create your account</h2>
          <p className="auth-subtitle">Fill in your profile details to create your digital land access account.</p>
          <label className="form-field"><span>Full name</span><input className="input" placeholder="Enter your name" /></label>
          <label className="form-field"><span>Email address</span><input className="input" placeholder="name@example.in" /></label>
          <label className="form-field"><span>Mobile number</span><input className="input" placeholder="+91 00000 00000" /></label>
          <label className="form-field">
            <span>District</span>
            <select className="input"><option>Khunti</option><option>Ranchi</option><option>Gumla</option><option>Lohardaga</option></select>
          </label>
          <Button className="auth-submit" icon={ArrowRight}>Create Profile</Button>
          <div className="auth-register">Already have access? <Link to="/login">Sign in <ArrowRight size={14} /></Link></div>
        </div>
      </motion.main>
    </div>
  );
}
