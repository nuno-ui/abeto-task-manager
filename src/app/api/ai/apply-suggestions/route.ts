import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

interface UpdateSuggestion {
  type: 'project' | 'task';
  id: string;
  field: string;
  suggestedValue: any;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { suggestions } = body;

    if (!suggestions || !Array.isArray(suggestions) || suggestions.length === 0) {
      return NextResponse.json(
        { error: 'Suggestions array is required' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const results: { success: boolean; suggestion: UpdateSuggestion; error?: string }[] = [];

    for (const suggestion of suggestions as UpdateSuggestion[]) {
      try {
        const table = suggestion.type === 'project' ? 'projects' : 'tasks';

        const { error } = await supabase
          .from(table)
          .update({ [suggestion.field]: suggestion.suggestedValue })
          .eq('id', suggestion.id);

        if (error) {
          results.push({
            success: false,
            suggestion,
            error: error.message
          });
        } else {
          results.push({
            success: true,
            suggestion
          });
        }
      } catch (err) {
        results.push({
          success: false,
          suggestion,
          error: err instanceof Error ? err.message : 'Unknown error'
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    return NextResponse.json({
      message: `Applied ${successCount} updates${failCount > 0 ? `, ${failCount} failed` : ''}`,
      results
    });

  } catch (error) {
    console.error('Error applying suggestions:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to apply suggestions' },
      { status: 500 }
    );
  }
}
