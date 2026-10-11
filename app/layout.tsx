import { PublicExperience } from "@/components/journey/PublicExperience";
import { profile } from "@/lib/content/profile";
import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import "./globals.css";
import { ContentProvider } from "@/lib/cms/context";
import { getPublicContent } from "@/lib/cms/read";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-serif",
  display: "swap",
});

const sans = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-sans",
  display: "swap",
});

const title = "Rev. Frank Kwakye | Senior Pastor, Bible Teacher & Leadership Trainer, Accra, Ghana";
const description = `${profile.name}, ${profile.descriptor}. ${profile.church}, ${profile.location}.`;

export const metadata: Metadata = {
  icons: { icon: "/favicon.svg" },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://pastorfrankkwakye.com"),
  title: { default: title, template: "%s · Rev. Frank Kwakye" },
  description,
  openGraph: { title, description, locale: "en_GH", type: "website" },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const content = await getPublicContent();
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>
        <a className="skip" href="#content">
          Skip to content
        </a>
        <ContentProvider content={content}><PublicExperience>{children}</PublicExperience></ContentProvider>
      </body>
    </html>
  );
}
