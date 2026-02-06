import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Retrieve Slack webhook URL
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'slack_webhook_url')
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching Slack settings:', error);
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }

    return NextResponse.json({
      webhookUrl: data?.value || '',
      isConfigured: !!(data?.value && data.value.length > 0),
    });
  } catch (error) {
    console.error('Slack settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Save Slack webhook URL
export async function POST(request: Request) {
  try {
    const { webhookUrl } = await request.json();

    // Validate webhook URL format
    if (webhookUrl && !webhookUrl.startsWith('https://hooks.slack.com/')) {
      return NextResponse.json(
        { error: 'Invalid webhook URL - must start with https://hooks.slack.com/' },
        { status: 400 }
      );
    }

    // Upsert the setting
    const { error } = await supabase
      .from('app_settings')
      .upsert(
        {
          key: 'slack_webhook_url',
          value: webhookUrl || '',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' }
      );

    if (error) {
      console.error('Error saving Slack settings:', error);
      return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Slack settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
