const HF_ROUTER = "https://router.huggingface.co/hf-inference/models";

export async function hfAudioInference(
  model: string,
  audioBuffer: ArrayBuffer,
  contentType = "audio/wav",
  retries = 2
): Promise<any> {
  const token = process.env.HF_API_TOKEN;
  if (!token) {
    return null;
  }

  const endpoint = `${HF_ROUTER}/${model}`;

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
        const wait = Math.min((body?.estimated_time ?? 3) * 1000, 6000);
        await new Promise((r) => setTimeout(r, wait));
        continue;
      }

      if (res.ok) {
        return await res.json();
      }

      const errText = await res.text().catch(() => "");
      console.warn(`HF audio attempt ${attempt + 1} for ${model} returned status ${res.status}:`, errText.slice(0, 200));
    } catch (err) {
      console.warn(`HF audio attempt failed for ${endpoint}:`, err);
    }
  }

  return null;
}

export async function hfTextInference(
  model: string,
  inputs: string,
  retries = 2
): Promise<any> {
  const token = process.env.HF_API_TOKEN;
  if (!token) {
    return null;
  }

  const endpoint = `${HF_ROUTER}/${model}`;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs }),
      });

      if (res.status === 503) {
        const body = await res.json().catch(() => ({}));
        const wait = Math.min((body?.estimated_time ?? 3) * 1000, 6000);
        await new Promise((r) => setTimeout(r, wait));
        continue;
      }

      if (res.ok) {
        return await res.json();
      }

      const errText = await res.text().catch(() => "");
      console.warn(`HF text attempt ${attempt + 1} for ${model} returned status ${res.status}:`, errText.slice(0, 200));
    } catch (err) {
      console.warn(`HF text attempt failed for ${endpoint}:`, err);
    }
  }

  return null;
}
