import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { webhookUrl } = body;

    console.log('Testing webhook URL:', webhookUrl ? `${webhookUrl.substring(0, 50)}...` : 'missing');

    if (!webhookUrl) {
      return NextResponse.json(
        { error: 'Webhook URL is required' },
        { status: 400 }
      );
    }

    if (!webhookUrl.startsWith('https://hooks.slack.com/')) {
      return NextResponse.json(
        { error: 'Invalid webhook URL - must start with https://hooks.slack.com/' },
        { status: 400 }
      );
    }

    // Send test message to Slack
    console.log('Sending test message to Slack...');
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: '🤖 *Task Companion Connected!*\n\nYour Abeto Task Manager is now linked to this channel.\n\nTo complete setup, add this webhook URL to your Vercel environment variables:\n`SLACK_WEBHOOK_URL`\n\nThen you can mention @task-companion to ask questions!',
      }),
    });

    console.log('Slack response status:', response.status);

    if (response.ok) {
      return NextResponse.json({ success: true });
    } else {
      const errorText = await response.text();
      console.error('Slack webhook error:', response.status, errorText);

      // Common Slack errors
      let friendlyError = 'Webhook test failed';
      if (errorText.includes('invalid_token') || errorText.includes('channel_not_found')) {
        friendlyError = 'Invalid webhook URL or channel not found. Please create a new webhook.';
      } else if (errorText.includes('no_service')) {
        friendlyError = 'Webhook is disabled. Please re-enable it in Slack app settings.';
      } else if (response.status === 404) {
        friendlyError = 'Webhook URL not found. It may have been deleted.';
      } else if (response.status === 403) {
        friendlyError = 'Access denied. Check your Slack app permissions.';
      }

      return NextResponse.json(
        { error: friendlyError, details: errorText },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Test webhook error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to connect: ${errorMessage}` },
      { status: 500 }
    );
  }
}
