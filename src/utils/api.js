/**
 * Safely parse JSON from a fetch Response without throwing SyntaxError
 * on empty response bodies, HTML errors, or non-JSON content.
 */
export async function safeJson(response) {
  try {
    const text = await response.text();
    if (!text || !text.trim()) {
      return null;
    }
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/**
 * Parses response JSON safely and throws a meaningful Error if the response status is not OK.
 */
export async function parseApiResponse(response, defaultErrorMessage = 'Request failed') {
  const data = await safeJson(response);

  if (!response.ok) {
    let msg = data?.error || data?.message;
    if (!msg) {
      if (response.status === 500 || response.status === 502 || response.status === 504) {
        msg = 'Backend server is unreachable. Please verify that the backend is running on port 3001.';
      } else if (response.status === 401) {
        msg = 'Session expired or authentication required.';
      } else {
        msg = `${defaultErrorMessage} (HTTP ${response.status})`;
      }
    }
    const err = new Error(msg);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}
