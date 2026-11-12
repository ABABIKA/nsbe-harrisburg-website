"use client";

import Image from "next/image";
import Link from "next/link";

import { useState } from "react";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return <header className="site-header"><Link className="brand" href="#top" aria-label="NSBE Harrisburg home"><Image className="brand-mark" src="/images/nsbe-pennstatehbg-logo.jpeg" alt="" width={400} height={400} priority /><span><b>Penn State Harrisburg</b><strong>Student Chapter</strong></span></Link><div className="header-actions"><a className="login-link" href="/login">Member Login</a><button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-controls="main-navigation">{menuOpen ? "Close" : "Menu"}</button></div><nav id="main-navigation" className={`site-nav ${menuOpen ? "is-open" : ""}`} aria-label="Main navigation"><Link href="#about" onClick={closeMenu}>About Our Chapter</Link><Link href="#events" onClick={closeMenu}>Events</Link><Link href="#involved" onClick={closeMenu}>Get Involved</Link><Link href="/login" onClick={closeMenu}>Member Login</Link></nav></header>;
}
