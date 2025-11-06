import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Signin() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/Signup");
  }, [navigate]);
  return null;
}
