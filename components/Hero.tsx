import Image from "next/image";
import { Button } from "./Button";

export function Hero() {
  return <section className="hero" id="top" aria-labelledby="hero-title"><Image className="hero__image" src="/images/nsbe-pennstatehbg-logo-transparent.png" alt="" width={1254} height={1254} priority /><div className="hero__shade" /><div className="hero__tags hero-enter"><span>NSBE Penn State Harrisburg</span><b>Student Chapter</b></div><p className="hero__motto hero-enter">&ldquo;Empowering Black<br />Engineers to Excel&rdquo;</p><h1 className="hero__title hero-enter" id="hero-title"><span><i>National</i></span><span><em>Society</em></span><span><b>Black</b></span><span>Engineers</span></h1><div className="hero__actions hero-enter"><Button href="#involved">Join NSBE <span aria-hidden="true">&#8599;</span></Button><Button variant="outline" href="#events">View Events <span aria-hidden="true">&#8599;</span></Button></div><div className="hero__side" aria-hidden="true"><span />NSBE<span /></div></section>;
}
