import Link from "next/link";
import { Header } from "@/components/Header";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="not-found">
        <span className="section-label">404 / Off route</span>
        <h1>Wrong turn.</h1>
        <p>The movement keeps going. Let’s get you back to the first drop.</p>
        <Link className="button button-dark" href="/shop">
          Return to the shop →
        </Link>
      </main>
    </>
  );
}
