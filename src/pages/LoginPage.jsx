import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  auth,
  db,
  ref,
  get,
  set,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  getAdditionalUserInfo
} from "../firebase";
import { useAuth } from "../context/AuthContext";
import {
  Mail,
  Lock,
  ShieldAlert,
  CheckCircle2,
  Truck,
  Chrome,
  ArrowRight,
  User
} from "lucide-react";

export default function LoginPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("email");
  const [emailMode, setEmailMode] = useState("signin");
  const [selectedRole, setSelectedRole] = useState("customer");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (currentUser) navigate("/dashboard");
  }, [currentUser, navigate]);

  const syncUserProfile = async (user, customName = "", chosenRole = "customer", isNewAccount = false) => {
    const userRef = ref(db, `users/${user.uid}`);
    const snap = await get(userRef);
    const safeRole = "customer";
    const profile = {
      uid: user.uid,
      name: customName || user.displayName || user.email?.split("@")[0] || "Transmaa User",
      email: user.email || "",
      phone: user.phoneNumber || "",
      role: safeRole,
      driverStatus: "not_registered",
      createdAt: new Date().toISOString()
    };

    // A new public account may be a customer or driver, never an admin.
    if (!snap.exists() || isNewAccount) {
      if (snap.exists()) profile.createdAt = snap.val().createdAt || profile.createdAt;
      await set(userRef, profile);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);

    try {
      if (emailMode === "signup") {
        const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await syncUserProfile(result.user, fullName.trim(), selectedRole, true);
        navigate("/dashboard");
      } else if (emailMode === "signin") {
        await signInWithEmailAndPassword(auth, email.trim(), password);
        navigate("/dashboard");
      } else {
        await sendPasswordResetEmail(auth, email.trim());
        setMessage("Password reset link sent. Please check your email inbox.");
      }
    } catch (err) {
      const messages = {
        "auth/email-already-in-use": "This email already has an account. Please sign in.",
        "auth/invalid-email": "Please enter a valid email address.",
        "auth/weak-password": "Please use a password with at least 6 characters.",
        "auth/invalid-credential": "Email or password is incorrect.",
        "auth/user-not-found": "No account found with this email.",
        "auth/wrong-password": "Incorrect password. Please try again.",
        "auth/too-many-requests": "Too many attempts. Please wait and try again."
      };
      setError(messages[err.code] || err.message.replace("Firebase:", "").trim());
    } finally {
      setBusy(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setMessage("");
    setBusy(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const isNewUser = !!getAdditionalUserInfo(result)?.isNewUser;
      await syncUserProfile(result.user, result.user.displayName, selectedRole, isNewUser);
      navigate("/dashboard");
    } catch (err) {
      const messages = {
        "auth/popup-closed-by-user": "Google sign-in was cancelled. Please try again.",
        "auth/unauthorized-domain": "This website domain is not authorized in Firebase Authentication settings."
      };
      setError(messages[err.code] || err.message.replace("Firebase:", "").trim());
    } finally {
      setBusy(false);
    }
  };

  const changeTab = (tab) => {
    setActiveTab(tab);
    setError("");
    setMessage("");
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950">
      <div className="max-w-4xl w-full grid md:grid-cols-5 bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="md:col-span-2 bg-blue-700 text-white p-8 flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center space-x-2 bg-blue-800/60 px-3 py-1.5 rounded-full text-xs font-semibold mb-6">
              <Truck className="w-4 h-4" />
              <span>Transmaa Logistics Security</span>
            </div>
            <h2 className="text-2xl font-bold leading-snug mb-3">
              India's Smart Freight &amp; Transport Booking Hub
            </h2>
            <p className="text-blue-100 text-sm leading-relaxed">
              Book verified trucks, track cargo consignments, and manage fleet operations with secure Firebase authentication.
            </p>
          </div>
          <div className="space-y-3 mt-8 text-xs border-t border-blue-600 pt-6">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>Secure Google Account Sign-In</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>Email + Password Registration</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>Email Password Reset</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />
              <span>Strict Admin Authorization Protection</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-3 p-8">
          <h3 className="text-xl font-bold text-slate-900 mb-1">Welcome to Transmaa</h3>
          <p className="text-xs text-slate-500 mb-6">
            Sign in to access bookings, fleet dashboard, driver portal, or admin controls.
          </p>

          <div className="mb-5 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <label className="block text-xs font-semibold text-slate-600 mb-2">
              New accounts start in Customer mode:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedRole("customer")}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border transition ${selectedRole === "customer" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"}`}
              >
                📦 Customer account
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole("driver")}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border transition ${selectedRole === "driver" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"}`}
              >
                🚛 Apply as driver later
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-6 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => changeTab("email")}
              className={`flex items-center justify-center space-x-1.5 py-2 rounded-lg text-xs font-semibold transition ${activeTab === "email" ? "bg-white text-blue-600 shadow" : "text-slate-600 hover:text-slate-900"}`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email + Password</span>
            </button>
            <button
              type="button"
              onClick={() => changeTab("google")}
              className={`flex items-center justify-center space-x-1.5 py-2 rounded-lg text-xs font-semibold transition ${activeTab === "google" ? "bg-white text-blue-600 shadow" : "text-slate-600 hover:text-slate-900"}`}
            >
              <Chrome className="w-3.5 h-3.5" />
              <span>Google Login</span>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {message && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {activeTab === "email" && (
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {emailMode === "signup" && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      autoComplete="name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Gmail / Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@gmail.com"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              {emailMode !== "reset" && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      autoComplete={emailMode === "signup" ? "new-password" : "current-password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={emailMode === "signup" ? "Create a password (min. 6 characters)" : "Enter your password"}
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              )}
              <button
                type="submit"
                disabled={busy}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center space-x-2 transition shadow"
              >
                <span>
                  {busy ? "Processing..." : emailMode === "signin" ? "Sign In with Email" : emailMode === "signup" ? "Create Account" : "Send Password Reset Link"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <div className="flex justify-between text-xs text-slate-600 pt-2">
                {emailMode === "signin" ? (
                  <>
                    <button type="button" onClick={() => { setEmailMode("signup"); setError(""); setMessage(""); }} className="text-blue-600 font-semibold hover:underline">
                      Create new account
                    </button>
                    <button type="button" onClick={() => { setEmailMode("reset"); setError(""); setMessage(""); }} className="text-slate-500 hover:underline">
                      Forgot password?
                    </button>
                  </>
                ) : (
                  <button type="button" onClick={() => { setEmailMode("signin"); setError(""); setMessage(""); }} className="text-blue-600 font-semibold hover:underline">
                    ← Back to Sign In
                  </button>
                )}
              </div>
            </form>
          )}

          {activeTab === "google" && (
            <div className="space-y-4 text-center py-4">
              <p className="text-xs text-slate-600">
                Use your Google Account for secure, one-click authentication on Transmaa Logistics.
              </p>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={busy}
                className="w-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 py-3 rounded-xl text-sm font-semibold flex items-center justify-center space-x-2 shadow-sm transition"
              >
                <Chrome className="w-5 h-5 text-blue-600" />
                <span>{busy ? "Connecting to Google..." : "Continue with Google"}</span>
              </button>
            </div>
          )}
          <p className="mt-6 text-[11px] leading-relaxed text-slate-400 text-center">
            Email registration uses a Transmaa password. We never ask for or store your Google account password.
          </p>
        </div>
      </div>
    </div>
  );
}
