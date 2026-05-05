import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { ShieldX, ArrowLeft, LogIn } from 'lucide-react';

export default function Unauthorized() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleGoToDashboard = () => {
    if (user?.role) {
      navigate(`/${user.role}/dashboard`, { replace: true });
    } else {
      navigate('/student/login', { replace: true });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/student/login', { replace: true });
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
        fontFamily: "'DM Sans', sans-serif",
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');`}</style>

      {/* Decorative blobs */}
      <div style={{ position: 'absolute', top: '-120px', right: '-120px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(239,68,68,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-100px', left: '-100px', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          background: 'rgba(30, 41, 59, 0.85)',
          border: '1.5px solid rgba(239,68,68,0.25)',
          borderRadius: '24px',
          padding: '56px 48px',
          maxWidth: '480px',
          width: '100%',
          textAlign: 'center',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          style={{
            width: '88px',
            height: '88px',
            borderRadius: '50%',
            background: 'rgba(239,68,68,0.12)',
            border: '2px solid rgba(239,68,68,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 28px',
          }}
        >
          <ShieldX size={40} color="#EF4444" />
        </motion.div>

        {/* Error code */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#EF4444', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '12px' }}>
            403 — Unauthorized
          </div>

          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#F1F5F9', margin: '0 0 12px', lineHeight: 1.2 }}>
            Access Denied
          </h1>

          <p style={{ fontSize: '14px', color: '#94A3B8', lineHeight: 1.7, margin: '0 0 36px' }}>
            You don't have permission to view this page. This area is restricted to authorized roles only. Please go back to your own dashboard.
          </p>

          {/* User info pill */}
          {user && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '20px',
              padding: '6px 14px',
              marginBottom: '28px',
              fontSize: '12px',
              color: '#94A3B8',
            }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
              Signed in as <strong style={{ color: '#E2E8F0', marginLeft: '2px' }}>{user.name || user.email}</strong>
              <span style={{ color: '#475569', margin: '0 2px' }}>·</span>
              <span style={{ color: '#60A5FA', fontWeight: '600', textTransform: 'capitalize' }}>{user.role}</span>
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoToDashboard}
              style={{
                width: '100%',
                padding: '13px',
                background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '700',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              <ArrowLeft size={16} />
              Go to My Dashboard
            </motion.button>

            {!user && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/student/login', { replace: true })}
                style={{
                  width: '100%',
                  padding: '13px',
                  background: 'transparent',
                  color: '#94A3B8',
                  border: '1.5px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                <LogIn size={16} />
                Sign In
              </motion.button>
            )}

            {user && (
              <button
                onClick={handleLogout}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#475569',
                  fontSize: '13px',
                  cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif",
                  padding: '4px',
                  textDecoration: 'underline',
                  textUnderlineOffset: '3px',
                }}
              >
                Sign out and switch account
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
