const HF_ROUTER = "https://router.huggingface.co/hf-inference/models";
const HF_LEGACY = "https://api-inference.huggingface.co/models";

export async function hfAudioInference(
  model: string,
  audioBuffer: ArrayBuffer,
  contentType = "audio/wav",
  retries = 2
): Promise<any> {
  const token = process.env.HF_API_TOKEN;
  if (!token) {
    return null; // Gracefully signal to caller to use fallback
  }

  const endpoints = [`${HF_ROUTER}/${model}`, `${HF_LEGACY}/${model}`];

  for (const endpoint of endpoints) {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": contentType,
          },
          body: audioBuffer,
        });

        if (res.status === 503) {
          const body = await res.json().catch(() => ({}));
          const wait = Math.min((body?.estimated_time ?? 3) * 1000, 8000);
          await new Promise((r) => setTimeout(r, wait));
          continue;
        }

        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        console.warn(`HF attempt failed for ${endpoint}:`, err);
      }
    }
  }

  return null;
}
