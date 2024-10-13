import { runDailyTasks } from '@/lib/scheduledTasks';

export async function GET() {
  try {
    await runDailyTasks();
    return new Response('Daily tasks completed successfully', { status: 200 });
  } catch (error) {
    console.error('Error running daily tasks:', error);
    return new Response('Error running daily tasks', { status: 500 });
  }
}
