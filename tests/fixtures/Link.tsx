import type { AnchorHTMLAttributes } from "react";
// The isolated visual fixture has no Next router; production uses next/link.
export default function FixtureLink(props: AnchorHTMLAttributes<HTMLAnchorElement>) { return <a {...props} />; }
