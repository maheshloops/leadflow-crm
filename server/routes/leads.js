const router = require('express').Router();
const Anthropic = require('@anthropic-ai/sdk');
const Lead = require('../models/Lead');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// GET /api/leads — list with search/filter/pagination
router.get('/', async (req, res, next) => {
  try {
    const { status, source, search, page = 1, limit = 50, sort = '-createdAt' } = req.query;

    const query = {};
    if (status) query.status = status;
    if (source) query.source = source;
    if (search) {
      query.$or = [
        { first: new RegExp(search, 'i') },
        { last: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { company: new RegExp(search, 'i') }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [leads, total] = await Promise.all([
      Lead.find(query).sort(sort).skip(skip).limit(parseInt(limit)),
      Lead.countDocuments(query)
    ]);

    res.json({ leads, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    next(err);
  }
});

// GET /api/leads/stats — aggregate stats
router.get('/stats', async (req, res, next) => {
  try {
    const [statusCounts, sourceCounts, valueStats] = await Promise.all([
      Lead.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Lead.aggregate([{ $group: { _id: '$source', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      Lead.aggregate([
        { $match: { status: 'converted' } },
        { $group: { _id: null, total: { $sum: '$value' }, avg: { $avg: '$value' }, count: { $sum: 1 } } }
      ])
    ]);

    const byStatus = {};
    statusCounts.forEach(({ _id, count }) => { byStatus[_id] = count; });

    res.json({
      total: await Lead.countDocuments(),
      byStatus,
      bySources: sourceCounts.map(({ _id, count }) => ({ source: _id, count })),
      converted: {
        totalValue: valueStats[0]?.total || 0,
        avgValue: Math.round(valueStats[0]?.avg || 0),
        count: valueStats[0]?.count || 0
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/leads/:id
router.get('/:id', async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    res.json(lead);
  } catch (err) {
    next(err);
  }
});

// POST /api/leads — create
router.post('/', async (req, res, next) => {
  try {
    const lead = await Lead.create(req.body);
    res.status(201).json(lead);
  } catch (err) {
    next(err);
  }
});

// PUT /api/leads/:id — full update
router.put('/:id', async (req, res, next) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    });
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    res.json(lead);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/leads/:id/status — update status only
router.patch('/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['new', 'contacted', 'converted', 'lost'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }
    const lead = await Lead.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    res.json(lead);
  } catch (err) {
    next(err);
  }
});

// POST /api/leads/:id/notes — add a note
router.post('/:id/notes', async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ error: 'Note text is required' });

    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { $push: { notes: { text: text.trim() } } },
      { new: true }
    );
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    res.json(lead);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/leads/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    res.json({ message: 'Lead deleted' });
  } catch (err) {
    next(err);
  }
});

// POST /api/leads/:id/followup — AI email generation
router.post('/:id/followup', async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    const notesText = lead.notes.map((n) => n.text).join('; ') || 'None';

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `Write a concise, personalized follow-up sales email for this lead:

Name: ${lead.first} ${lead.last}
Company: ${lead.company}
Source: ${lead.source}
Current Status: ${lead.status}
Deal Value: ₹${lead.value.toLocaleString()}
Existing Notes: ${notesText}

Write a professional, friendly follow-up email (subject + 3 short paragraphs). Context: Indian B2B SaaS sales.`
        }
      ]
    });

    const email = message.content.find((c) => c.type === 'text')?.text || '';
    res.json({ email });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
