import express from "express";
import { verifySignature } from "./services/cryptoService.js";
import randomRoutes from "./routes/random.js";
import db from "./db/connection.js"; // import SQLite instance

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * POST /verify-signal
 * Verifies a signed beacon payload using stored public keys
 */
app.post("/verify-signal", async (req, res) => {
  try {
    const { publicKey, data, signature } = req.body;

    if (!publicKey || !data || !signature) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // ✅ Type it properly
    const row = db.prepare("SELECT * FROM beacons WHERE publicKey = ?").get(publicKey) as BeaconRow | undefined;

    if (!row) {
      return res.status(404).json({ error: "Unknown beacon (not registered)" });
    }

    // perform actual verification
    const isValid = verifySignature(publicKey, data, signature);

    // optionally mark as verified if passes
    if (isValid && !row.verified) {
      db.prepare("UPDATE beacons SET verified = 1, updated_at = CURRENT_TIMESTAMP WHERE publicKey = ?").run(publicKey);
    }

    res.json({ verified: isValid });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /verify-signal
 * Interactive form + example curl for verifying signals
 */
app.get("/verify-signal", (req, res) => {
  const html = `
    <html>
      <head>
        <title>Verify Signal</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h2 { margin-bottom: 0.5rem; }
          form { background: #f9f9f9; padding: 16px; border-radius: 8px; border: 1px solid #ddd; max-width: 500px; }
          input[type=text], textarea {
            width: 100%;
            margin-bottom: 10px;
            padding: 8px;
            border: 1px solid #ccc;
            border-radius: 4px;
          }
          button {
            padding: 8px 16px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          }
          button:hover { background: #0056b3; }
          pre {
            background: #eee;
            padding: 10px;
            border-radius: 6px;
            overflow-x: auto;
          }
        </style>
      </head>
      <body>
        <h2>Verify Signal</h2>
        <form method="POST" action="/verify-signal">
          <label>Public Key:</label>
          <input type="text" name="publicKey" required />
          
          <label>Data:</label>
          <textarea name="data" rows="3" required></textarea>
          
          <label>Signature:</label>
          <input type="text" name="signature" required />

          <button type="submit">Verify Signal</button>
        </form>

        <h3>or use curl:</h3>
        <pre>
curl -X POST http://localhost:3000/verify-signal \\
  -H "Content-Type: application/json" \\
  -d '{
    "publicKey": "abc123",
    "data": "hello world",
    "signature": "valid"
  }'
        </pre>
      </body>
    </html>
  `;
  res.type("html").send(html);
});

app.use("/random", randomRoutes);
/**
 * GET /random/cosmic → SpaceComputer cosmic entropy
 * GET /random/local - local cryptographic random bytes
 * Returns a cryptographically secure random number
 */

app.get("/", (req, res) => {
  res.type("text").send(`🚀 SpaceComputer Backend Active

Available Endpoints:

🔹 Verification:
  • POST /verify-signal          → Verify a beacon signal signature
  • GET  /verify-signal           → View interactive verification form & example curl

🔹 Randomness:
  • GET  /random/cosmic           → Fetch true cosmic entropy from Orbitport
  • GET  /random/local            → Generate local cryptographic randomness (fallback)

🔹 Admin:
  • GET  /admin/list              → View all registered beacons in table format
  • POST /admin/register          → Register a new beacon (for verification tracking)
  • POST /admin/edit              → Edit an existing beacon’s name
  • POST /admin/delete            → Delete a beacon

All endpoints return JSON unless noted otherwise.`);
});

/**
 * POST /admin/register
 * Registers a beacon in the database (for verification later)
 */
app.post("/admin/register", (req, res) => {
  try {
    const { publicKey, name } = req.body; // 👈 match DB schema
    if (!publicKey || !name) {
      return res.status(400).json({ error: "Missing publicKey or name" });
    }

    const stmt = db.prepare(`
      INSERT INTO beacons (publicKey, name, verified)
      VALUES (?, ?, 0)
      ON CONFLICT(publicKey) DO UPDATE SET
        name = excluded.name,
        updated_at = CURRENT_TIMESTAMP
    `);
    stmt.run(publicKey, name); // 👈 use correct var

    res.json({ success: true, message: `Beacon '${name}' registered.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to register beacon." });
  }
});

type BeaconRow = {
  publicKey: string;
  name: string;
  verified: number;
  created_at: string;
  updated_at: string;
};

/**
 * GET /admin/list
 * Displays all beacons and includes inline forms for register/edit/delete
 */
app.get("/admin/list", (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM beacons").all() as BeaconRow[];

    let html = `
      <html>
        <head>
          <title>Beacon Admin</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { border-collapse: collapse; width: 100%; margin-top: 1rem; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            th { background: #eee; }
            form { display: inline; }
            input[type=text] { width: 140px; }
            button { padding: 4px 8px; margin-left: 4px; cursor: pointer; }
            h2 { margin-bottom: 0; }
            .register-form {
              margin-bottom: 20px;
              background: #f9f9f9;
              padding: 10px;
              border-radius: 6px;
              border: 1px solid #ddd;
            }
            .register-form input {
              margin-right: 8px;
            }
          </style>
        </head>
        <body>
          <h2>Beacon Admin Panel</h2>

          <!-- Register New Beacon -->
          <div class="register-form">
            <form method="POST" action="/admin/register">
              <strong>Register new beacon:</strong>
              <input type="text" name="publicKey" placeholder="Public Key" required />
              <input type="text" name="name" placeholder="Beacon Name" required />
              <button type="submit">➕ Register</button>
            </form>
          </div>

          <table>
            <tr>
              <th>#</th>
              <th>Public Key</th>
              <th>Name</th>
              <th>Verified</th>
              <th>Created At</th>
              <th>Updated At</th>
              <th>Actions (Edit Name or Delete Beacon)</th>
            </tr>
    `;

    rows.forEach((row, i) => {
      html += `
        <tr>
          <td>${i + 1}</td>
          <td>${row.publicKey}</td>
          <td>${row.name}</td>
          <td>${row.verified ? "✅ Yes" : "❌ No"}</td>
          <td>${new Date(row.created_at + "Z").toLocaleString("en-US", { timeZone: "America/Los_Angeles" })}</td>
          <td>${new Date(row.updated_at + "Z").toLocaleString("en-US", { timeZone: "America/Los_Angeles" })}</td>
          <td>
            <!-- Edit form -->
            <form method="POST" action="/admin/edit" style="margin-right:4px;">
              <input type="hidden" name="publicKey" value="${row.publicKey}" />
              <input type="text" name="name" value="${row.name}" required />
              <button type="submit">✏️ Edit</button>
            </form>
            <!-- Delete form -->
            <form method="POST" action="/admin/delete" onsubmit="return confirm('Delete this beacon?');">
              <input type="hidden" name="publicKey" value="${row.publicKey}" />
              <button type="submit" style="color:red;">🗑️ Delete</button>
            </form>
          </td>
        </tr>
      `;
    });

    html += `
          </table>
        </body>
      </html>
    `;

    res.type("html").send(html);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching beacons");
  }
});

/**
 * POST /admin/edit
 * Edits a beacon's name
 */
app.post("/admin/edit", (req, res) => {
  try {
    const { publicKey, name } = req.body;
    if (!publicKey || !name) {
      return res.status(400).send("Missing publicKey or name.");
    }

    const stmt = db.prepare(`
      UPDATE beacons
      SET name = ?, updated_at = CURRENT_TIMESTAMP
      WHERE publicKey = ?
    `);
    stmt.run(name, publicKey);

    res.redirect("/admin/list");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating beacon name.");
  }
});

/**
 * POST /admin/delete
 * Deletes a beacon
 */
app.post("/admin/delete", (req, res) => {
  try {
    const { publicKey } = req.body;
    if (!publicKey) {
      return res.status(400).send("Missing publicKey.");
    }

    const stmt = db.prepare(`DELETE FROM beacons WHERE publicKey = ?`);
    stmt.run(publicKey);

    res.redirect("/admin/list");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting beacon.");
  }
});
/**
 * Start the server
 */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});