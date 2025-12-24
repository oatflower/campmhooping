/**
 * Message CRUD Service
 * Handles Supabase operations for chat messages between users and hosts
 *
 * AUTH: Uses Supabase Auth via getCurrentUserId()
 * RLS policies enforce sender_id/recipient_id = get_profile_id()
 */

import { supabase } from '@/lib/supabase';
import { getCurrentUserId } from './constants';
import {
  getUserErrorMessage,
  errorResult,
  successResult,
  customErrorResult,
  type ServiceResult,
} from '@/utils/supabaseErrors';

// ============================================================================
// TYPES
// ============================================================================

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  booking_id: string | null;
  camp_id: string | null;
  content: string;
  attachments: string[];
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  deleted_at: string | null;
  // Joined data
  sender?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
  recipient?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
  camp?: {
    id: string;
    name: string;
  };
}

export interface Conversation {
  id: string; // recipient profile ID
  recipientId: string;
  recipientName: string;
  recipientAvatar: string | null;
  campId: string | null;
  campName: string | null;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isHost: boolean; // Whether the other party is a host
}

export interface SendMessageInput {
  recipientId: string;
  content: string;
  bookingId?: string;
  campId?: string;
  attachments?: string[];
}

// ============================================================================
// SEND MESSAGE
// ============================================================================

export async function sendMessage(
  input: SendMessageInput
): Promise<ServiceResult<Message>> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return customErrorResult('You must be logged in to send messages');
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: userId,
        recipient_id: input.recipientId,
        content: input.content,
        booking_id: input.bookingId || null,
        camp_id: input.campId || null,
        attachments: input.attachments || [],
      })
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url),
        recipient:profiles!messages_recipient_id_fkey(id, full_name, avatar_url)
      `)
      .single();

    if (error) {
      console.error('Error sending message:', error);
      return errorResult(error);
    }

    return successResult(data as Message);
  } catch (err) {
    console.error('Unexpected error sending message:', err);
    return customErrorResult('Failed to send message. Please try again.');
  }
}

// ============================================================================
// GET MESSAGES (for a conversation)
// ============================================================================

export async function getMessages(
  otherUserId: string,
  limit = 50,
  offset = 0
): Promise<ServiceResult<Message[]>> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return customErrorResult('You must be logged in to view messages');
    }

    // Get messages where current user is sender or recipient with the other user
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url),
        recipient:profiles!messages_recipient_id_fkey(id, full_name, avatar_url),
        camp:camps(id, name)
      `)
      .or(`and(sender_id.eq.${userId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${userId})`)
      .is('deleted_at', null)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching messages:', error);
      return errorResult(error);
    }

    return successResult((data || []) as Message[]);
  } catch (err) {
    console.error('Unexpected error fetching messages:', err);
    return customErrorResult('Failed to load messages. Please try again.');
  }
}

// ============================================================================
// GET CONVERSATIONS
// ============================================================================

export async function getConversations(): Promise<ServiceResult<Conversation[]>> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return customErrorResult('You must be logged in to view conversations');
    }

    // Get all messages where user is sender or recipient
    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        id,
        sender_id,
        recipient_id,
        content,
        is_read,
        created_at,
        camp_id,
        sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url, role),
        recipient:profiles!messages_recipient_id_fkey(id, full_name, avatar_url, role),
        camp:camps(id, name)
      `)
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      return errorResult(error);
    }

    // Group messages by conversation partner
    const conversationMap = new Map<string, Conversation>();

    for (const msg of messages || []) {
      // Determine the other party
      const isUserSender = msg.sender_id === userId;
      const otherParty = isUserSender ? msg.recipient : msg.sender;
      const otherId = isUserSender ? msg.recipient_id : msg.sender_id;

      if (!otherParty || !otherId) continue;

      // Count unread if user is recipient and message is unread
      const isUnread = !isUserSender && !msg.is_read;

      if (!conversationMap.has(otherId)) {
        conversationMap.set(otherId, {
          id: otherId,
          recipientId: otherId,
          recipientName: (otherParty as any).full_name || 'Unknown',
          recipientAvatar: (otherParty as any).avatar_url,
          campId: msg.camp_id,
          campName: (msg.camp as any)?.name || null,
          lastMessage: msg.content,
          lastMessageTime: msg.created_at,
          unreadCount: isUnread ? 1 : 0,
          isHost: (otherParty as any).role === 'host',
        });
      } else {
        // Update unread count
        const conv = conversationMap.get(otherId)!;
        if (isUnread) {
          conv.unreadCount++;
        }
      }
    }

    // Convert to array and sort by last message time
    const conversations = Array.from(conversationMap.values()).sort(
      (a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
    );

    return successResult(conversations);
  } catch (err) {
    console.error('Unexpected error fetching conversations:', err);
    return customErrorResult('Failed to load conversations. Please try again.');
  }
}

// ============================================================================
// MARK MESSAGES AS READ
// ============================================================================

export async function markMessagesAsRead(
  otherUserId: string
): Promise<ServiceResult<void>> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return customErrorResult('You must be logged in');
    }

    // Mark all messages from otherUser to current user as read
    const { error } = await supabase
      .from('messages')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('sender_id', otherUserId)
      .eq('recipient_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('Error marking messages as read:', error);
      return errorResult(error);
    }

    return successResult(undefined);
  } catch (err) {
    console.error('Unexpected error marking messages as read:', err);
    return customErrorResult('Failed to update messages.');
  }
}

// ============================================================================
// DELETE MESSAGE (soft delete)
// ============================================================================

export async function deleteMessage(
  messageId: string
): Promise<ServiceResult<void>> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return customErrorResult('You must be logged in');
    }

    const { error } = await supabase
      .from('messages')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', messageId)
      .eq('sender_id', userId); // Only sender can delete

    if (error) {
      console.error('Error deleting message:', error);
      return errorResult(error);
    }

    return successResult(undefined);
  } catch (err) {
    console.error('Unexpected error deleting message:', err);
    return customErrorResult('Failed to delete message.');
  }
}

// ============================================================================
// GET UNREAD COUNT
// ============================================================================

export async function getUnreadCount(): Promise<ServiceResult<number>> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return successResult(0);
    }

    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', userId)
      .eq('is_read', false)
      .is('deleted_at', null);

    if (error) {
      console.error('Error getting unread count:', error);
      return errorResult(error);
    }

    return successResult(count || 0);
  } catch (err) {
    console.error('Unexpected error getting unread count:', err);
    return successResult(0);
  }
}

// ============================================================================
// REAL-TIME SUBSCRIPTION
// ============================================================================

export function subscribeToMessages(
  userId: string,
  onNewMessage: (message: Message) => void
) {
  const channel = supabase
    .channel(`messages:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `recipient_id=eq.${userId}`,
      },
      async (payload) => {
        // Fetch full message with joins
        const { data } = await supabase
          .from('messages')
          .select(`
            *,
            sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url),
            recipient:profiles!messages_recipient_id_fkey(id, full_name, avatar_url),
            camp:camps(id, name)
          `)
          .eq('id', payload.new.id)
          .single();

        if (data) {
          onNewMessage(data as Message);
        }
      }
    )
    .subscribe();

  return channel;
}

export function unsubscribeFromMessages(channel: ReturnType<typeof subscribeToMessages>) {
  supabase.removeChannel(channel);
}
