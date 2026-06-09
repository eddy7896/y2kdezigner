import { Orbitron, VT323, Press_Start_2P, Courier_Prime, Audiowide, Space_Mono, Syncopate, Bungee } from "next/font/google";
import "./globals.css";

const orbitron = Orbitron({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-orbitron" });
const vt323 = VT323({ subsets: ["latin"], weight: ["400"], variable: "--font-vt323" });
const pressStart2P = Press_Start_2P({ subsets: ["latin"], weight: ["400"], variable: "--font-pressstart" });
const courier = Courier_Prime({ subsets: ["latin"], weight: ["400"], variable: "--font-courier" });
const audiowide = Audiowide({ subsets: ["latin"], weight: ["400"], variable: "--font-audiowide" });
const spaceMono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-space" });
const syncopate = Syncopate({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-syncopate" });
const bungee = Bungee({ subsets: ["latin"], weight: ["400"], variable: "--font-bungee" });

export const metadata = {
  title: "Y2K Designer",
  description: "A classic Web Desktop Y2K Design tool",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${orbitron.variable} ${vt323.variable} ${pressStart2P.variable} ${courier.variable} ${audiowide.variable} ${spaceMono.variable} ${syncopate.variable} ${bungee.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
