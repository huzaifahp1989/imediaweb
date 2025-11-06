import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFirebase, watchAuth, isAdminUser } from "@/api/firebase";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";

export default function AdminGuard({ children }) {
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let unsub = () => {};
    const { app } = getFirebase();
    if (app) {
      unsub = watchAuth(async () => {
        const ok = await isAdminUser();
        setAllowed(ok);
        setChecked(true);
        if (!ok) navigate(createPageUrl("AdminLogin"));
      });
    } else {
      // Fallback to Base44 auth/role if Firebase not configured
      (async () => {
        try {
          const authenticated = await base44.auth.isAuthenticated();
          if (!authenticated) {
            setAllowed(false);
            setChecked(true);
            navigate(createPageUrl("Home"));
            return;
          }
          const me = await base44.auth.me();
          const ok = me.role === 'admin';
          setAllowed(ok);
          setChecked(true);
          if (!ok) navigate(createPageUrl("Home"));
        } catch (e) {
          setAllowed(false);
          setChecked(true);
          navigate(createPageUrl("Home"));
        }
      })();
    }
    return () => unsub && unsub();
  }, [navigate]);

  if (!checked) return null;
  if (!allowed) return null;
  return children;
}

