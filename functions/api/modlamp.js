const ORIGIN_API = "http://35-212-233-205.sslip.io";
const MAX_SEQUENCE_COUNT = 5000;
const MAX_BODY_BYTES = 1024 * 1024;

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
    const body = await context.request.text();
    if (new TextEncoder().encode(body).length > MAX_BODY_BYTES) {
      return jsonResponse(
        { detail: "Request body is too large. Please split the input into smaller batches." },
        413
      );
    }

    let payload;
    try {
      payload = JSON.parse(body);
    } catch (error) {
      return jsonResponse({ detail: "Invalid JSON request body." }, 400);
    }

    if (!Array.isArray(payload.sequences)) {
      return jsonResponse({ detail: "Request must include a sequences array." }, 400);
    }

    if (payload.sequences.length > MAX_SEQUENCE_COUNT) {
      return jsonResponse(
        {
          detail: `Too many sequences. PepPredictor accepts up to ${MAX_SEQUENCE_COUNT} sequences per run.`
        },
        413
      );
    }

    const response = await fetch(`${ORIGIN_API}/api/modlamp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body
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

function jsonResponse(payload, status) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json"
    }
  });
}
