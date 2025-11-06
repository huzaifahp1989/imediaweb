import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFirebase, watchAuth, isAdminUser } from "@/api/firebase";
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
      // If Firebase is not configured, do not attempt Base44 fallback; redirect to Home
      setAllowed(false);
      setChecked(true);
      navigate(createPageUrl("Home"));
    }
    return () => unsub && unsub();
  }, [navigate]);

  if (!checked) return null;
  if (!allowed) return null;
  return children;
}
