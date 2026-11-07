// Self-hosted fonts (no request to Google at runtime, no flash of fallback text).
import { Rubik_Mono_One, Rethink_Sans, Caveat, Archivo_Black, DM_Serif_Display, Bungee, Rye } from "next/font/google";

const rubik = Rubik_Mono_One({ weight: "400", subsets: ["latin"], variable: "--f-rubik", display: "block" });
const rethink = Rethink_Sans({ weight: ["400", "600", "700", "800"], subsets: ["latin"], variable: "--f-rethink", display: "swap" });
const caveat = Caveat({ weight: "700", subsets: ["latin"], variable: "--f-caveat", display: "block" });
const archivo = Archivo_Black({ weight: "400", subsets: ["latin"], variable: "--f-archivo", display: "block" });
const dmserif = DM_Serif_Display({ weight: "400", subsets: ["latin"], variable: "--f-dmserif", display: "block" });
const bungee = Bungee({ weight: "400", subsets: ["latin"], variable: "--f-bungee", display: "block" });
const rye = Rye({ weight: "400", subsets: ["latin"], variable: "--f-rye", display: "block" });

export const fontVars = [rubik, rethink, caveat, archivo, dmserif, bungee, rye].map((f) => f.variable).join(" ");
