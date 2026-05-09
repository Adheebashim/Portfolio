export default {
  async fetch(request, env, ctx) {
    const allowedOrigins = ["https://adheebashim.dev", "http://127.0.0.1:5500", "http://localhost:5500"];
    const origin = request.headers.get("Origin");
    
    // Fallback to exactly allowed origin or block
    const corsOrigin = allowedOrigins.includes(origin) ? origin : "https://adheebashim.dev";

    // 1. Handle CORS Preflight requests for browser security
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": corsOrigin,
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    // Security: Block unauthorized origins immediately
    if (origin && !allowedOrigins.includes(origin)) {
      return new Response("Unauthorized Origin", { status: 403 });
    }

    // 2. Only allow POST requests
    if (request.method !== "POST") {
      return new Response("Only POST requests are allowed", { status: 405 });
    }

    try {
      // 3. Extract the message payload sent from your website
      const requestData = await request.json();

      // 4. Construct the URL to the Google Gemini API, injecting your secret key from Cloudflare Environment Variables
      // Ensure GEMINI_API_KEY is set in your Cloudflare Worker Settings!
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`;

      // 5. Forward the request to Google
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestData)
      });

      // 6. Get the response back from Google
      const data = await response.json();

      // 7. Send the response back to your website with CORS headers attached
      return new Response(JSON.stringify(data), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": corsOrigin,
        },
      });
      
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        }
      });
    }
  },
};
