/**
 * Adapt a Netlify-style `handler(event)` to a Vercel Node.js serverless handler.
 */
export function asVercel(netlifyHandler) {
  return async function vercelHandler(req, res) {
    try {
      let body = req.body;
      if (body != null && typeof body !== "string") {
        body = JSON.stringify(body);
      }

      const headers = {};
      for (const [key, value] of Object.entries(req.headers || {})) {
        headers[String(key).toLowerCase()] = Array.isArray(value) ? value[0] : value;
      }

      const event = {
        httpMethod: req.method || "GET",
        headers,
        body: body ?? null,
        queryStringParameters: req.query || {},
        path: req.url,
      };

      const result = await netlifyHandler(event, {});
      const status = result?.statusCode || 200;

      if (result?.headers) {
        for (const [key, value] of Object.entries(result.headers)) {
          res.setHeader(key, value);
        }
      }

      const out = result?.body ?? "";
      if (
        typeof out === "string" &&
        (out.startsWith("{") || out.startsWith("[")) &&
        !res.getHeader("Content-Type")
      ) {
        res.setHeader("Content-Type", "application/json");
      }

      res.status(status).send(out);
    } catch (e) {
      res.status(500).json({ error: e?.message || "Internal Server Error" });
    }
  };
}
