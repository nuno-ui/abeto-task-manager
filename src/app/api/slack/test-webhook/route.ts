import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { webhookUrl } = await request.json();

    if (!webhookUrl || !webhookUrl.startsWith('https://hooks.slack.com/')) {
      return NextResponse.json(
        { error: 'Invalid webhook URL' },
        { status: 400 }
      );
    }

    // Send test message to Slack
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: '🤖 *Task Companion Connected!*\n\nYour Abeto Task Manager is now linked to this channel.\n\nTo complete setup, add this webhook URL to your Vercel environment variables:\n`SLACK_WEBHOOK_URL`\n\nThen you can mention @task-companion to ask questions!',
      }),
    });

    if (response.ok) {
      return NextResponse.json({ success: true });
    } else {
      const errorText = await response.text();
      console.error('Slack webhook error:', errorText);
      return NextResponse.json(
        { error: 'Webhook test failed', details: errorText },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Test webhook error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to Slack' },
      { status: 500 }
    );
  }
}
