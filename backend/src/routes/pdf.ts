import { Router, Request, Response } from 'express';
import { Assignment } from '../models/Assignment';
import { getCachedResult } from '../lib/queue';

const router = Router();

// Server-side PDF generation endpoint (optional — frontend also supports client-side)
router.get('/:id/pdf', async (req: Request, res: Response) => {
  try {
    // Try cache first
    const cached = await getCachedResult(`paper:${req.params.id}`);
    const paperData = cached
      ? JSON.parse(cached)
      : (await Assignment.findById(req.params.id))?.generatedPaper;

    if (!paperData) {
      return res.status(404).json({ success: false, error: 'Paper not found or not yet generated' });
    }

    // Return JSON for client-side PDF generation
    // (Server-side puppeteer PDF would require more RAM — client jsPDF is lighter)
    res.json({ success: true, data: paperData });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to generate PDF' });
  }
});

export default router;
