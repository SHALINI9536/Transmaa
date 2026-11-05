import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth, signOut } from '../firebase';
import { Truck, LogOut } from 'lucide-react';

export default function Navbar() {
  const { currentUser, userProfile, isAdmin, activeMode } = useAuth();
  const nav = useNavigate();

  const logout = async () => {
    await signOut(auth);
    nav('/');
  };

  return (
    <header className="topbar">
      <div className="max-w-[1500px] mx-auto px-5 min-h-[76px] flex items-center justify-between gap-4">
        <Link to="/" className="brand" aria-label="Transmaa home">
          <span className="brand-icon"><Truck /></span>
          <span><b>TRANSMAA</b><small>LOGISTICS NETWORK</small></span>
        </Link>

        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs sm:text-sm font-semibold text-slate-600">
          <Link to="/" className="hover:text-blue-700">Home</Link>
          <Link to="/about" className="hover:text-blue-700">About</Link>
          <Link to="/services" className="hover:text-blue-700">Services</Link>
          <Link to="/contact" className="hover:text-blue-700">Contact</Link>
        </nav>

        <div className="flex items-center gap-3">
          {currentUser ? (
            <>
              <Link to="/dashboard" className="hidden sm:block text-sm font-semibold text-slate-600">
                {activeMode === 'driver' ? 'Driver workspace' : 'My workspace'}
              </Link>
              {isAdmin && <Link to="/admin" className="hidden sm:block text-sm font-bold text-amber-700">Admin</Link>}
              <div className="hidden lg:block text-right">
                <b className="block text-sm">{userProfile?.name || 'Account'}</b>
                <small className="text-slate-400">{activeMode === 'driver' ? 'Driver mode' : isAdmin ? 'Administrator' : 'Customer mode'}</small>
              </div>
              <button onClick={logout} className="logout-btn"><LogOut size={16} /> <span>Sign out</span></button>
            </>
          ) : (
            <Link to="/login" className="btn-primary">Sign in / Register <span>→</span></Link>
          )}
        </div>
      </div>
    </header>
  );
}
