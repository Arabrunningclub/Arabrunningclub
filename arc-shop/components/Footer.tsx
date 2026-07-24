import Link from "next/link";
import { Logo } from "./Logo";
import { NewsletterForm } from "./NewsletterForm";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-statement" data-reveal>
        <span className="micro">ARC Manifesto / Detroit, MI</span>
        <p>
          We make uniform for people who turn a casual run into a ritual,
          a block into a route, and <em>movement into belonging.</em>
        </p>
      </div>
      <div className="footer-grid">
        <div className="footer-brand">
          <Logo />
          <p>Movement apparel for every pace.</p>
        </div>
        <div>
          <span className="footer-label">Shop</span>
          <Link href="/shop">All pieces</Link>
          <Link href="/shop?collection=run">Run</Link>
          <Link href="/shop?collection=off-duty">Off-duty</Link>
          <Link href="/shop?collection=objects">Objects</Link>
        </div>
        <div>
          <span className="footer-label">Help</span>
          <Link href="/pages/size-guide">Size guide</Link>
          <Link href="/pages/shipping-returns">Shipping + returns</Link>
          <Link href="/pages/contact">Contact</Link>
          <Link href="/admin">Staff sign in</Link>
        </div>
        <NewsletterForm />
      </div>
      <div className="footer-bottom">
        <span>© 2026 Arab Recreational Club</span>
        <div>
          <Link href="/pages/privacy">Privacy</Link>
          <Link href="/pages/terms">Terms</Link>
          <a href="https://www.instagram.com/" rel="noreferrer">
            Instagram
          </a>
        </div>
      </div>
    </footer>
  );
}
