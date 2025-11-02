import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ProcessRequest {
  videoUrl: string;
  puckConfThreshold: number;
  duplicateIouThreshold: number;
  homeRoster: string[];
  awayRoster: string[];
  manualMapYaml?: string;
  trackerConfigYaml?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const body: ProcessRequest = await req.json();

    const modalApiKey = Deno.env.get("MODAL_API_KEY");
    if (!modalApiKey) {
      throw new Error("MODAL_API_KEY not configured");
    }

    const response = await fetch("https://api.modal.com/v1/functions/process-hockey-video/invoke", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${modalApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        video_url: body.videoUrl,
        puck_conf_threshold: body.puckConfThreshold,
        duplicate_iou_threshold: body.duplicateIouThreshold,
        home_roster: body.homeRoster,
        away_roster: body.awayRoster,
        manual_map_yaml: body.manualMapYaml || "",
        tracker_config_yaml: body.trackerConfigYaml || "",
        model_urls: {
          player_model: "https://swicyzzoisbqzssvhkin.supabase.co/storage/v1/object/public/model/best%20(1)%20.pt",
          jersey_model: "https://swicyzzoisbqzssvhkin.supabase.co/storage/v1/object/public/model/best%20(2)%20.pt",
          puck_model: "https://swicyzzoisbqzssvhkin.supabase.co/storage/v1/object/public/model/yolov8m_forzasys_hockey_Version_2.pt"
        }
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Modal API error: ${error}`);
    }

    const result = await response.json();

    return new Response(
      JSON.stringify({
        success: true,
        jobId: result.job_id,
        message: "Video processing started"
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error processing request:", error);

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
