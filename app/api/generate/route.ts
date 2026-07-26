export async function POST(req: Request) {
  try {
    const { prompt, type, orientation, length, referenceAsset } = await req.json();

    if (!prompt) {
      return Response.json({ error: "Prompt is required" }, { status: 400 });
    }

    // Using HuggingFace Inference API directly without client library
    const HF_TOKEN = process.env.HF_TOKEN || process.env.HUGGINGFACE_API_KEY;
    if (!HF_TOKEN) {
      return Response.json({ error: "HuggingFace API token not configured" }, { status: 500 });
    }

    let selectedModel = "";
    let width = 1024;
    let height = 1024;

    // Handle Image Generation
    if (type === 'image') {
      selectedModel = "black-forest-labs/FLUX.1-dev";

      if (orientation === 'portrait') {
        width = 768;
        height = 1344;
      } else if (orientation === 'landscape') {
        width = 1344;
        height = 768;
      }

      try {
        const response = await fetch(`https://api-inference.huggingface.co/models/${selectedModel}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${HF_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              width,
              height,
              num_inference_steps: 30,
            }
          })
        });

        if (!response.ok) {
          const error = await response.text();
          return Response.json({ error: `Image generation failed: ${error}` }, { status: 500 });
        }

        const buffer = await response.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        return Response.json({ success: true, data: `data:image/jpeg;base64,${base64}` });
      } catch (error: any) {
        return Response.json({ error: `Image generation error: ${error.message}` }, { status: 500 });
      }
    }

    // Handle Video Generation
    if (type === 'video') {
      if (length === 'long') {
        selectedModel = "tencent/HunyuanVideo";
      } else {
        selectedModel = "ali-vilab/text-to-video-ms-1.7b";
      }

      try {
        const response = await fetch(`https://api-inference.huggingface.co/models/${selectedModel}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${HF_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              watermark: false,
            }
          })
        });

        if (!response.ok) {
          const error = await response.text();
          return Response.json({ error: `Video generation failed: ${error}` }, { status: 500 });
        }

        const buffer = await response.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        return Response.json({ success: true, data: `data:video/mp4;base64,${base64}` });
      } catch (error: any) {
        return Response.json({ error: `Video generation error: ${error.message}` }, { status: 500 });
      }
    }

    return Response.json({ error: "Invalid generation type selected" }, { status: 400 });
  } catch (error: any) {
    return Response.json({ error: error.message || "Generation failed" }, { status: 500 });
  }
}
