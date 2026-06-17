import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Briefcase, Menu, X, LogOut, User, LayoutDashboard, Search, PlusCircle } from 'lucide-react';

function Navbar() {
    const {user, logout} = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate("/login");
    }

    const isActive = (path) => location.pathname.startsWith(path);

    return(
        <nav style={{
      background: 'rgba(10,10,15,0.9)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      <div className="container" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', height:64 }}>
        {/* Logo */}
        <Link to="/" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none' }}>
          <div style={{
            width:34, height:34, background:'var(--accent)', borderRadius:8,
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <Briefcase size={18} color="#fff" />
          </div>
          <span style={{ fontFamily:'var(--font-head)', fontWeight:800, fontSize:20, color:'var(--text)' }}>
            Hire<span style={{ color:'var(--accent)' }}>Hub</span>
          </span>
        </Link>
 
        {/* Desktop Nav */}
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <Link to="/jobs" className={`btn btn-ghost ${isActive('/jobs') ? 'text-accent' : ''}`}
            style={{ color: isActive('/jobs') ? 'var(--accent)' : undefined }}>
            <Search size={15} /> Browse Jobs
          </Link>
 
          {!user ? (
            <>
              <Link to="/login" className="btn btn-ghost">Login</Link>
              <Link to="/register" className="btn btn-primary">Get Started</Link>
            </>
          ) : user.role === 'candidate' ? (
            <>
              <Link to="/candidate/dashboard" className="btn btn-ghost"
                style={{ color: isActive('/candidate') ? 'var(--accent)' : undefined }}>
                <LayoutDashboard size={15} /> Dashboard
              </Link>
              <button onClick={handleLogout} className="btn btn-ghost">
                <LogOut size={15} /> Logout
              </button>
              <div style={{
                width:34, height:34, borderRadius:'50%',
                background:'var(--accent-soft)', border:'1px solid var(--accent-border)',
                display:'flex', alignItems:'center', justifyContent:'center',
                color:'var(--accent)', fontWeight:700, fontSize:13,
                fontFamily:'var(--font-head)',
              }}>
                {user.name[0].toUpperCase()}
              </div>
            </>
          ) : (
            <>
              <Link to="/recruiter/dashboard" className="btn btn-ghost"
                style={{ color: isActive('/recruiter') ? 'var(--accent)' : undefined }}>
                <LayoutDashboard size={15} /> Dashboard
              </Link>
              <Link to="/recruiter/jobs/new" className="btn btn-primary btn-sm">
                <PlusCircle size={14} /> Post Job
              </Link>
              <button onClick={handleLogout} className="btn btn-ghost">
                <LogOut size={15} />
              </button>
            </>
          )}
        </div>
      </div>
    </nav>

     
    )
}

export default Navbar;