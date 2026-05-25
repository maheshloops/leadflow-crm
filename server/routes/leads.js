const router = require("express").Router();
const Lead = require("../models/Lead");

let anthropic = null;
try {
  const Anthropic = require("@anthropic-ai/sdk");
  if (process.env.ANTHROPIC_API_KEY) anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
} catch {}

// GET /api/leads
router.get("/", async (req, res, next) => {
  try {
    const { status, source, search, page = 1, limit = 100, sort = "-createdAt" } = req.query;
    const q = {};
    if (status) q.status = status;
    if (source) q.source = source;
    if (search) q.$or = [
      { first: new RegExp(search, "i") }, { last: new RegExp(search, "i") },
      { email: new RegExp(search, "i") }, { company: new RegExp(search, "i") }
    ];
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [leads, total] = await Promise.all([
      Lead.find(q).sort(sort).skip(skip).limit(parseInt(limit)),
      Lead.countDocuments(q)
    ]);
    res.json({ leads, total, page: parseInt(page) });
  } catch (err) { next(err); }
});

// GET /api/leads/stats
router.get("/stats", async (req, res, next) => {
  try {
    const [statusCounts, sourceCounts, valueStats] = await Promise.all([
      Lead.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Lead.aggregate([{ $group: { _id: "$source", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      Lead.aggregate([
        { $match: { status: "converted" } },
        { $group: { _id: null, total: { $sum: "$value" }, avg: { $avg: "$value" }, count: { $sum: 1 } } }
      ])
    ]);
    const byStatus = {};
    statusCounts.forEach(({ _id, count }) => { byStatus[_id] = count; });
    res.json({
      total: await Lead.countDocuments(),
      byStatus,
      bySources: sourceCounts.map(({ _id, count }) => ({ source: _id, count })),
      converted: { totalValue: valueStats[0]?.total || 0, avgValue: Math.round(valueStats[0]?.avg || 0), count: valueStats[0]?.count || 0 }
    });
  } catch (err) { next(err); }
});

// GET /api/leads/:id
router.get("/:id", async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ error: "Lead not found" });
    res.json(lead);
  } catch (err) { next(err); }
});

// POST /api/leads
router.post("/", async (req, res, next) => {
  try {
    const lead = await Lead.create(req.body);
    res.status(201).json(lead);
  } catch (err) { next(err); }
});

// PUT /api/leads/:id
router.put("/:id", async (req, res, next) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!lead) return res.status(404).json({ error: "Lead not found" });
    res.json(lead);
  } catch (err) { next(err); }
});

// PATCH /api/leads/:id/status
router.patch("/:id/status", async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["new","contacted","converted","lost"].includes(status))
      return res.status(400).json({ error: "Invalid status" });
    const lead = await Lead.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!lead) return res.status(404).json({ error: "Lead not found" });
    res.json(lead);
  } catch (err) { next(err); }
});

// POST /api/leads/:id/notes
router.post("/:id/notes", async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ error: "Note text required" });
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { $push: { notes: { text: text.trim() } } },
      { new: true }
    );
    if (!lead) return res.status(404).json({ error: "Lead not found" });
    res.json(lead);
  } catch (err) { next(err); }
});

// DELETE /api/leads/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) return res.status(404).json({ error: "Lead not found" });
    res.json({ message: "Lead deleted" });
  } catch (err) { next(err); }
});

// POST /api/leads/:id/followup  (AI email - optional)
router.post("/:id/followup", async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ error: "Lead not found" });
    if (!anthropic) return res.status(503).json({ error: "AI not configured. Set ANTHROPIC_API_KEY in .env" });
    const notes = lead.notes.map((n) => n.text).join("; ") || "None";
    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      messages: [{ role: "user", content: `Write a concise personalized follow-up sales email for this lead:\nName: ${lead.first} ${lead.last}\nCompany: ${lead.company}\nSource: ${lead.source}\nStatus: ${lead.status}\nDeal Value: ₹${lead.value?.toLocaleString()}\nNotes: ${notes}\n\nInclude subject line + 3 short paragraphs. Indian B2B SaaS context.` }]
    });
    res.json({ email: msg.content.find((c) => c.type === "text")?.text || "" });
  } catch (err) { next(err); }
});

module.exports = router;
