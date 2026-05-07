// =============================================================
//  Cloudflare Worker — Gemini API Proxy for Adheeb's Portfolio
//  Deploy this on Cloudflare Workers dashboard
//  Set GEMINI_KEY as a Secret in Worker Settings
// =============================================================

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

const SYSTEM_CONTEXT = `You are a friendly and professional AI assistant embedded in Adheeb Ashim's personal portfolio website.
Your job is to help visitors learn about Adheeb and answer their questions concisely.

Key facts about Adheeb:
- Full name: Adheeb Ashim
- Role: Data Operational Analyst at NielsenIQ (July 2024 – Present)
- Previous role: Data R&D Intern at Vyza Solutions (Dec 2023 – June 2024)
- Skills: Python, JavaScript, React, SQL, AWS, Power BI, TensorFlow, Firebase, Node.js, LLMs/NLP
- Services: Web Development, AI & Machine Learning, Data Engineering & Analytics
- Projects: AI ATS Resume Optimizer (Gemini + Groq APIs), PowerPlus Electronics (e-commerce), CRM Facility Management system
- Experience: 2+ years, 10+ projects shipped, 3 AI tools built
- Contact: adheebashim1010@gmail.com | +91 8281759103 | WhatsApp available
- Location: Kerala, India (open to remote/global)
- Availability: Open to freelance and full-time opportunities

Respond in 1–3 short sentences. Be warm, professional, and helpful.
If you don't know something specific, suggest the visitor reaches out via email or WhatsApp.`;

export default {
    async fetch(request, env) {

        // ── Handle CORS preflight (browser sends this before the real request) ──
        if (request.method === "OPTIONS") {
            return new Response(null, {
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "POST, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type",
                },
            });
        }

        // ── Only allow POST requests ──────────────────────────────────────────
        if (request.method !== "POST") {
            return new Response(JSON.stringify({ error: "Method not allowed" }), {
                status: 405,
                headers: { "Content-Type": "application/json" }
            });
        }

        try {
            // Parse the request body from the browser
            const { history } = await request.json();

            if (!history || !Array.isArray(history)) {
                return new Response(JSON.stringify({ error: "Invalid request body" }), {
                    status: 400,
                    headers: corsHeaders()
                });
            }

            // Call Gemini using the secret key (stored in Cloudflare, never exposed)
            const geminiResponse = await fetch(`${GEMINI_URL}?key=${env.GEMINI_KEY}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    system_instruction: { parts: [{ text: SYSTEM_CONTEXT }] },
                    contents: history
                })
            });

            if (!geminiResponse.ok) {
                const errText = await geminiResponse.text();
                console.error("Gemini error:", errText);
                return new Response(JSON.stringify({ error: "Gemini API error" }), {
                    status: 502,
                    headers: corsHeaders()
                });
            }

            const data = await geminiResponse.json();
            const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text
                || "I'm not sure — feel free to email Adheeb directly!";

            // Return only the reply text — NO API key ever leaves this Worker
            return new Response(JSON.stringify({ reply: aiText }), {
                status: 200,
                headers: corsHeaders()
            });

        } catch (err) {
            console.error("Worker error:", err);
            return new Response(JSON.stringify({ error: "Internal server error" }), {
                status: 500,
                headers: corsHeaders()
            });
        }
    }
};

// Helper: CORS headers so your GitHub Pages site can call this Worker
function corsHeaders() {
    return {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    };
}
