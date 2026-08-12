const HF_BASE = "https://api-inference.huggingface.co/models";

export async function hfAudioInference(
  model: string,
  audioBuffer: ArrayBuffer,
  contentType = "audio/wav",
  retries = 3
): Promise<any> {
  const token = process.env.HF_API_TOKEN;
  if (!token) throw new Error("HF_API_TOKEN is not set");

  for (let attempt = 0; attempt < retries; attempt++) {
    const res = await fetch(`${HF_BASE}/${model}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": contentType,
      },
      body: audioBuffer,
    });

    if (res.status === 503) {
      const body = await res.json().catch(() => ({}));
      const wait = Math.min((body?.estimated_time ?? 5) * 1000, 15000);
      await new Promise((r) => setTimeout(r, wait));
      continue;
    }

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`HF inference failed (${res.status}): ${text}`);
    }

    return res.json();
  }

  throw new Error("model did not respond after retries");
}
