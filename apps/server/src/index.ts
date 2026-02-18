import { Hono } from "hono";
import { cors } from "hono/cors";
import postgres from "postgres";

const app = new Hono();

app.use("/*", cors());

// Database connection
const sql = postgres(process.env.DATABASE_URL || "postgres://username:password@localhost:5432/database");

// Initialize functionality
const initDb = async () => {
    await sql`
    CREATE TABLE IF NOT EXISTS urls (
      id SERIAL PRIMARY KEY,
      original_url TEXT NOT NULL,
      short_code VARCHAR(10) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      clicks INTEGER DEFAULT 0
    )
  `;
};
initDb().catch(console.error);

// Utilities
const generateShortCode = (length = 6) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

// Routes

// Shorten URL
app.post("/api/shorten", async (c) => {
    const { url } = await c.req.json();

    if (!url) {
        return c.json({ error: "URL is required" }, 400);
    }

    // Check if URL already exists
    const existing = await sql`SELECT short_code FROM urls WHERE original_url = ${url} LIMIT 1`;
    if (existing.length > 0) {
        return c.json({ shortCode: existing[0].short_code });
    }

    let shortCode = generateShortCode();
    let isUnique = false;

    // Ensure uniqueness
    while (!isUnique) {
        const check = await sql`SELECT id FROM urls WHERE short_code = ${shortCode}`;
        if (check.length === 0) {
            isUnique = true;
        } else {
            shortCode = generateShortCode();
        }
    }

    await sql`
    INSERT INTO urls (original_url, short_code)
    VALUES (${url}, ${shortCode})
  `;

    return c.json({ shortCode });
});

// Get Stats
app.get("/api/stats/:shortCode", async (c) => {
    const shortCode = c.req.param("shortCode");
    const result = await sql`SELECT clicks, created_at, original_url FROM urls WHERE short_code = ${shortCode}`;

    if (result.length === 0) {
        return c.json({ error: "Not found" }, 404);
    }

    return c.json(result[0]);
});

// Redirect
app.get("/:shortCode", async (c) => {
    const shortCode = c.req.param("shortCode");

    const result = await sql`
    UPDATE urls 
    SET clicks = clicks + 1 
    WHERE short_code = ${shortCode}
    RETURNING original_url
  `;

    if (result.length === 0) {
        return c.text("URL not found", 404);
    }

    return c.redirect(result[0].original_url);
});

export default {
    port: process.env.PORT || 5000,
    fetch: app.fetch,
};
