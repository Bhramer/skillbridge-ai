const API_BASE = "/api";

export async function analyzeMatch(resumeFile, jdText) {
  const form = new FormData();
  form.append("resume", resumeFile);
  form.append("jd_text", jdText);

  const res = await fetch(`${API_BASE}/analyze/match`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Server error" }));
    throw new Error(err.detail || `Request failed (${res.status})`);
  }

  return res.json();
}

export async function analyzeJD(jdText) {
  const res = await fetch(`${API_BASE}/analyze/jd`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jd_text: jdText }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Server error" }));
    throw new Error(err.detail || `Request failed (${res.status})`);
  }

  return res.json();
}

export async function checkHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}
