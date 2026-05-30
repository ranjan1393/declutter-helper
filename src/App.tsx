import { useState } from "react";

const C = {
  paper: "#F7F2E9",
  cream: "#EDE7D9",
  ink: "#2C2416",
  inkLight: "#6B5E4E",
  turmeric: "#C8861A",
  terracotta: "#B85C38",
  terracottaLight: "#F2E4DC",
  sage: "#4A6741",
  sageLight: "#E2EBE1",
  indigo: "#2D3B6B",
  indigoLight: "#E1E5F0",
  border: "#D9CEBF",
};

type VerdictKey = "keep" | "donate" | "repurpose" | "trash";

interface VerdictInfo {
  label: string;
  color: string;
  bg: string;
  symbol: string;
}

const VERDICTS: Record<VerdictKey, VerdictInfo> = {
  keep: { label: "Keep It", color: C.sage, bg: C.sageLight, symbol: "◉" },
  donate: { label: "Donate", color: C.indigo, bg: C.indigoLight, symbol: "◯" },
  repurpose: { label: "Repurpose", color: C.turmeric, bg: "#FDF3E1", symbol: "◈" },
  trash: { label: "Let Go", color: C.terracotta, bg: C.terracottaLight, symbol: "◻" },
};

const EXAMPLES = [
  "Saree gifted by mausi 10 years ago, never worn",
  "Old Nokia phone from 2012, does not turn on",
  "Engineering textbooks from college",
  "Broken mixer grinder",
  "Children's toys they've outgrown",
];

interface Result {
  item: string;
  verdict: VerdictKey;
  headline: string;
  reasoning: string;
  action: string;
}

interface HistoryItem {
  item: string;
  verdict: VerdictKey;
}

async function askClaude(item: string, context: string): Promise<Result> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ item, context }),
  });
  const data = await response.json();
  const text = data.content.map((i: { text?: string }) => i.text || "").join("");
  const cleaned = text.replace(/```json|```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  const parsed = JSON.parse(cleaned.slice(start, end + 1));
  const validVerdicts = ["keep", "donate", "repurpose", "trash"];
  if (!validVerdicts.includes(parsed.verdict)) parsed.verdict = "trash";
  return { item, ...parsed };
}

export default function App() {
  const [item, setItem] = useState("");
  const [context, setContext] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const handleSubmit = async () => {
    if (!item.trim()) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const verdict = await askClaude(item.trim(), context.trim());
      setResult(verdict);
      setHistory((h) => [{ item: item.trim(), verdict: verdict.verdict }, ...h].slice(0, 10));
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  const reset = () => { setItem(""); setContext(""); setResult(null); setError(null); };

  const shareOnWhatsApp = () => {
    if (!result) return;
    const v = VERDICTS[result.verdict];
    const text = `I asked an AI about: "${result.item}"\n\nVerdict: ${v.label}\n\n${result.reasoning}\n\nNext step: ${result.action}\n\nTry it yourself: https://declutter-helper.vercel.app`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
  };

  const v = result ? VERDICTS[result.verdict] : null;

  return (
    <div style={{
      minHeight: "100vh",
      background: C.paper,
      fontFamily: "Palatino Linotype, Book Antiqua, Palatino, Georgia, serif",
    }}>

      <header style={{ background: C.ink, position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.02) 40px, rgba(255,255,255,0.02) 41px)",
        }} />
        <div style={{ padding: "32px 28px 26px", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <div style={{ width: "28px", height: "2px", background: C.terracotta }} />
            <span style={{ fontSize: "10px", letterSpacing: "4px", textTransform: "uppercase", color: C.terracotta, fontFamily: "Georgia, serif" }}>
              Should I Keep It
            </span>
          </div>
          <h1 style={{ margin: "0 0 6px", fontSize: "clamp(26px, 5vw, 38px)", fontWeight: "normal", color: C.cream, letterSpacing: "-0.5px", lineHeight: 1.1 }}>
            Honest guidance for<br />what stays & what goes
          </h1>
          <p style={{ margin: 0, fontSize: "13px", color: "#9A8E82", fontStyle: "italic" }}>
            For Indian homes & the feelings that fill them
          </p>
        </div>
        <div style={{ height: "5px", background: `linear-gradient(90deg, ${C.terracotta}, ${C.turmeric}, ${C.terracotta})` }} />
      </header>

      <main style={{ maxWidth: "660px", margin: "0 auto", padding: "36px 20px 80px" }}>

        {!result && (
          <div>
            <div style={{ textAlign: "center", marginBottom: "28px", color: C.terracotta, fontSize: "20px", letterSpacing: "14px", opacity: 0.35 }}>
              ❋ ❋ ❋
            </div>

            <div style={{
              background: "#FDFAF5",
              border: `1px solid ${C.border}`,
              padding: "32px 28px",
              boxShadow: `4px 6px 0px ${C.border}`,
              position: "relative",
            }}>
              <div style={{ position: "absolute", top: 0, left: 0, width: "18px", height: "18px", borderTop: `3px solid ${C.terracotta}`, borderLeft: `3px solid ${C.terracotta}` }} />
              <div style={{ position: "absolute", bottom: 0, right: 0, width: "18px", height: "18px", borderBottom: `3px solid ${C.terracotta}`, borderRight: `3px solid ${C.terracotta}` }} />

              <label style={{ display: "block", fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", color: C.inkLight, marginBottom: "10px" }}>
                What is the item?
              </label>
              <textarea
                value={item}
                onChange={(e) => setItem(e.target.value)}
                placeholder="Describe the item you are unsure about..."
                rows={3}
                style={{
                  width: "100%", border: `1px solid ${C.border}`,
                  borderBottom: `2px solid ${item ? C.terracotta : C.border}`,
                  padding: "12px 14px", fontSize: "16px",
                  fontFamily: "Palatino Linotype, Georgia, serif",
                  background: C.paper, color: C.ink, resize: "vertical",
                  outline: "none", boxSizing: "border-box", lineHeight: 1.6,
                  transition: "border-color 0.2s",
                }}
              />

              <label style={{ display: "block", fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", color: C.inkLight, margin: "22px 0 10px" }}>
                The story behind it{" "}
                <span style={{ fontStyle: "italic", textTransform: "none", letterSpacing: 0, opacity: 0.7 }}>(optional)</span>
              </label>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="A gift? Something you once loved? What makes it hard to decide..."
                rows={2}
                style={{
                  width: "100%", border: `1px solid ${C.border}`,
                  borderBottom: `2px solid ${context ? C.turmeric : C.border}`,
                  padding: "12px 14px", fontSize: "15px",
                  fontFamily: "Palatino Linotype, Georgia, serif",
                  background: C.paper, color: C.ink, resize: "vertical",
                  outline: "none", boxSizing: "border-box", lineHeight: 1.6,
                }}
              />

              <div style={{ marginTop: "24px", display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                <button
                  onClick={handleSubmit}
                  disabled={!item.trim() || loading}
                  style={{
                    background: item.trim() && !loading ? C.terracotta : "#C4A898",
                    color: "#FDF8F2", border: "none", padding: "14px 32px",
                    fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase",
                    fontFamily: "Georgia, serif", cursor: item.trim() && !loading ? "pointer" : "not-allowed",
                    transition: "all 0.2s",
                    boxShadow: item.trim() && !loading ? `3px 3px 0 ${C.ink}` : "none",
                  }}
                >
                  {loading ? "Reflecting..." : "Seek Guidance →"}
                </button>
                {loading && (
                  <span style={{ fontSize: "13px", color: C.inkLight, fontStyle: "italic" }}>
                    Thinking honestly...
                  </span>
                )}
              </div>
              {error && <p style={{ color: C.terracotta, marginTop: "14px", fontSize: "14px", fontStyle: "italic" }}>{error}</p>}
            </div>

            <div style={{ marginTop: "28px" }}>
              <p style={{
                fontSize: "10px", letterSpacing: "2px", color: C.inkLight,
                textTransform: "uppercase", marginBottom: "12px",
                display: "flex", alignItems: "center", gap: "10px",
              }}>
                <span style={{ flex: 1, height: "1px", background: C.border, display: "inline-block" }} />
                Common dilemmas
                <span style={{ flex: 1, height: "1px", background: C.border, display: "inline-block" }} />
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex}
                    onClick={() => setItem(ex)}
                    style={{
                      background: "transparent", border: `1px solid ${C.border}`,
                      padding: "7px 12px", fontSize: "12px", fontFamily: "Georgia, serif",
                      color: C.inkLight, cursor: "pointer", fontStyle: "italic",
                    }}
                  >
                    {ex.length > 35 ? ex.slice(0, 35) + "..." : ex}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {result && v && (
          <div>
            <p style={{ fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", color: C.inkLight, marginBottom: "8px" }}>
              You asked about
            </p>
            <p style={{
              fontSize: "17px", color: C.ink, fontStyle: "italic",
              marginBottom: "26px", lineHeight: 1.5,
              borderLeft: `3px solid ${C.turmeric}`, paddingLeft: "14px",
            }}>
              "{result.item}"
            </p>

            <div style={{
              background: v.bg, border: `1px solid ${v.color}`,
              borderLeft: `5px solid ${v.color}`,
              padding: "26px 26px 22px", marginBottom: "14px",
            }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "14px" }}>
                <span style={{ fontSize: "28px", color: v.color, lineHeight: 1 }}>{v.symbol}</span>
                <div style={{ fontSize: "22px", color: v.color, fontFamily: "Georgia, serif" }}>{v.label}</div>
              </div>
              <h2 style={{ margin: "0 0 12px", fontSize: "clamp(16px, 3vw, 21px)", color: C.ink, fontWeight: "normal", lineHeight: 1.35, fontStyle: "italic" }}>
                {result.headline}
              </h2>
              <p style={{ margin: 0, fontSize: "15px", color: C.ink, lineHeight: 1.8, opacity: 0.85 }}>
                {result.reasoning}
              </p>
            </div>

            <div style={{
              background: C.ink, color: C.cream, padding: "20px 24px",
              marginBottom: "18px", display: "flex", gap: "14px",
              alignItems: "flex-start", borderLeft: `4px solid ${C.turmeric}`,
            }}>
              <span style={{ color: C.turmeric, fontSize: "18px", lineHeight: 1, marginTop: "2px" }}>→</span>
              <div>
                <p style={{ margin: "0 0 5px", fontSize: "9px", letterSpacing: "3px", textTransform: "uppercase", color: C.turmeric }}>
                  Do this today
                </p>
                <p style={{ margin: 0, fontSize: "14px", lineHeight: 1.7, opacity: 0.9 }}>{result.action}</p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button
                onClick={shareOnWhatsApp}
                style={{
                  background: "#1A7A3E", color: "#fff", border: "none",
                  padding: "12px 22px", fontSize: "11px", letterSpacing: "2px",
                  textTransform: "uppercase", fontFamily: "Georgia, serif",
                  cursor: "pointer", boxShadow: "3px 3px 0 rgba(0,0,0,0.2)",
                }}
              >
                Share on WhatsApp
              </button>
              <button
                onClick={reset}
                style={{
                  background: C.terracotta, color: "#FDF8F2", border: "none",
                  padding: "12px 22px", fontSize: "11px", letterSpacing: "2px",
                  textTransform: "uppercase", fontFamily: "Georgia, serif",
                  cursor: "pointer", boxShadow: `3px 3px 0 ${C.ink}`,
                }}
              >
                Next Item →
              </button>
            </div>
          </div>
        )}

        {history.length > 0 && !loading && (
          <div style={{ marginTop: "44px" }}>
            <p style={{
              fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase",
              color: C.inkLight, marginBottom: "12px",
              display: "flex", alignItems: "center", gap: "10px",
            }}>
              <span style={{ flex: 1, height: "1px", background: C.border }} />
              Today's decisions
              <span style={{ flex: 1, height: "1px", background: C.border }} />
            </p>
            {history.map((h, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: "12px",
                padding: "9px 14px", background: "#FDFAF5",
                border: `1px solid ${C.border}`,
                borderLeft: `3px solid ${VERDICTS[h.verdict].color}`,
                marginBottom: "6px", fontSize: "13px",
              }}>
                <span style={{ color: VERDICTS[h.verdict].color, fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", minWidth: "70px" }}>
                  {VERDICTS[h.verdict].label}
                </span>
                <span style={{ color: C.inkLight, fontStyle: "italic" }}>
                  {h.item.length > 48 ? h.item.slice(0, 48) + "..." : h.item}
                </span>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: "60px", textAlign: "center", borderTop: `1px solid ${C.border}`, paddingTop: "20px" }}>
          <div style={{ color: C.terracotta, fontSize: "16px", letterSpacing: "8px", marginBottom: "8px" }}>❋</div>
          <p style={{ fontSize: "12px", color: C.inkLight, fontStyle: "italic", margin: 0 }}>
            Wisdom for mindful Indian homes
          </p>
        </div>
      </main>
    </div>
  );
}
