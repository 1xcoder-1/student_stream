"use client";
// ─────────────────────────────────────────────────────────────────────────────
// src/app/(marketing)/privacy/page.tsx
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { ArrowRight, ArrowLeft, PieChart, Sun, Moon } from "lucide-react";
import Link from "next/link";

const DARK = {
  bg: "#080808", surface: "#111111", surface2: "#181818", surface3: "#1e1e1e",
  border: "#1f1f1f", border2: "#2a2a2a",
  text: "#f0f0f0", text2: "#a0a0a0", text3: "#585858",
  green: "#22c55e", green2: "#16a34a",
  greenDim: "rgba(34,197,94,0.08)", greenBorder: "rgba(34,197,94,0.22)", greenGlow: "rgba(34,197,94,0.14)",
  red: "#ef4444", amber: "#f59e0b",
  navBg: "rgba(8,8,8,0.92)", shadow: "rgba(0,0,0,0.70)",
} as const;
const LIGHT = {
  bg: "#f8f8f6", surface: "#ffffff", surface2: "#f2f2ef", surface3: "#eaeae6",
  border: "#e4e4e0", border2: "#d0d0ca",
  text: "#111111", text2: "#545450", text3: "#888880",
  green: "#16a34a", green2: "#15803d",
  greenDim: "rgba(22,163,74,0.08)", greenBorder: "rgba(22,163,74,0.22)", greenGlow: "rgba(22,163,74,0.10)",
  red: "#dc2626", amber: "#d97706",
  navBg: "rgba(248,248,246,0.92)", shadow: "rgba(0,0,0,0.12)",
} as const;
type T = typeof DARK | typeof LIGHT;
type TK = "dark" | "light";

const PAGE_CSS = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{--font-display:var(--font-inter),system-ui,sans-serif;--font-mono:var(--font-jetbrains-mono),'Courier New',monospace}
  @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
  a{color:inherit;text-decoration:none}
  ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#2a2a2a;border-radius:3px}
  *{scrollbar-width:thin;scrollbar-color:#2a2a2a transparent}
  @media(max-width:768px){
    .nav-links{display:none!important}
    .footer-row{flex-direction:column!important;text-align:center!important;gap:16px!important}
    .nav-wrap{padding:0 16px!important}
    .legal-section{flex-direction:column!important;gap:8px!important}
    .legal-num{min-width:auto!important}
  }
  @media(max-width:480px){
    .legal-content{padding:56px 16px 80px!important}
  }
`;

function PageNav({ t, themeKey, toggle }: { t: T; themeKey: TK; toggle: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <nav className="nav-wrap" style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 48px", height: 62, background: scrolled ? t.navBg : "transparent", borderBottom: scrolled ? `1px solid ${t.border}` : "none", backdropFilter: scrolled ? "blur(14px)" : "none", WebkitBackdropFilter: scrolled ? "blur(14px)" : "none", transition: "all 0.35s" }}>
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
        <img src="/icon.svg" alt="Student Stream" width={28} height={28} style={{ borderRadius: 7, flexShrink: 0, display: "block" }} />
        <span style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 800, color: t.text, letterSpacing: -0.5 }}>Student Stream</span>
      </Link>

      <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: 24 }}>
        {[["Home", "/"], ["Features", "/#features"], ["Dashboard", "/dashboard"]].map(([l, h]) => (
          <Link key={l} href={h} style={{ fontSize: 13, color: t.text2, fontWeight: 500, fontFamily: "var(--font-display)", transition: "color 0.2s" }}
            onMouseEnter={e => (e.currentTarget.style.color = t.text)}
            onMouseLeave={e => (e.currentTarget.style.color = t.text2)}>{l}</Link>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <button onClick={toggle} aria-label="Toggle theme" style={{ width: 32, height: 32, border: `1px solid ${t.border2}`, borderRadius: 7, background: t.surface2, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s" }}>
          {themeKey === "dark" ? <Sun size={13} color={t.text2} /> : <Moon size={13} color={t.text2} />}
        </button>
        <Link href="/sign-up" style={{ background: t.green, color: "#000", borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 700, fontFamily: "var(--font-display)", display: "flex", alignItems: "center", gap: 6, transition: "background 0.2s" }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = t.green2}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = t.green}>
          Get Started <ArrowRight size={12} />
        </Link>
      </div>
    </nav>
  );
}

function PageFooter({ t }: { t: T }) {
  return (
    <footer style={{ borderTop: `1px solid ${t.border}`, padding: "36px 24px" }}>
      <div className="footer-row" style={{ maxWidth: 1080, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <img src="/icon.svg" alt="Student Stream" width={24} height={24} style={{ borderRadius: 5, display: "block" }} />
          <span style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 800, color: t.text }}>Student Stream</span>
        </div>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
          {[["Home", "/"], ["Privacy", "/privacy"], ["Terms", "/terms"], ["GitHub", "https://github.com/1xcoder-1/student_streamr"]].map(([l, h]) => (
            <a key={l} href={h} target={h.startsWith("http") ? "_blank" : "_self"} rel={h.startsWith("http") ? "noopener" : ""} style={{ fontSize: 12, color: t.text3, fontFamily: "var(--font-mono)", transition: "color 0.2s" }} onMouseEnter={e => (e.currentTarget.style.color = t.green)} onMouseLeave={e => (e.currentTarget.style.color = t.text3)}>{l}</a>
          ))}
        </div>
        <p style={{ fontSize: 11, color: t.text3, fontFamily: "var(--font-mono)" }}>© 2026 Student Stream · MIT License</p>
      </div>
    </footer>
  );
}

function Label({ text, t }: { text: string; t: T }) {
  return <span style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: t.green, fontFamily: "var(--font-mono)", display: "block", marginBottom: 14 }}>// {text}</span>;
}

function PrivacyPage() {
  const [themeKey, setThemeKey] = useState<TK>("dark");
  useEffect(() => { setThemeKey((localStorage.getItem("substream-theme") as TK) || "dark"); }, []);
  const toggle = () => { const n = themeKey === "dark" ? "light" : "dark" as TK; setThemeKey(n); localStorage.setItem("substream-theme", n); };
  const t = themeKey === "dark" ? DARK : LIGHT;

  const sections = [
    {
      title: "Information We Collect",
      body: "Student Stream collects the minimum information necessary to provide the service. This includes your email address for account creation, student expense data you manually enter (item names, amounts, categories, frequencies, roommates details), and usage metadata such as feature interactions. We do not collect bank accounts, credit card passwords, or financial logins.",
    },
    {
      title: "How We Use Your Information",
      body: "Your data is used solely to: (1) provide and improve the Student Stream service, (2) send due date alerts and notifications you have opted into, and (3) generate Gemini AI-powered budget coaching summaries using your expense data. We never sell, rent, or share your personal data with third parties.",
    },
    {
      title: "Data Storage & Security",
      body: "All expense data is stored in your secure Supabase PostgreSQL database. Student Stream uses Row Level Security (RLS) to ensure users can only access their own data. Data is encrypted in transit (TLS 1.3) and at rest (AES-256) using Supabase's secure cloud infrastructure.",
    },
    {
      title: "AI Features (Gemini)",
      body: "When you use AI auto-fill or AI Budget Coach summaries, your expense details are processed using Google Gemini. Student Stream does not store these API requests beyond the immediate session. Gemini AI features are entirely optional and secure.",
    },
    {
      title: "Cookies & Tracking",
      body: "Student Stream uses only functional cookies necessary for authentication (Supabase session tokens) and your theme preference (localStorage). We do not use advertising cookies, third-party tracking scripts, or behavioral tracking services.",
    },
    {
      title: "Data Retention & Deletion",
      body: "Your data is retained until you delete your account. You can request deletion of your account at any time, which permanently removes all your personal details and expenses. We do not retain backup copies of deleted data.",
    },
    {
      title: "Your Rights",
      body: "You have the right to access all data we hold about you, correct inaccurate information, request deletion of your data, and export your data in standard formats (JSON, CSV). Contact us at privacy@studentstream.io to exercise any of these rights.",
    },
    {
      title: "Contact",
      body: "For privacy questions or requests, contact us at privacy@studentstream.io or open an issue on our GitHub repository. We respond to all privacy requests within 30 days.",
    },
  ];

  return (
    <div style={{ background: t.bg, color: t.text, fontFamily: "var(--font-display)", minHeight: "100vh", overflowX: "hidden", transition: "background 0.4s" }}>
      <style>{PAGE_CSS}</style>
      <PageNav t={t} themeKey={themeKey} toggle={toggle} />
      <main style={{ paddingTop: 62 }}>
        <div className="legal-content" style={{ maxWidth: 780, margin: "0 auto", padding: "80px 24px 100px" }}>
          <div style={{ marginBottom: 48, animation: "fadeUp 0.6s ease both" }}>
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                color: t.text2,
                fontFamily: "var(--font-mono)",
                marginBottom: 20,
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = t.green)}
              onMouseLeave={(e) => (e.currentTarget.style.color = t.text2)}
            >
              <ArrowLeft size={14} /> Back to Home
            </Link>
            <br />
            <Label text="Legal" t={t} />
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(34px,5vw,56px)", fontWeight: 800, letterSpacing: -2, color: t.text, marginBottom: 14, lineHeight: 1.06 }}>Privacy Policy</h1>
            <p style={{ fontSize: 13.5, color: t.text2, fontFamily: "var(--font-mono)", lineHeight: 1.75 }}>Last updated: March 24, 2026 · Student Stream is built with privacy-first principles. We collect the minimum data necessary, store it in your own database, and never sell it.</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {sections.map((s, i) => (
              <div key={i} className="legal-section" style={{ padding: "30px 0", borderBottom: `1px solid ${t.border}`, display: "flex", gap: 22 }}>
                <span className="legal-num" style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: t.green, letterSpacing: "0.1em", marginTop: 4, flexShrink: 0, minWidth: 28 }}>{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 700, color: t.text, marginBottom: 12, letterSpacing: -0.3 }}>{s.title}</h2>
                  <p style={{ fontSize: 14, color: t.text2, fontFamily: "var(--font-mono)", lineHeight: 1.82 }}>{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <PageFooter t={t} />
    </div>
  );
}

export default PrivacyPage;
