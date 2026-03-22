import { Worker, Job } from 'bullmq';
import mongoose from 'mongoose';
import IORedis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

import { Assignment } from '../models/Assignment';
import { generateQuestionPaper } from '../services/aiService';
import { notifyClients } from '../lib/websocket';
import { setCachedResult } from '../lib/queue';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vedaai';

mongoose.connect(MONGO_URI).catch(console.error);

// const connection = new IORedis(REDIS_URL, {
//   maxRetriesPerRequest: null,
//   enableReadyCheck: false,
// });
const connection = {
  url: REDIS_URL,
};

const worker = new Worker(
  'assignment-generation',
  async (job: Job) => {
    const { assignmentId } = job.data;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) throw new Error(`Assignment ${assignmentId} not found`);

    await Assignment.findByIdAndUpdate(assignmentId, { jobStatus: 'processing' });

    notifyClients(job.id!, {
      type: 'JOB_STATUS',
      jobId: job.id!,
      status: 'processing',
      progress: 5,
    });

    const paper = await generateQuestionPaper(
      {
        title: assignment.title,
        subject: assignment.subject,
        className: assignment.className,
        questionTypes: assignment.questionTypes,
        additionalInstructions: assignment.additionalInstructions,
        fileContent: assignment.fileContent,
      },
      (progress) => {
        notifyClients(job.id!, {
          type: 'JOB_PROGRESS',
          jobId: job.id!,
          status: 'processing',
          progress,
        });
      }
    );

    await Assignment.findByIdAndUpdate(assignmentId, {
      jobStatus: 'completed',
      generatedPaper: paper,
    });

    // Cache the result
    await setCachedResult(`paper:${assignmentId}`, JSON.stringify(paper));

    notifyClients(job.id!, {
      type: 'JOB_COMPLETE',
      jobId: job.id!,
      status: 'completed',
      progress: 100,
      data: paper,
    });

    return paper;
  },
  { connection }
);

worker.on('failed', async (job, err) => {
  console.error(`Job ${job?.id} failed:`, err.message);
  if (job?.data?.assignmentId) {
    await Assignment.findByIdAndUpdate(job.data.assignmentId, { jobStatus: 'failed' });
    notifyClients(job.id!, {
      type: 'JOB_ERROR',
      jobId: job.id!,
      status: 'failed',
      error: err.message,
    });
  }
});

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

console.log('Worker started, waiting for jobs...');
