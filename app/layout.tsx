import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { ConvexClientProvider } from "@/components/web/dashboard/providers/ConvexClientProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 👈 Define your base URL (fallback to localhost for development)
const siteUrl = process.env.SITE_URL || "http://localhost:3000";

// 👈 The fully detailed SEO Metadata Object
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "StudyPro | AI-Powered Study Planner & Plugin Marketplace",
    template: "%s | StudyPro", // Automatically formats sub-pages like "Marketplace | StudyPro"
  },
  description: "Supercharge your study workflow. Organize subjects, import tasks with AI Smart Import, and expand your vocabulary using a custom real-time plugin marketplace.",
  keywords: [
    "study planner",
    "AI study tool",
    "task management",
    "vocabulary builder",
    "student productivity",
    "plugin marketplace",
    "Convex",
    "Next.js",
  ],
  authors: [{ name: "Yousef", url: siteUrl }],
  creator: "Yousef",
  publisher: "StudyPro",
  
  // 👈 OpenGraph tags (For Discord, Twitter, Facebook, LinkedIn sharing)
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    title: "StudyPro | AI-Powered Study Planner",
    description: "Organize subjects, import tasks with AI, and expand your vocabulary using a custom plugin marketplace.",
    siteName: "StudyPro",
    images: [
      {
        url: "/og-image.png", // 👈 Add this image to your public folder for social previews
        width: 1200,
        height: 630,
        alt: "StudyPro Dashboard Preview",
      },
    ],
  },
  
  // 👈 Twitter / X tags
  twitter: {
    card: "summary_large_image",
    title: "StudyPro | AI-Powered Study Planner",
    description: "Supercharge your study workflow with AI Smart Import and a custom plugin marketplace.",
    images: ["/og-image.png"],
  },

  // 👈 Robots directives (Tell Google to index the site)
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // 👈 App icons (Next.js will look for these in the public folder)
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },

  // 👈 Canonical URL (Prevents duplicate content penalties)
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        inter.variable,
      )}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ConvexClientProvider>
            {children}
          </ConvexClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}