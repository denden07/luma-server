import express from 'express';
import pool from '../db/index.js';
import type { CreateParticipantRequest, Participant } from '../types.js';

const router = express.Router();

// GET /api/events/:eventId/participants - Get all participants for an event
router.get('/:eventId/participants', async (req, res) => {
  try {
    const { eventId } = req.params;
    const result = await pool.query<Participant>(
      'SELECT * FROM participants WHERE event_id = $1 ORDER BY created_at ASC',
      [eventId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching participants:', error);
    res.status(500).json({ error: 'Failed to fetch participants' });
  }
});

// POST /api/events/:eventId/participants - Create a new participant
router.post('/:eventId/participants', async (req, res) => {
  try {
    const { eventId } = req.params;
    const { name, id }: CreateParticipantRequest = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    const result = await pool.query<Participant>(
      `INSERT INTO participants (id, event_id, name)
       VALUES (COALESCE($1::uuid, gen_random_uuid()), $2, $3)
       ON CONFLICT (id) DO UPDATE
       SET name = EXCLUDED.name
       WHERE participants.event_id = EXCLUDED.event_id
       RETURNING *`,
      [id || null, eventId, name]
    );

    if (result.rows.length === 0) {
      return res.status(409).json({ error: 'Participant belongs to a different event' });
    }
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating participant:', error);
    res.status(500).json({ error: 'Failed to create participant' });
  }
});

export default router;
