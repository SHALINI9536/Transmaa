import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db, ref, get, set } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          // 1. Check Custom Claims or Read-Only '/admins/{uid}' Node (Never self-assigned!)
          const tokenResult = await user.getIdTokenResult();
          const claimAdmin = !!tokenResult.claims.admin;
          
          const adminSnap = await get(ref(db, `admins/${user.uid}`));
          const dbAdmin = adminSnap.exists() && adminSnap.val() === true;
          
          setIsAdmin(claimAdmin || dbAdmin);

          // 2. Fetch or initialize user profile (strictly restricted to customer/driver)
          const userRef = ref(db, `users/${user.uid}`);
          const userSnap = await get(userRef);

          if (userSnap.exists()) {
            setUserProfile(userSnap.val());
          } else {
            const defaultProfile = {
              uid: user.uid,
              name: user.displayName || user.phoneNumber || user.email?.split("@")[0] || "Transmaa User",
              email: user.email || "",
              phone: user.phoneNumber || "",
              role: "customer", // Normal registration never grants admin
              createdAt: new Date().toISOString()
            };
            await set(userRef, defaultProfile);
            setUserProfile(defaultProfile);
          }
        } catch (err) {
          console.error("Error loading profile:", err);
        }
      } else {
        setUserProfile(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const refreshProfile = async () => {
    if (!currentUser) return;
    const snap = await get(ref(db, `users/${currentUser.uid}`));
    if (snap.exists()) setUserProfile(snap.val());
  };

  return (
    <AuthContext.Provider value={{ currentUser, userProfile, isAdmin, loading, refreshProfile }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
