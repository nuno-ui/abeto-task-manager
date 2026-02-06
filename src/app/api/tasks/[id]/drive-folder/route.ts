import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Extract folder ID from Google Drive URL
function extractFolderId(url: string): string | null {
  // Handle different Google Drive URL formats
  // https://drive.google.com/drive/folders/FOLDER_ID
  // https://drive.google.com/drive/u/0/folders/FOLDER_ID
  const folderMatch = url.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (folderMatch) {
    return folderMatch[1];
  }
  return null;
}

// GET - Get task's Google Drive folder info
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: task, error } = await supabase
      .from('tasks')
      .select('id, title, google_drive_folder_url, google_drive_folder_id, project:projects(title)')
      .eq('id', id)
      .single();

    if (error || !task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({
      taskId: task.id,
      taskTitle: task.title,
      projectTitle: (task.project as { title: string } | null)?.title || null,
      folderUrl: task.google_drive_folder_url,
      folderId: task.google_drive_folder_id,
      isConfigured: !!task.google_drive_folder_url,
    });
  } catch (error) {
    console.error('Error fetching Drive folder:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Set or update task's Google Drive folder URL
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { folderUrl } = await request.json();

    // Validate URL format if provided
    if (folderUrl && !folderUrl.includes('drive.google.com')) {
      return NextResponse.json(
        { error: 'Invalid URL - must be a Google Drive folder URL' },
        { status: 400 }
      );
    }

    // Extract folder ID from URL
    const folderId = folderUrl ? extractFolderId(folderUrl) : null;

    // Update task with folder info
    const { data: task, error } = await supabase
      .from('tasks')
      .update({
        google_drive_folder_url: folderUrl || null,
        google_drive_folder_id: folderId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('id, title, google_drive_folder_url, google_drive_folder_id')
      .single();

    if (error) {
      console.error('Error updating Drive folder:', error);
      return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      taskId: task.id,
      folderUrl: task.google_drive_folder_url,
      folderId: task.google_drive_folder_id,
    });
  } catch (error) {
    console.error('Error setting Drive folder:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Remove task's Google Drive folder link
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { error } = await supabase
      .from('tasks')
      .update({
        google_drive_folder_url: null,
        google_drive_folder_id: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('Error removing Drive folder:', error);
      return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing Drive folder:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
