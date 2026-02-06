import { NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy initialization to avoid build-time errors
let supabase: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (!supabase) {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return supabase;
}

// GET - Retrieve Slack settings
export async function GET() {
  try {
    const { data, error } = await getSupabaseClient()
      .from('app_settings')
      .select('key, value')
      .in('key', ['slack_webhook_url', 'slack_bot_token']);

    if (error) {
      console.error('Error fetching Slack settings:', error);
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }

    const settings: Record<string, string> = {};
    data?.forEach(row => {
      settings[row.key] = row.value;
    });

    return NextResponse.json({
      webhookUrl: settings.slack_webhook_url || '',
      botToken: settings.slack_bot_token ? '***configured***' : '', // Don't expose token
      isConfigured: !!(settings.slack_webhook_url || settings.slack_bot_token),
    });
  } catch (error) {
    console.error('Slack settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Save Slack settings (webhookUrl and/or botToken)
export async function POST(request: Request) {
  try {
    const { webhookUrl, botToken } = await request.json();

    // Validate webhook URL format if provided
    if (webhookUrl && !webhookUrl.startsWith('https://hooks.slack.com/')) {
      return NextResponse.json(
        { error: 'Invalid webhook URL - must start with https://hooks.slack.com/' },
        { status: 400 }
      );
    }

    // Validate bot token format if provided
    if (botToken && !botToken.startsWith('xoxb-')) {
      return NextResponse.json(
        { error: 'Invalid bot token - must start with xoxb-' },
        { status: 400 }
      );
    }

    const upserts = [];

    if (webhookUrl !== undefined) {
      upserts.push({
        key: 'slack_webhook_url',
        value: webhookUrl || '',
        updated_at: new Date().toISOString(),
      });
    }

    if (botToken !== undefined) {
      upserts.push({
        key: 'slack_bot_token',
        value: botToken || '',
        updated_at: new Date().toISOString(),
      });
    }

    if (upserts.length > 0) {
      const { error } = await getSupabaseClient()
        .from('app_settings')
        .upsert(upserts, { onConflict: 'key' });

      if (error) {
        console.error('Error saving Slack settings:', error);
        return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Slack settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
