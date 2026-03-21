import { Router, Request, Response } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { Assignment } from '../models/Assignment';
import { assignmentQueue, getCachedResult } from '../lib/queue';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const CreateAssignmentSchema = z.object({
  title: z.string().min(1),
  subject: z.string().min(1),
  className: z.string().min(1),
  dueDate: z.string().min(1),
  questionTypes: z.array(z.object({
    type: z.string(),
    count: z.number().int().min(1),
    marks: z.number().int().min(1),
  })).min(1),
  additionalInstructions: z.string().optional(),
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const assignments = await Assignment.find()
      .select('-generatedPaper -fileContent')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: assignments });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch assignments' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: assignment });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch assignment' });
  }
});

router.get('/:id/paper', async (req: Request, res: Response) => {
  try {
    const cached = await getCachedResult(`paper:${req.params.id}`);
    if (cached) return res.json({ success: true, data: JSON.parse(cached), cached: true });
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ success: false, error: 'Not found' });
    if (!assignment.generatedPaper) return res.status(404).json({ success: false, error: 'Paper not generated yet' });
    res.json({ success: true, data: assignment.generatedPaper });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch paper' });
  }
});

router.post('/', upload.single('file'), async (req: Request, res: Response) => {
  try {
    let body: any;
    try {
      body = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body;
    } catch {
      body = req.body;
    }
    if (typeof body.questionTypes === 'string') {
      body.questionTypes = JSON.parse(body.questionTypes);
    }
    const validated = CreateAssignmentSchema.parse(body);
    let fileContent: string | undefined;
    if (req.file) {
      fileContent = req.file.buffer.toString('utf-8').substring(0, 5000);
    }
    const assignment = await Assignment.create({
      ...validated,
      dueDate: new Date(validated.dueDate),
      fileContent,
      jobStatus: 'pending',
    });
    const job = await assignmentQueue.add('generate', { assignmentId: assignment._id.toString() });
    await Assignment.findByIdAndUpdate(assignment._id, { jobId: job.id });
    res.status(201).json({ success: true, data: { assignmentId: assignment._id.toString(), jobId: job.id } });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: err.errors });
    }
    console.error('CREATE ERROR:', err.message);
    res.status(500).json({ success: false, error: err.message || 'Failed to create assignment' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await Assignment.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete' });
  }
});

router.post('/:id/regenerate', async (req: Request, res: Response) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ success: false, error: 'Not found' });
    await Assignment.findByIdAndUpdate(req.params.id, { jobStatus: 'pending', generatedPaper: null });
    const job = await assignmentQueue.add('generate', { assignmentId: req.params.id });
    await Assignment.findByIdAndUpdate(req.params.id, { jobId: job.id });
    res.json({ success: true, data: { jobId: job.id } });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to regenerate' });
  }
});

router.get('/job/:jobId/status', async (req: Request, res: Response) => {
  try {
    const job = await assignmentQueue.getJob(req.params.jobId);
    if (!job) return res.status(404).json({ success: false, error: 'Job not found' });
    const state = await job.getState();
    res.json({ success: true, data: { jobId: job.id, state } });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to get status' });
  }
});

export default router;
