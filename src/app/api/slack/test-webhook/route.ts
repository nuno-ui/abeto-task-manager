import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { webhookUrl, saveAfterTest = true } = body;

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
        text: '🤖 *Task Companion Connected!*\n\nYour Abeto Task Manager is now linked to this Slack channel.\n\nYou can now use the Task Companion to get updates about your tasks and projects!',
      }),
    });

    console.log('Slack response status:', response.status);

    if (response.ok) {
      // Save the webhook URL to database if test was successful
      if (saveAfterTest) {
        const { error: saveError } = await supabase
          .from('app_settings')
          .upsert(
            {
              key: 'slack_webhook_url',
              value: webhookUrl,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'key' }
          );

        if (saveError) {
          console.error('Error saving webhook URL:', saveError);
          // Don't fail the request, just log it - the test was successful
        }
      }

      return NextResponse.json({ success: true, saved: saveAfterTest });
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
