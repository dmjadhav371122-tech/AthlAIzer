import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const jobId = url.searchParams.get("jobId");

    if (!jobId) {
      throw new Error("Job ID is required");
    }

    const modalApiKey = Deno.env.get("MODAL_API_KEY");
    if (!modalApiKey) {
      throw new Error("MODAL_API_KEY not configured");
    }

    const response = await fetch(`https://api.modal.com/v1/jobs/${jobId}/status`, {
      headers: {
        "Authorization": `Bearer ${modalApiKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Modal API error: ${error}`);
    }

    const result = await response.json();

    return new Response(
      JSON.stringify(result),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error checking job status:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred"
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
