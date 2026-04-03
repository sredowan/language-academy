import "./globals.css";
import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-inter", // Re-using variable name to limit CSS changes
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata = {
  title: "Language Academy | Premium PTE & IELTS Coaching in Dhaka",
  description:
    "Language Academy is Bangladesh's leading English language coaching centre offering expert-led PTE Academic, IELTS preparation, and Spoken English courses with a 94% target-score success rate.",
  keywords: "PTE coaching Dhaka, IELTS preparation Bangladesh, Spoken English course, Language Academy, English language centre",
  openGraph: {
    title: "Language Academy | Premium PTE & IELTS Coaching",
    description: "Expert-led English language coaching with 94% success rate. PTE, IELTS & Spoken English courses in Dhaka.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${jakarta.variable} ${outfit.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              "name": "Language Academy",
              "description": "Premium English language coaching centre in Dhaka, Bangladesh",
              "url": "https://languageacademy.com.bd",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "SEL SUFI SQUARE, Unit: 1104, Level: 11, Plot: 58, Road: 16 (New) / 27 (Old), Dhanmondi R/A",
                "addressLocality": "Dhaka",
                "postalCode": "1209",
                "addressCountry": "BD"
              },
              "telephone": "+880-1913-373581",
              "sameAs": [
                "https://facebook.com/languageacademybd",
                "https://instagram.com/languageacademyb",
                "https://youtube.com/@languageacademybd"
              ]
            }),
          }}
        />
      </head>
      <body className={`${jakarta.className} bg-background text-foreground`}>
        <div className="page-shell flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1 pt-[124px] md:pt-[138px]">{children}</main>
          <Footer />
        </div>
        <WhatsAppButton />
      </body>
    </html>
  );
}
