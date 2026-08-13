import express from 'express';
import pool from '../db/index.js';
import type { CreateEventRequest, Event } from '../types.js';

const router = express.Router();

// GET /api/events - Get all events (optionally filter by host_code)
router.get('/', async (req, res) => {
  try {
    const { host_code } = req.query;
    
    let query = 'SELECT * FROM events';
    const params: any[] = [];
    
    if (host_code) {
      query += ' WHERE host_code = $1';
      params.push(host_code);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query<Event>(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// GET /api/events/:id - Get a single event
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query<Event>(
      'SELECT * FROM events WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// POST /api/events - Create a new event
router.post('/', async (req, res) => {
  try {
    const { name, date, guest_limit = 50, host_code }: CreateEventRequest = req.body;
    
    if (!name || !date) {
      return res.status(400).json({ error: 'Name and date are required' });
    }
    
    if (!host_code) {
      return res.status(400).json({ error: 'Host code is required' });
    }
    
    const result = await pool.query<Event>(
      `INSERT INTO events (name, date, guest_limit, host_code) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [name, date, guest_limit, host_code]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

export default router;
