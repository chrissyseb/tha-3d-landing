/* © 2026 Christine Sebastian. All rights reserved. EssayLabsg™ website and marking engine. Unauthorised copying, reproduction or reuse is prohibited. */
import { ImageResponse } from "@vercel/og";
export const config = { runtime: "edge" };
const h = (type, style, children) => ({ type, props: { style, children } });
export default function handler() {
  return new ImageResponse(
    h("div", { width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 90px", color: "#1B2440", position: "relative",
      backgroundColor: "#FAFAF9", backgroundImage: "radial-gradient(circle at 92% 8%, rgba(168,149,230,.45), transparent 45%), radial-gradient(circle at 8% 100%, rgba(235,169,138,.35), transparent 45%)" }, [
      h("div", { display: "flex", alignItems: "center", fontSize: 40 }, [
        h("div", { width: 34, height: 34, borderRadius: 17, marginRight: 16, display: "flex", backgroundImage: "linear-gradient(135deg,#EBA98A,#A895E6 55%,#93AACB)" }, ""),
        h("span", {}, "EssayLabsg™"), h("span", { color: "#56607A", marginLeft: 16, fontSize: 30 }, "by Thinking Hack™")]),
      h("div", { fontSize: 20, letterSpacing: 4, color: "#56607A", marginTop: 12, fontFamily: "monospace" }, "SINGAPORE EXAM ESSAY MARKING"),
      h("div", { fontSize: 72, fontWeight: 700, lineHeight: 1.05, marginTop: 40, letterSpacing: -2, display: "flex", flexWrap: "wrap" }, [
        h("span", {}, "Essays, marked like the real exam")]),
      h("div", { fontSize: 32, color: "#56607A", marginTop: 26 }, "PSLE, O-Level, A-Level GP, IB and IGCSE, by our Exam Preparation Specialists™"),
      h("div", { display: "flex", marginTop: 30, fontSize: 28, fontWeight: 700 }, [
        h("span", { color: "#4C3A9A" }, "1 essay a week free"), h("span", { color: "#56607A", margin: "0 14px" }, "·"), h("span", { color: "#C2410C" }, "4 detailed reports for S$39")]),
      h("div", { position: "absolute", bottom: 34, left: 90, fontSize: 20, color: "#56607A" }, "EssayLabsg™ is a product of Thinking Hack™. © 2026 Christine Sebastian.")
    ]),
    { width: 1200, height: 630 }
  );
}
