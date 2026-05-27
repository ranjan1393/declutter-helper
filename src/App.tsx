cat > /mnt/user-data/outputs/App.tsx << 'EOF'
import { useState } from "react";

const COLORS = {
  bg: "#F5F0E8",
  paper: "#FDFAF4",
  ink: "#1C1917",
  muted: "#78716C",
  accent: "#C84B31",
  keep: "#2D6A4F",
  donate: "#1D4E89",
  repurpose: "#7B5E2A",
  trash: "#8B1A1A",
  border: "#E0D8CC",
};

type VerdictKey = "keep" | "donate" | "repurpose" | "trash";

interface VerdictInfo {
  label: string;
  color: string;
  bg: string;
}

const VERDICTS: Record<VerdictKey, VerdictInfo> = {
  keep: { label: "Keep It", color: COLORS.keep, bg: "#EAF5EE" },
  donate: { label: "Donate / Give Away", color: COLORS.donate, bg: "#E8EFF8" },
  repurpose: { label: "Repurpose", color: COLORS.repurpose, bg: "#F5EFE6" },
  trash: { label: "Let It Go", color: COLORS.trash, bg: "#F8EAEA" },
};

const EXAMPLES = [
  "Saree gifted by mausi 10 years ago, never worn",
  "Old Nokia phone from 2012, doesn't turn on",
  "Stack of engineering textbooks from college",
  "Broken mixer grinder, been meaning to repair",
  "Kids' toys from when they were 5 (now 15)",
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
  const parsed = JSON.parse(text.replace(/json|/g, "").trim());
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
    const text = I used an AI declutter helper for: "${result.item}"\n\nVerdict: ${v.label}\n\n"${result.reasoning}"\n\nAction: ${result.action}\n\nTry it: https://declutter-helper.vercel.app;
    window.open(https://wa.me/?text=${encodeURIComponent(text)});
  };

  const v = result ? VERDICTS[result.verdict] : null;

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, fontFamily: "Georgia, serif", padding: 0 }}>
      <header style={{ background: COLORS.ink, color: COLORS.bg, padding: "24px", borderBottom: 4px solid ${COLORS.accent} }}>
        <div style={{ fontSize: "11px", letterSpacing: "4px", textTransform: "uppercase", color: COLORS.accent, marginBottom: "4px" }}>Declutter Helper</div>
        <h1 style={{ margin: 0, fontSize: "28px", fontWeight: "normal" }}>Should I Keep It?</h1>
        <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#A8A29E", fontStyle: "italic" }}>Honest advice for Indian homes & hearts</p>
      </header>

      <main style={{ maxWidth: "640px", margin: "0 auto", padding: "28px 20px 60px" }}>
        {!result && (
          <div style={{ background: COLORS.paper, border: 1px solid ${COLORS.border}, borderRadius: "2px", padding: "28px", boxShadow: "4px 4px 0px #D4C9B8" }}>
            <label style={{ display: "block", fontSize: "12px", letterSpacing: "2px", textTransform: "uppercase", color: COLORS.muted, marginBottom: "8px" }}>What's the item?</label>
            <textarea
              value={item}
              onChange={(e) => setItem(e.target.value)}
              placeholder="e.g. Saree gifted by mausi 10 years ago, never worn..."
              rows={3}
              style={{ width: "100%", border: 1px solid ${COLORS.border}, borderRadius: "2px", padding: "12px", fontSize: "16px", fontFamily: "Georgia, serif", background: COLORS.bg, color: COLORS.ink, resize: "vertical", outline: "none", boxSizing: "border-box" }}
            />
            <label style={{ display: "block", fontSize: "12px", letterSpacing: "2px", textTransform: "uppercase", color: COLORS.muted, margin: "18px 0 8px" }}>
              Any context? <span style={{ fontStyle: "italic", textTransform: "none", letterSpacing: 0 }}>(optional)</span>
            </label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="e.g. It was a gift from someone who passed away..."
              rows={2}
              style={{ width: "100%", border: 1px solid ${COLORS.border}, borderRadius: "2px", padding: "12px", fontSize: "15px", fontFamily: "Georgia, serif", background: COLORS.bg, color: COLORS.ink, resize: "vertical", outline: "none", boxSizing: "border-box" }}
            />
            <button
              onClick={handleSubmit}
              disabled={!item.trim() || loading}
              style={{ marginTop: "20px", background: item.trim() && !loading ? COLORS.accent : "#C4BAB0", color: "#fff", border: "none", padding: "14px 28px", fontSize: "13px", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "Georgia, serif", cursor: item.trim() ? "pointer" : "not-allowed", borderRadius: "2px" }}
            >
              {loading ? "Thinking..." : "Get My Verdict →"}
            </button>
            {error && <p style={{ color: COLORS.accent, marginTop: "12px", fontSize: "14px" }}>{error}</p>}
            <div style={{ marginTop: "24px", borderTop: 1px solid ${COLORS.border}, paddingTop: "16px" }}>
              <p style={{ fontSize: "11px", letterSpacing: "1px", color: COLORS.muted, textTransform: "uppercase", marginBottom: "10px" }}>Try an example</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {EXAMPLES.map((ex) => (
                  <button key={ex} onClick={() => setItem(ex)}
                    style={{ background: "transparent", border: 1px solid ${COLORS.border}, borderRadius: "2px", padding: "6px 10px", fontSize: "12px", fontFamily: "Georgia, serif", color: COLORS.muted, cursor: "pointer" }}>
                    {ex.length > 32 ? ex.slice(0, 32) + "…" : ex}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {result && v && (
          <div>
            <p style={{ fontSize: "12px", color: COLORS.muted, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "6px" }}>Your item</p>
            <p style={{ fontSize: "16px", color: COLORS.ink, fontStyle: "italic", marginBottom: "20px" }}>"{result.item}"</p>
            <div style={{ background: v.bg, border: 2px solid ${v.color}, borderRadius: "2px", padding: "24px", marginBottom: "16px" }}>
              <span style={{ background: v.color, color: "#fff", padding: "4px 12px", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", borderRadius: "2px" }}>{v.label}</span>
              <h2 style={{ margin: "14px 0 10px", fontSize: "22px", color: v.color, fontWeight: "normal" }}>{result.headline}</h2>
              <p style={{ margin: 0, fontSize: "15px", color: COLORS.ink, lineHeight: 1.7 }}>{result.reasoning}</p>
            </div>
            <div style={{ background: COLORS.ink, color: COLORS.bg, padding: "18px 24px", borderRadius: "2px", marginBottom: "16px", display: "flex", gap: "14px", alignItems: "flex-start" }}>
              <span style={{ color: COLORS.accent, fontSize: "18px" }}>→</span>
              <div>
                <p style={{ margin: "0 0 4px", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: "#A8A29E" }}>Do this today</p>
                <p style={{ margin: 0, fontSize: "14px", lineHeight: 1.6 }}>{result.action}</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button onClick={shareOnWhatsApp}
                style={{ background: "#25D366", color: "#fff", border: "none", padding: "12px 20px", fontSize: "13px", letterSpacing: "1px", textTransform: "uppercase", fontFamily: "Georgia, serif", cursor: "pointer", borderRadius: "2px" }}>
                Share on WhatsApp
              </button>
              <button onClick={reset}
                style={{ background: COLORS.accent, color: "#fff", border: "none", padding: "12px 20px", fontSize: "13px", letterSpacing: "1px", textTransform: "uppercase", fontFamily: "Georgia, serif", cursor: "pointer", borderRadius: "2px" }}>
                Next Item →
              </button>
            </div>
          </div>
        )}

        {history.length > 0 && !loading && (
          <div style={{ marginTop: "36px", borderTop: 1px solid ${COLORS.border}, paddingTop: "16px" }}>
            <p style={{ fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: COLORS.muted, marginBottom: "10px" }}>Session History</p>
            {history.map((h, i) => (
              <div key={i} style={{ display: "flex", gap: "12px", padding: "8px 12px", background: COLORS.paper, border: 1px solid ${COLORS.border}, borderRadius: "2px", marginBottom: "6px", fontSize: "13px" }}>
                <span style={{ color: VERDICTS[h.verdict].color, minWidth: "80px", fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase" }}>{VERDICTS[h.verdict].label}</span>
                <span style={{ color: COLORS.muted, fontStyle: "italic" }}>{h.item.length > 45 ? h.item.slice(0, 45) + "…" : h.item}</span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
EOF
echo "Done"
