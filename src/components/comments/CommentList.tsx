'use client';

import { useState } from 'react';
import { Send, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { Avatar, Button } from '@/components/ui';
import { formatRelativeTime } from '@/lib/utils';
import type { Comment } from '@/types/database';

interface CommentListProps {
  comments: Comment[];
  onAddComment: (content: string, parentId?: string) => Promise<void>;
  onEditComment?: (id: string, content: string) => Promise<void>;
  onDeleteComment?: (id: string) => Promise<void>;
  currentUserId?: string;
}

export function CommentList({
  comments,
  onAddComment,
  onEditComment,
  onDeleteComment,
  currentUserId,
}: CommentListProps) {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      await onAddComment(newComment);
      setNewComment('');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (parentId: string) => {
    if (!replyContent.trim()) return;

    setLoading(true);
    try {
      await onAddComment(replyContent, parentId);
      setReplyContent('');
      setReplyingTo(null);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id: string) => {
    if (!editContent.trim() || !onEditComment) return;

    setLoading(true);
    try {
      await onEditComment(id, editContent);
      setEditingId(null);
      setEditContent('');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!onDeleteComment) return;

    setLoading(true);
    try {
      await onDeleteComment(id);
      setMenuOpen(null);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
    setMenuOpen(null);
  };

  // Get top-level comments and organize replies
  const topLevelComments = comments.filter((c) => !c.parent_comment_id);
  const getReplies = (parentId: string) =>
    comments.filter((c) => c.parent_comment_id === parentId);

  const CommentItem = ({ comment, depth = 0 }: { comment: Comment; depth?: number }) => {
    const replies = getReplies(comment.id);
    const isOwner = currentUserId === comment.author_id;

    return (
      <div className={`${depth > 0 ? 'ml-8 border-l border-zinc-800 pl-4' : ''}`}>
        <div className="py-3">
          <div className="flex items-start gap-3">
            <Avatar
              src={comment.author?.avatar_url}
              name={comment.author?.full_name || comment.author?.email || '?'}
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-white">
                  {comment.author?.full_name || comment.author?.email || 'Unknown'}
                </span>
                <span className="text-xs text-zinc-500">
                  {formatRelativeTime(comment.created_at)}
                </span>
                {comment.is_edited && (
                  <span className="text-xs text-zinc-600">(edited)</span>
                )}
              </div>

              {editingId === comment.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleEdit(comment.id)} loading={loading}>
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingId(null);
                        setEditContent('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-zinc-300 whitespace-pre-wrap">{comment.content}</p>
              )}

              {!editingId && (
                <div className="flex items-center gap-4 mt-2">
                  <button
                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                    className="text-xs text-zinc-500 hover:text-zinc-300"
                  >
                    Reply
                  </button>
                </div>
              )}
            </div>

            {isOwner && !editingId && (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(menuOpen === comment.id ? null : comment.id)}
                  className="p-1 text-zinc-500 hover:text-white rounded hover:bg-zinc-800"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                {menuOpen === comment.id && (
                  <div className="absolute right-0 mt-1 w-32 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg z-10">
                    <button
                      onClick={() => startEdit(comment)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-zinc-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {replyingTo === comment.id && (
            <div className="mt-3 ml-10 space-y-2">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white resize-none placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleReply(comment.id)} loading={loading}>
                  Reply
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyContent('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {replies.map((reply) => (
          <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* New comment form */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <Avatar name="You" size="sm" />
        <div className="flex-1 relative">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="w-full px-3 py-2 pr-10 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white resize-none placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
          />
          <button
            type="submit"
            disabled={!newComment.trim() || loading}
            className="absolute right-2 bottom-2 p-1.5 text-blue-500 hover:text-blue-400 disabled:text-zinc-600 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Comments list */}
      {comments.length === 0 ? (
        <p className="text-sm text-zinc-500 text-center py-4">No comments yet</p>
      ) : (
        <div className="divide-y divide-zinc-800">
          {topLevelComments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  );
}
