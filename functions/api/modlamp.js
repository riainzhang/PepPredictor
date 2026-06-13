const ORIGIN_API = "http://35.212.233.205";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function onRequestPost(context) {
  try {
    const response = await fetch(`${ORIGIN_API}/api/modlamp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: await context.request.text()
    });

    return new Response(await response.text(), {
      status: response.status,
      headers: {
        ...corsHeaders,
        "Content-Type": response.headers.get("Content-Type") || "application/json"
      }
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        detail: "PepPredictor modlamp backend is temporarily unavailable."
      }),
      {
        status: 502,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );
  }
}
