"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  LayoutDashboard, Sparkles, ToggleLeft, Download, Search, Shield,
  ArrowRight, Check, X, ChevronDown, ChevronUp,
  TrendingUp, Zap, Sun, Moon, Menu, PieChart, Bell, CreditCard,
  BarChart3, ArrowUpRight, Lock, Globe, RefreshCw, Target, Star, Command, Users
} from "lucide-react";
import Link from "next/link";
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ─── Theme tokens ─────────────────────────────────────────────────────────────
const DARK = {
  bg: "#080808", surface: "#111111", surface2: "#181818", surface3: "#1e1e1e",
  border: "#1f1f1f", border2: "#2a2a2a",
  text: "#f0f0f0", text2: "#a0a0a0", text3: "#9b9494ff",
  green: "#22c55e", green2: "#16a34a",
  greenDim: "rgba(34,197,94,0.08)", greenBorder: "rgba(34,197,94,0.22)", greenGlow: "rgba(34,197,94,0.14)",
  red: "#ef4444", amber: "#f59e0b",
  navBg: "rgba(8,8,8,0.92)", shadow: "rgba(0,0,0,0.7)", grid: "rgba(255,255,255,0.025)",
} as const;
const LIGHT = {
  bg: "#f8f8f6", surface: "#ffffff", surface2: "#f2f2ef", surface3: "#eaeae6",
  border: "#e4e4e0", border2: "#d0d0ca",
  text: "#111111", text2: "#545450", text3: "#888880",
  green: "#16a34a", green2: "#15803d",
  greenDim: "rgba(22,163,74,0.08)", greenBorder: "rgba(22,163,74,0.22)", greenGlow: "rgba(22,163,74,0.10)",
  red: "#dc2626", amber: "#d97706",
  navBg: "rgba(248,248,246,0.92)", shadow: "rgba(0,0,0,0.12)", grid: "rgba(0,0,0,0.04)",
} as const;
type Theme = typeof DARK | typeof LIGHT;
type ThemeKey = "dark" | "light";

// ─── Hooks ────────────────────────────────────────────────────────────────────
function useInView(threshold = 0.10) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, vis };
}

// ─── Counter ──────────────────────────────────────────────────────────────────
function Counter({ to, prefix = "", suffix = "", duration = 1600 }: { to: number; prefix?: string; suffix?: string; duration?: number }) {
  const [val, setVal] = useState(0);
  const { ref, vis } = useInView(0.4);
  useEffect(() => {
    if (!vis) return;
    let t0: number | null = null;
    const tick = (ts: number) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / duration, 1);
      setVal(Math.floor((1 - Math.pow(1 - p, 3)) * to));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [vis, to, duration]);
  return <span ref={ref}>{prefix}{val.toLocaleString()}{suffix}</span>;
}

// ─── Scroll reveal ────────────────────────────────────────────────────────────
function Reveal({ children, delay = 0, y = 24 }: { children: React.ReactNode; delay?: number; y?: number }) {
  const { ref, vis } = useInView(0.07);
  return (
    <div ref={ref} style={{ opacity: vis ? 1 : 0, transform: vis ? `translateY(0px)` : `translateY(${y}px)`, transition: `opacity 0.70s ease ${delay}ms, transform 0.70s cubic-bezier(0.34,1.1,0.64,1) ${delay}ms` }}>
      {children}
    </div>
  );
}

// ─── Section label ────────────────────────────────────────────────────────────
function Label({ text, t }: { text: string; t: Theme }) {
  return <span style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: t.green, fontFamily: "var(--font-mono)", display: "block", marginBottom: 14 }}>// {text}</span>;
}

// ─── Ticker ───────────────────────────────────────────────────────────────────
function Ticker({ t }: { t: Theme }) {
  const items = ["Real-time Analytics", "AI-Powered Insights", "Subscription Tracking", "Simulation Mode", "Export PDF · CSV · JSON", "Supabase Auth", "Open Source MIT", "Smart Renewal Alerts", "Category Breakdown", "Zero Hidden Fees", "Multi-Currency Support", "Spending Goals", "Custom Categories", "Dark & Light Theme"];
  return (
    <div style={{ overflow: "hidden", borderTop: `1px solid ${t.border}`, borderBottom: `1px solid ${t.border}`, background: t.surface, padding: "11px 0" }}>
      <div style={{ display: "flex", animation: "ticker 40s linear infinite", whiteSpace: "nowrap" }}>
        {[...items, ...items, ...items].map((item, i) => (
          <span key={i} style={{ fontSize: 10, color: t.text3, padding: "0 26px", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "var(--font-mono)", display: "inline-flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: t.green, fontSize: 7 }}>◆</span> {item}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Mini bar chart (Dashboard Preview) ──────────────────────────────────────
function MiniBars({ t }: { t: Theme }) {
  const months = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
  const vals = [29, 31, 27, 34, 42, 38, 31, 46, 39, 35, 43, 38];
  const max = Math.max(...vals);
  const { ref, vis } = useInView(0.2);
  return (
    <div ref={ref} style={{ flex: 1, padding: "16px 16px 12px", borderRight: `1px solid ${t.border}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
        <BarChart3 size={10} color={t.green} />
        <span style={{ fontSize: 8.5, color: t.text3, fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Monthly Spending</span>
        <span style={{ marginLeft: "auto", fontSize: 8, color: t.green, fontFamily: "var(--font-mono)" }}>+12.4%</span>
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 64 }}>
        {vals.map((v, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <div style={{ width: "100%", background: t.surface3, borderRadius: 2, height: 52, display: "flex", alignItems: "flex-end", overflow: "hidden" }}>
              <div style={{ width: "100%", borderRadius: 2, background: i === 11 ? t.green : i === 7 ? `${t.green}88` : `${t.green}35`, height: vis ? `${(v / max) * 100}%` : "0%", transition: `height 0.65s cubic-bezier(0.34,1.4,0.64,1) ${i * 45}ms` }} />
            </div>
            <span style={{ fontSize: 6, color: t.text3, fontFamily: "var(--font-mono)" }}>{months[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Mini donut (Dashboard Preview) ──────────────────────────────────────────
function MiniDonut({ t }: { t: Theme }) {
  const segs = [{ p: 33 }, { p: 28 }, { p: 22 }, { p: 17 }];
  const colors = [t.green, `${t.green}bb`, `${t.green}66`, t.border2];
  const { ref, vis } = useInView(0.2);
  const r = 34, cx = 44, cy = 44, circ = 2 * Math.PI * r;
  let cum = 0;
  return (
    <div ref={ref} style={{ padding: "16px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
      <svg width="88" height="88" viewBox="0 0 88 88">
        {segs.map((seg, i) => {
          const dash = vis ? (seg.p / 100) * circ : 0, off = -((cum / 100) * circ);
          cum += seg.p;
          return <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={colors[i]} strokeWidth="12" strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={off} style={{ transition: `stroke-dasharray 0.85s ease ${i * 120}ms`, transform: "rotate(-90deg)", transformOrigin: `${cx}px ${cy}px` }} />;
        })}
        <text x={cx} y={cy - 4} textAnchor="middle" fill={t.text} fontSize="10" fontFamily="var(--font-display)" fontWeight="700">$388</text>
        <text x={cx} y={cy + 8} textAnchor="middle" fill={t.text3} fontSize="6.5" fontFamily="var(--font-mono)">/month</text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {["Dev Tools", "Design", "Cloud", "Other"].map((label, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: 1.5, background: colors[i], flexShrink: 0 }} />
            <span style={{ fontSize: 9, color: t.text2, fontFamily: "var(--font-mono)" }}>{label}</span>
            <span style={{ fontSize: 9, color: t.text, fontFamily: "var(--font-mono)", marginLeft: "auto" }}>{segs[i].p}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Dashboard Preview ────────────────────────────────────────────────────────
function DashPreview({ t }: { t: Theme }) {
  const rows = [
    { name: "FAST University Tuition", cat: "Academics & Fees", amt: "Rs 180,000", warn: false, due: "15d" },
    { name: "Hostel Room Rent", cat: "Hostel & Rent", amt: "Rs 12,000", warn: true, due: "2d" },
    { name: "Monthly Mess Meal", cat: "Food & Mess", amt: "Rs 6,500", warn: false, due: "8d" },
    { name: "Zong Weekly Blockbuster", cat: "Mobile & Internet", amt: "Rs 420", warn: false, due: "1d" },
  ];
  return (
    <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 16, overflow: "hidden", width: "100%", maxWidth: 840, boxShadow: `0 48px 120px ${t.shadow}, 0 0 0 1px ${t.greenBorder}` }}>
      {/* Chrome bar */}
      <div style={{ background: t.surface2, borderBottom: `1px solid ${t.border}`, padding: "10px 18px", display: "flex", alignItems: "center", gap: 7 }}>
        {["#ff5f57", "#ffbd2e", "#28ca42"].map((c, i) => <span key={i} style={{ width: 9, height: 9, borderRadius: "50%", background: c, display: "block" }} />)}
        <span style={{ flex: 1, textAlign: "center", fontSize: 9.5, color: t.text3, fontFamily: "var(--font-mono)" }}>studentstream.vercel.app  Dashboard</span>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: t.green, animation: "pulse 2s ease-in-out infinite" }} />
      </div>
      {/* KPI row */}
      <div style={{ padding: "14px 18px", borderBottom: `1px solid ${t.border}`, display: "flex", gap: 24, flexWrap: "wrap" }}>
        {[{ l: "Monthly Commitments", v: "Rs 18,920", I: CreditCard }, { l: "Active Expenses", v: "8", I: Zap }, { l: "Annual Projection", v: "Rs 227,040", I: TrendingUp }, { l: "Due Soon", v: "Hostel · 2d", I: Bell }].map(({ l, v, I }, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <I size={9} color={t.green} />
              <span style={{ fontSize: 8.5, color: t.text3, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>{l}</span>
            </div>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 800, color: t.text, lineHeight: 1, letterSpacing: -0.5 }}>{v}</span>
          </div>
        ))}
      </div>
      {/* Charts */}
      <div className="dash-chart-row" style={{ display: "flex", borderBottom: `1px solid ${t.border}`, flexWrap: "wrap" }}>
        <MiniBars t={t} />
        <MiniDonut t={t} />
      </div>
      {/* Table */}
      <div>
        <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1.5fr 1fr 0.8fr", padding: "9px 18px", borderBottom: `1px solid ${t.border}` }}>
          {["Service", "Category", "Amount", "Renews"].map(h => <span key={h} style={{ fontSize: 8.5, color: t.text3, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>{h}</span>)}
        </div>
        {rows.map((row, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "1.8fr 1.5fr 1fr 0.8fr", padding: "10px 18px", borderBottom: i < rows.length - 1 ? `1px solid ${t.border}` : "none", animation: `fadeSlideUp 0.4s ease ${0.1 + i * 0.07}s both` }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: t.text, fontFamily: "var(--font-display)" }}>{row.name}</span>
            <span style={{ fontSize: 10.5, color: t.text2, fontFamily: "var(--font-mono)" }}>{row.cat}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: t.text, fontFamily: "var(--font-mono)" }}>{row.amt}</span>
            <span style={{ fontSize: 9.5, borderRadius: 3, padding: "2px 6px", fontFamily: "var(--font-mono)", display: "inline-block", width: "fit-content", color: row.warn ? t.amber : t.green, background: row.warn ? "rgba(245,158,11,0.10)" : t.greenDim }}>in {row.due}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Feature card ─────────────────────────────────────────────────────────────
function FeatCard({ Icon, title, desc, tag, t }: { Icon: React.ElementType; title: string; desc: string; tag?: string; t: Theme }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ background: hov ? t.surface2 : t.bg, padding: "32px 28px", position: "relative", transition: "background 0.2s, transform 0.2s", transform: hov ? "translateY(-2px)" : "translateY(0px)" }}>
      {tag && <span style={{ position: "absolute", top: 22, right: 20, fontSize: 9, color: t.green, letterSpacing: "0.12em", textTransform: "uppercase", background: t.greenDim, border: `1px solid ${t.greenBorder}`, borderRadius: 4, padding: "3px 8px", fontFamily: "var(--font-mono)" }}>{tag}</span>}
      <div style={{ width: 40, height: 40, borderRadius: 10, background: t.greenDim, border: `1px solid ${t.greenBorder}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
        <Icon size={17} color={t.green} strokeWidth={1.5} />
      </div>
      <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: t.text, marginBottom: 10, letterSpacing: -0.3 }}>{title}</h3>
      <p style={{ fontSize: 13, color: t.text2, lineHeight: 1.72, fontFamily: "var(--font-mono)" }}>{desc}</p>
    </div>
  );
}

// ─── Comparison table ─────────────────────────────────────────────────────────
type CV = boolean | string;
const COMPARE = [
  { f: "Real-time Dashboard", sub: true, sheet: false, truebill: true, rocket: true, gen: false },
  { f: "AI Auto-Fill", sub: true, sheet: false, truebill: false, rocket: false, gen: false },
  { f: "Spending Simulation", sub: true, sheet: false, truebill: false, rocket: false, gen: false },
  { f: "Category Analytics", sub: true, sheet: "Manual", truebill: true, rocket: true, gen: false },
  { f: "Export JSON / CSV / PDF", sub: true, sheet: "Partial", truebill: false, rocket: false, gen: "Partial" },
  { f: "Self-Hosted Option", sub: true, sheet: false, truebill: false, rocket: false, gen: false },
  { f: "Open Source", sub: true, sheet: false, truebill: false, rocket: false, gen: false },
  { f: "Renewal Alerts", sub: true, sheet: false, truebill: true, rocket: true, gen: true },
  { f: "Own Database", sub: true, sheet: false, truebill: false, rocket: false, gen: false },
  { f: "Spending Goals", sub: true, sheet: false, truebill: true, rocket: true, gen: false },
  { f: "Free Forever", sub: true, sheet: true, truebill: false, rocket: false, gen: true },
  { f: "Bank Auto-Detection", sub: false, sheet: false, truebill: true, rocket: true, gen: false },
];
function CCell({ v }: { v: CV }) {
  if (v === true) return <Check size={14} color="#22c55e" />;
  if (v === false) return <X size={13} color="#ef4444" style={{ opacity: 0.5 }} />;
  return <span style={{ fontSize: 10.5, fontFamily: "var(--font-mono)", color: "#f59e0b" }}>{v}</span>;
}
function CompareTable({ t }: { t: Theme }) {
  const cols = [{ l: "StudentStream", hi: true }, { l: "Spreadsheet", hi: false }, { l: "Truebill", hi: false }, { l: "Diary Ledger", hi: false }, { l: "Generic Apps", hi: false }];
  return (
    <div style={{ overflowX: "auto", borderRadius: 14, border: `1px solid ${t.border}`, boxShadow: `0 20px 60px ${t.shadow}` }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 580 }}>
        <thead>
          <tr style={{ background: t.surface2 }}>
            <th style={{ padding: "13px 20px", textAlign: "left", fontSize: 10.5, color: t.text3, fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 400, borderBottom: `1px solid ${t.border}` }}>Feature</th>
            {cols.map((c, i) => (
              <th key={i} style={{ padding: "13px 16px", textAlign: "center", fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: c.hi ? 600 : 400, color: c.hi ? t.green : t.text2, letterSpacing: "0.06em", borderBottom: `1px solid ${t.border}`, background: c.hi ? t.greenDim : "transparent", borderTop: c.hi ? `2px solid ${t.green}` : "2px solid transparent", position: "relative" }}>
                {c.hi && <span style={{ position: "absolute", top: -2, left: 0, right: 0, height: 2, background: t.green, borderRadius: "2px 2px 0 0" }} />}
                {c.l}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {COMPARE.map((row, ri) => (
            <tr key={ri} style={{ background: ri % 2 === 0 ? t.surface : t.surface2 }}>
              <td style={{ padding: "12px 20px", fontSize: 13, color: t.text, fontFamily: "var(--font-display)", borderBottom: `1px solid ${t.border}` }}>{row.f}</td>
              {[row.sub, row.sheet, row.truebill, row.rocket, row.gen].map((v, ci) => (
                <td key={ci} style={{ padding: "12px 16px", textAlign: "center", borderBottom: `1px solid ${t.border}`, background: ci === 0 ? t.greenDim : "transparent" }}><CCell v={v} /></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Price card ───────────────────────────────────────────────────────────────
function PriceCard({ plan, price, sub, desc, features, highlight, t, cta, href }: { plan: string; price: string; sub: string; desc: string; features: string[]; highlight?: boolean; t: Theme; cta: string; href: string }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: highlight ? t.surface2 : t.surface, border: `1px solid ${highlight ? t.greenBorder : t.border}`, borderRadius: 16, padding: "40px 32px", position: "relative", flex: 1, minWidth: 280, display: "flex", flexDirection: "column", transition: "transform 0.22s, box-shadow 0.22s", transform: hov ? "translateY(-5px)" : "translateY(0px)", boxShadow: hov ? `0 36px 80px ${t.shadow}, 0 0 0 1px ${t.greenBorder}` : highlight ? `0 0 0 1px ${t.greenBorder}, 0 24px 64px ${t.greenGlow}` : "none" }}>
      {highlight && (
        <span style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: t.green, color: "#000", fontSize: 9.5, fontWeight: 700, padding: "5px 18px", borderRadius: 999, fontFamily: "var(--font-mono)", letterSpacing: "0.1em", whiteSpace: "nowrap", boxShadow: `0 4px 16px ${t.greenGlow}` }}>RECOMMENDED</span>
      )}
      <div style={{ marginBottom: 24 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: highlight ? t.green : t.text3, letterSpacing: "0.18em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>{plan}</span>
        <p style={{ fontSize: 12.5, color: t.text3, fontFamily: "var(--font-mono)", lineHeight: 1.6 }}>{desc}</p>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8, paddingBottom: 24, borderBottom: `1px solid ${t.border}` }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 52, fontWeight: 800, color: t.text, lineHeight: 1, letterSpacing: -2 }}>{price}</span>
        <span style={{ fontSize: 12, color: t.text3, fontFamily: "var(--font-mono)" }}>{sub}</span>
      </div>
      <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12, marginBottom: 32, flex: 1, paddingTop: 20 }}>
        {features.map((f, i) => (
          <li key={i} style={{ fontSize: 13, color: t.text2, display: "flex", alignItems: "flex-start", gap: 10, fontFamily: "var(--font-mono)" }}>
            <span style={{ width: 18, height: 18, borderRadius: "50%", background: t.greenDim, border: `1px solid ${t.greenBorder}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
              <Check size={10} color={t.green} />
            </span>
            {f}
          </li>
        ))}
      </ul>
      <Link href={href} target={href.startsWith("http") ? "_blank" : "_self"} rel={href.startsWith("http") ? "noopener" : ""} style={{ display: "flex", width: "100%", padding: "14px", borderRadius: 10, fontSize: 13, fontFamily: "var(--font-mono)", fontWeight: 600, textAlign: "center", textDecoration: "none", background: highlight ? t.green : "transparent", color: highlight ? "#000" : t.text, border: highlight ? "none" : `1px solid ${t.border2}`, justifyContent: "center", alignItems: "center", gap: 7, transition: "all 0.2s" }}
        onMouseEnter={e => { const el = e.currentTarget as HTMLElement; if (highlight) { el.style.background = t.green2; } else { el.style.borderColor = t.green; el.style.color = t.green; } }}
        onMouseLeave={e => { const el = e.currentTarget as HTMLElement; if (highlight) { el.style.background = t.green; } else { el.style.borderColor = t.border2; el.style.color = t.text; } }}>
        {cta} <ArrowRight size={12} />
      </Link>
    </div>
  );
}

// ─── FAQ item ─────────────────────────────────────────────────────────────────
function FAQItem({ q, a, t, isLast }: { q: string; a: string; t: Theme; isLast?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div onClick={() => setOpen(!open)} style={{ borderBottom: isLast ? "none" : `1px solid ${t.border}`, cursor: "pointer", transition: "background 0.2s" }} onMouseEnter={e => (e.currentTarget.style.background = t.surface2)} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "28px 32px" }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: t.text, fontFamily: "var(--font-mono)", paddingRight: 16, lineHeight: 1.4 }}>{q}</span>
        {open ? <ChevronUp size={16} color={t.text2} style={{ flexShrink: 0 }} /> : <ChevronDown size={16} color={t.text3} style={{ flexShrink: 0 }} />}
      </div>
      <div style={{ maxHeight: open ? 320 : 0, overflow: "hidden", transition: "max-height 0.32s ease" }}>
        <div style={{ padding: "0 32px 28px", fontSize: 14.5, color: t.text2, lineHeight: 1.8, fontFamily: "var(--font-mono)" }}>{a}</div>
      </div>
    </div>
  );
}

// ─── Testimonial card ─────────────────────────────────────────────────────────
function TestimonialCard({ name, role, text, t }: { name: string; role: string; text: string; t: Theme }) {
  return (
    <div style={{ background: t.surface2, border: `1px solid ${t.border}`, borderRadius: 16, padding: "28px", display: "flex", flexDirection: "column", gap: 16, transition: "transform 0.2s, box-shadow 0.2s" }} className="hover-lift">
      <div style={{ display: "flex", gap: 4 }}>
        {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} color={t.green} fill={t.green} />)}
      </div>
      <p style={{ fontSize: 13, color: t.text, lineHeight: 1.7, fontFamily: "var(--font-mono)", flex: 1 }}>'{text}'</p>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: t.surface3, border: `1px solid ${t.border2}`, display: "flex", alignItems: "center", justifyContent: "center", color: t.green, fontSize: 12, fontWeight: 700, fontFamily: "var(--font-mono)" }}>
          {name.split(" ").map(n => n[0]).join("")}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: t.text, fontFamily: "var(--font-display)" }}>{name}</div>
          <div style={{ fontSize: 10, color: t.text3, fontFamily: "var(--font-mono)", letterSpacing: "0.05em", textTransform: "uppercase", marginTop: 2 }}>{role}</div>
        </div>
      </div>
    </div>
  );
}

// ─── Logo Component ───────────────────────────────────────────────────────────
const LogoIcon = ({ t, size = 28 }: { t: Theme; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="8" width="20" height="20" rx="5" fill={t.text3} opacity="0.6" />
    <rect x="10" y="4" width="20" height="20" rx="5" fill={t.text} />
  </svg>
);

const GLOBAL_STYLES = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  html{scroll-behavior:auto} /* Handled by Lenis */
  body{overflow-x:hidden}
  :root{--font-display:var(--font-inter),system-ui,sans-serif;--font-mono:var(--font-jetbrains-mono),'Courier New',monospace}
  @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.3;transform:scale(.6)}}
  @keyframes heroIn{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
  a{color:inherit;text-decoration:none}
  .feat-grid-2{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
  .nav-desktop{display:flex!important}
  .nav-hamburger{display:none!important}
  @media(max-width:900px){.feat-grid-2{grid-template-columns:repeat(2,1fr)!important}}
  @media(max-width:768px){
    .nav-desktop{display:none!important}
    .nav-hamburger{display:flex!important}
    .hero-h1{font-size:clamp(32px,8vw,48px)!important}
    .feat-grid-2{grid-template-columns:1fr!important}
    .split-section{flex-direction:column!important}
    .split-left{width:100%!important;padding-right:0!important;margin-bottom:40px}
    .split-right{width:100%!important}
  }
  @keyframes marqueeVertical {
    from { transform: translateY(0); }
    to { transform: translateY(-50%); }
  }
`;

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [themeKey, setThemeKey] = useState<ThemeKey>("dark");
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const t = themeKey === "dark" ? DARK : LIGHT;
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = (localStorage.getItem("substream-theme") || "dark") as ThemeKey;
    setThemeKey(stored);
  }, []);

  useEffect(() => {
    localStorage.setItem("substream-theme", themeKey);
    document.documentElement.setAttribute("data-theme", themeKey);
  }, [themeKey]);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  // GSAP & Lenis initialization
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
    });

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // Stagger animations for sections
    const sections = gsap.utils.toArray('.gsap-section');
    sections.forEach((sec: any) => {
      gsap.fromTo(sec,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sec,
            start: "top 85%",
          }
        }
      );
    });

    // Hero section text animations
    gsap.fromTo('.hero-element',
      { opacity: 0, y: 28 },
      {
        opacity: 1, y: 0,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.1,
      }
    );

    return () => {
      lenis.destroy();
      gsap.ticker.remove(lenis.raf);
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  const toggle = useCallback(() => setThemeKey(p => p === "dark" ? "light" : "dark"), []);

  const btnPrimary: React.CSSProperties = { background: t.green, color: "#000", border: "none", borderRadius: 8, padding: "12px 28px", fontSize: 14, fontWeight: 600, fontFamily: "var(--font-display)", cursor: "pointer", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8, transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)" };
  const btnGhost: React.CSSProperties = { background: "transparent", color: t.text, border: `1px solid ${t.border2}`, borderRadius: 8, padding: "12px 28px", fontSize: 14, fontFamily: "var(--font-display)", fontWeight: 600, cursor: "pointer", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8, transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)" };

  return (
    <div ref={containerRef} style={{ background: t.bg, color: t.text, fontFamily: "var(--font-display)", minHeight: "100vh", overflowX: "hidden", transition: "background 0.4s, color 0.4s" }}>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_STYLES }} />
      <style>{`
        .hover-lift:hover{transform:translateY(-4px);box-shadow:0 12px 24px rgba(0,0,0,0.15);border-color:${t.greenBorder}}
      `}</style>

      {/* ═══ NAV ════════════════════════════════════════════════════════════════ */}
      <nav style={{ position: "fixed", top: 12, left: 24, right: 24, borderRadius: 16, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px", height: 72, background: scrolled ? t.navBg : "transparent", border: scrolled ? `1px solid ${t.border}` : "1px solid transparent", backdropFilter: scrolled ? "blur(20px)" : "none", transition: "all 0.4s ease" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <LogoIcon t={t} size={28} />
          <span style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700, color: t.text, letterSpacing: -0.5 }}>Student Stream</span>
        </Link>
        <div className="nav-desktop" style={{ display: "flex", alignItems: "center", gap: 32 }}>
          {["Pricing", "Features", "About Us", "FAQ"].map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(' ', '-')}`} style={{ fontSize: 14, color: t.text2, fontWeight: 500, transition: "color 0.2s" }} onMouseEnter={e => ((e.target as HTMLElement).style.color = t.text)} onMouseLeave={e => ((e.target as HTMLElement).style.color = t.text2)}>{l}</a>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button onClick={toggle} style={{ background: "none", border: "none", cursor: "pointer" }}>
            {themeKey === "dark" ? <Sun size={16} color={t.text2} /> : <Moon size={16} color={t.text2} />}
          </button>
          <Link href="/sign-in" className="nav-desktop" style={{ fontSize: 14, color: t.text, fontWeight: 500 }}>Sign in</Link>
          <Link href="/sign-up" style={{ ...btnPrimary, padding: "10px 20px", fontSize: 13 }}>Get Started</Link>
          <button className="nav-hamburger" onClick={() => setMenuOpen(!menuOpen)} style={{ background: "none", border: "none", color: t.text, padding: 4 }}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* ═══ HERO ═══════════════════════════════════════════════════════════════ */}
      <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "120px 24px 80px", position: "relative" }}>
        {/* Increased green glow as requested */}
        <div style={{ position: "absolute", top: "-20%", left: "50%", transform: "translateX(-50%)", width: "140vw", height: "1000px", background: `radial-gradient(ellipse at top, ${t.greenBorder} 0%, transparent 60%)`, pointerEvents: "none", zIndex: 0 }} />

        <div className="hero-element" style={{ opacity: 0, position: "relative", zIndex: 1, border: `1px solid ${t.border}`, borderRadius: 999, padding: "8px 24px", marginBottom: 48, fontSize: 13, color: t.text2, background: "transparent", display: "flex", alignItems: "center", gap: 8 }}>
          Hackathon Release: <Link href="/" style={{ color: t.green, textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>Welcome to Student Stream <ArrowRight size={14} /></Link>
        </div>

        <h1 className="hero-h1 hero-element" style={{ opacity: 0, position: "relative", zIndex: 1, fontFamily: "var(--font-mono)", fontSize: "clamp(26px,4.5vw,56px)", fontWeight: 700, lineHeight: 1.2, letterSpacing: "-0.02em", color: t.text, width: "100%", maxWidth: 1200 }}>
          Take control of student budget <br />under high inflation.
        </h1>

        <p className="hero-element" style={{ opacity: 0, position: "relative", zIndex: 1, marginTop: 40, fontSize: "clamp(14px,1.6vw,18px)", color: t.text2, maxWidth: 840, lineHeight: 2, fontFamily: "var(--font-mono)" }}>
          StudentStream is the ultimate AI-powered expense ledger and budget coach designed specifically for Pakistani university and hostel students.
        </p>

        <div className="hero-element" style={{ opacity: 0, position: "relative", zIndex: 1, display: "flex", gap: 20, marginTop: 56, flexWrap: "wrap", justifyContent: "center" }}>
          <a href="/" target="_blank" rel="noopener" className="hover-lift" style={{ ...btnGhost, padding: "16px 36px", fontSize: 15, background: "transparent", borderColor: t.border }}>View Live Demo</a>
          <Link href="/sign-up" className="hover-lift" style={{ ...btnPrimary, background: t.green, color: "#000", padding: "16px 36px", fontSize: 15 }}>Get Started Free</Link>
        </div>
      </section>

      {/* ═══ FEATURES ══════════════════════════════════════════════════════════ */}
      <section id="features" className="gsap-section" style={{ padding: "100px 24px", position: "relative" }}>
        <div style={{ position: "absolute", top: "10%", right: "-10%", width: "80vw", height: "80vw", background: `radial-gradient(circle, rgba(22,163,74,0.15) 0%, transparent 60%)`, pointerEvents: "none", zIndex: 0 }} />
        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{ marginBottom: 64 }}>
            <span style={{ fontSize: 12, color: t.green, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "var(--font-display)", fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
              <Zap size={14} /> FEATURES
            </span>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(32px,4vw,48px)", fontWeight: 800, letterSpacing: -1.5, color: t.text, marginTop: 12, lineHeight: 1.1 }}>
              Designed for students who <br /><span style={{ color: t.text2, fontStyle: "italic" }}>want to save smart</span>
            </h2>
            <p style={{ fontSize: 15, color: t.text3, marginTop: 16, maxWidth: 500, lineHeight: 1.6 }}>
              StudentStream organizes all your hostel and campus commitments, gives AI budget advice, and helps split flat rent with roommates.
            </p>
          </div>
          <div className="feat-grid-2">
            {[
              { Icon: Sparkles, title: "AI Expense Coach", desc: "Instantly categorize fees, rent, data bundles, and get local Pakistani saving tips from Gemini AI." },
              { Icon: Search, title: "Optimistic UI Updates", desc: "Add expenses and check budgets instantly with real-time sync and zero screen reload lag." },
              { Icon: RefreshCw, title: "PKR Default Currency", desc: "Track expenses in Pakistani Rupees, with conversion for freelance students earning in USD." },
              { Icon: Target, title: "Pocket Money Goals", desc: "Set monthly allowance targets and track warnings when fixed commitments threaten your budget." },
              { Icon: Command, title: "Shared Bill Splitting", desc: "Toggle shared flags for roommates and friends to split flat rents, maids, and mess bills." },
              { Icon: Shield, title: "100% Secure Auth", desc: "Protect your personal records. Uses secure Supabase auth so your data remains strictly yours." },
            ].map((f, i) => (
              <div key={i} style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 16, padding: "32px", display: "flex", flexDirection: "column", gap: 16, transition: "transform 0.2s, border-color 0.2s" }} className="hover-lift">
                <div style={{ width: 40, height: 40, borderRadius: 8, background: t.surface2, border: `1px solid ${t.border2}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <f.Icon size={18} color={t.green} />
                </div>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: t.text, marginBottom: 8, fontFamily: "var(--font-display)" }}>{f.title}</h3>
                  <p style={{ fontSize: 14, color: t.text2, lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SHOWCASE ══════════════════════════════════════════════════════════ */}
      <section className="gsap-section" style={{ padding: "120px 24px", background: t.surface }}>
        <div className="split-section" style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center" }}>
          <div className="split-left" style={{ width: "40%", paddingRight: 60 }}>
            <span style={{ fontSize: 12, color: t.green, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "var(--font-display)", fontWeight: 600 }}>
              DASHBOARD
            </span>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(36px,4.5vw,56px)", fontWeight: 800, letterSpacing: -1.5, color: t.text, marginTop: 16, lineHeight: 1.05 }}>
              Engineered for absolute <br /><span style={{ color: t.green, fontStyle: "italic" }}>clarity</span>
            </h2>
            <div style={{ marginTop: 48, display: "flex", flexDirection: "column", gap: 24 }}>
              <h3 style={{ fontSize: 24, fontWeight: 700, color: t.text, fontFamily: "var(--font-display)", letterSpacing: -0.5 }}>Manage allowance at the speed of <br /><span style={{ color: t.green }}>thought.</span></h3>
              <p style={{ fontSize: 15, color: t.text2, lineHeight: 1.6 }}>
                Every action in StudentStream is optimized for speed. Use the command palette to search, filter, and manage your campus and hostel expenses without leaving your keyboard.
              </p>
              <div style={{ background: t.surface2, border: `1px solid ${t.border}`, borderRadius: 8, padding: "16px", marginTop: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <Command size={16} color={t.text2} />
                  <span style={{ fontSize: 13, color: t.text, fontFamily: "var(--font-mono)" }}>⌘ K : Open Command Palette</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <Search size={16} color={t.text2} />
                  <span style={{ fontSize: 13, color: t.text, fontFamily: "var(--font-mono)" }}>/ : Search Expenses</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Target size={16} color={t.text2} />
                  <span style={{ fontSize: 13, color: t.text, fontFamily: "var(--font-mono)" }}>N : New Expense</span>
                </div>
              </div>
            </div>
          </div>
          <div className="split-right" style={{ width: "60%" }}>
            <DashPreview t={t} />
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ══════════════════════════════════════════════════════ */}
      <section className="gsap-section" style={{ padding: "120px 24px", position: "relative", overflow: "hidden" }}>
        {/* Glow */}
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "120vw", height: "120vw", background: `radial-gradient(circle, rgba(22,163,74,0.15) 0%, transparent 50%)`, pointerEvents: "none", zIndex: 0 }} />
        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <Label text="WALL_OF_LOVE" t={t} />
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(36px,5vw,60px)", fontWeight: 800, letterSpacing: -1.5, color: t.text, lineHeight: 1.05, marginBottom: 64 }}>
            Trusted by high velocity <br /><span style={{ color: t.green, fontStyle: "italic" }}>engineering teams.</span>
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, height: 650, overflow: "hidden", WebkitMaskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)", maskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)" }}>
            {[0, 1, 2].map(col => {
              const items = [
                { name: "Ali Raza", role: "NUST Hostelite", text: "StudentStream completely changed how I manage my monthly pocket money. The AI recommendations on mobile packages saved me thousands." },
                { name: "Zainab Fatima", role: "FAST-NU Student", text: "Finally, an expense tracker that splits rent with flatmates and tracks semester installments. The keyboard shortcuts are a game changer." },
                { name: "Usman Khan", role: "Freelance Student", text: "I track my Fiverr USD income, convert it to PKR, and manage my hosteling budget all in one beautiful dark dashboard." },
                { name: "Emily Wong", role: "NED Student", text: "The dashboard gives me instant clarity. We realized we were paying for 4 overlapping tools within the first day." },
                { name: "Michael Scott", role: "Punjab University", text: "Exporting to JSON and CSV makes tracking hostel accounts a breeze. The simulation mode is brilliant for budget planning." },
                { name: "Jessica Taylor", role: "Design Student", text: "Aesthetically, it's perfect. Functionally, it's blazing fast. The developers really understood what power users want." },
              ];
              // Offset items for visual variety in columns
              const colItems = [...items.slice(col * 2), ...items.slice(0, col * 2)];
              return (
                <div key={col} style={{ display: "flex", flexDirection: "column", gap: 24, animation: `marqueeVertical ${35 + col * 10}s linear infinite ${col === 1 ? "reverse" : "normal"}` }}>
                  {[...colItems, ...colItems, ...colItems].map((tData, i) => (
                    <TestimonialCard key={i} {...tData} t={t} />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ FAQ ════════════════════════════════════════════════════════════════ */}
      <section id="faq" className="gsap-section" style={{ padding: "120px 24px", background: t.bg, position: "relative", overflow: "hidden" }}>
        {/* Glow */}
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "120vw", height: "120vw", background: `radial-gradient(circle, rgba(22,163,74,0.15) 0%, transparent 50%)`, pointerEvents: "none", zIndex: 0 }} />
        <div style={{ maxWidth: 900, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <Label text="FAQ" t={t} />
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(44px,6vw,84px)", fontWeight: 800, letterSpacing: -2, color: t.text, lineHeight: 1.05, marginBottom: 20 }}>
            Good questions.<br /><span style={{ color: t.green, fontStyle: "italic" }}>Straight answers.</span>
          </h2>
          <p style={{ fontSize: 15, color: t.text2, fontFamily: "var(--font-mono)", marginBottom: 64, maxWidth: 580, lineHeight: 1.7 }}>
            Everything you need to know about StudentStream, allowance budgeting, and optimizing your monthly campus costs.
          </p>
          <div style={{ border: `1px solid ${t.border}`, borderRadius: 16, background: t.bg, overflow: "hidden" }}>
            {[
              ["Is it free for students?", "Yes! StudentStream is fully open-source and free during the hackathon beta. You can sign up with your student email and track unlimited expenses."],
              ["How does the AI Budget Coach work?", "We use Google's Gemini AI to analyze your inputs. It checks your monthly spending and suggests localized savings in Pakistan, such as switching mobile providers or taking public transit."],
              ["Can I track shared expenses?", "Yes! You can toggle the 'Shared' setting when adding an expense, making it easy to see which bills are split with roommates."],
              ["Does it support USD earnings?", "Absolutely. Many Pakistani students freelance. You can add income or expenses in USD, and we will normalize it to PKR automatically for your budget goals."],
              ["Is my data safe?", "Completely. All data runs on our secure Supabase database. We use Row Level Security so only you can access your personal financial logs."],
            ].map(([q, a], i, arr) => <FAQItem key={q} q={q} a={a} t={t} isLast={i === arr.length - 1} />)}
          </div>
        </div>
      </section>

      {/* ═══ CTA & FOOTER ═══════════════════════════════════════════════════════ */}
      <section className="gsap-section" style={{ padding: "40px 24px 100px", borderBottom: `1px solid ${t.border}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ background: t.surface2, border: `1px solid ${t.border}`, borderRadius: 24, padding: "64px 100px" }}>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 48 }}>

              <div style={{ maxWidth: 700, flex: 1, minWidth: 320 }}>
                <div style={{ marginBottom: 16 }}>
                  <Label text="GET STARTED NOW" t={t} />
                </div>
                <h2 style={{ fontFamily: "var(--font-mono)", fontSize: "clamp(28px,4.5vw,52px)", fontWeight: 700, letterSpacing: "-0.02em", color: t.text, lineHeight: 1.15 }}>
                  Track your <br /><span style={{ color: t.green, fontStyle: "italic" }}>allowance now.</span>
                </h2>
              </div>

              <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
                <Link href="/sign-up" style={{ ...btnPrimary, padding: "18px 28px", borderRadius: 16, fontSize: 15, fontWeight: 700, background: t.green, color: "#000", fontFamily: "var(--font-mono)" }}>Go to Dashboard <ArrowRight size={18} /></Link>
                <a href="https://studentstream.vercel.app/" target="_blank" rel="noopener" style={{ ...btnGhost, padding: "18px 28px", borderRadius: 16, fontSize: 15, fontWeight: 700, background: "transparent", borderColor: t.border2, fontFamily: "var(--font-mono)" }}><ArrowUpRight size={18} /> Live Demo</a>
              </div>

            </div>

            <div style={{ marginTop: 32, maxWidth: 760 }}>
              <p style={{ fontSize: 15, color: t.text2, fontFamily: "var(--font-mono)", lineHeight: 1.6 }}>
                Join thousands of students who use Student Stream to structure their budgets, build complex saving profiles, and optimize their campus financial workflow in real-time.
              </p>
            </div>

          </div>
        </div>
      </section>

      <footer style={{ padding: "80px 24px 64px", background: t.bg, borderTop: `1px solid ${t.border}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 48 }}>
          <div style={{ maxWidth: 300 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
              <LogoIcon t={t} size={32} />
              <span style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800, color: t.text, letterSpacing: -1 }}>Student Stream</span>
            </div>
            <p style={{ fontSize: 13, color: t.text2, fontFamily: "var(--font-mono)", lineHeight: 1.8, marginBottom: 24 }}>
              The real-time expense tracking engine for Pakistani students. Engineered for extreme speed, security, and absolute clarity.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, border: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent" }}><Zap size={16} color={t.text2} /></div>
              <div style={{ width: 36, height: 36, borderRadius: 8, border: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent" }}><Shield size={16} color={t.text2} /></div>
              <div style={{ width: 36, height: 36, borderRadius: 8, border: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent" }}><Users size={16} color={t.text2} /></div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 80, flexWrap: "wrap" }}>
            {[
              { title: "PRODUCT", links: [["Features", "#features"], ["Pricing", "#pricing"], ["Compare", "#compare"], ["Changelog", "#changelog"], ["Dashboard", "/dashboard"]] },
              { title: "RESOURCES", links: [["GitHub", "/"], ["Documentation", "/docs"], ["Live Demo", "/"], ["Author", "/"], ["Discord", "/"]] },
              { title: "LEGAL", links: [["Privacy Policy", "/privacy"], ["Terms of Service", "/terms"], ["Cookie Policy", "/cookies"], ["License", "/license"]] },
            ].map(col => (
              <div key={col.title} style={{ minWidth: 140 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: t.text3, marginBottom: 32, letterSpacing: "0.15em", fontFamily: "var(--font-mono)" }}>{col.title}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  {col.links.map(([label, href]) => (
                    <a key={label} href={href} style={{ fontSize: 13, color: t.text2, fontFamily: "var(--font-mono)", transition: "color 0.2s" }} onMouseEnter={e => ((e.target as HTMLElement).style.color = t.text)} onMouseLeave={e => ((e.target as HTMLElement).style.color = t.text2)}>{label}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ maxWidth: 1100, margin: "80px auto 0", paddingTop: 32, borderTop: `1px solid ${t.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 24, fontSize: 10, color: t.text3, fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          <div style={{ display: "flex", gap: 24 }}>
            <span>© 2026 STUDENTSTREAM</span>
            <span style={{ color: t.border }}>|</span>
            <span>BUILT BY 1xcoder</span>
          </div>
          <div style={{ display: "flex", gap: 32 }}>
            {["GITHUB", "LIVE APP", "PRIVACY", "TERMS"].map(l => (
              <a key={l} href="/" style={{ color: t.text3, textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => ((e.target as HTMLElement).style.color = t.text)} onMouseLeave={e => ((e.target as HTMLElement).style.color = t.text3)}>{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
