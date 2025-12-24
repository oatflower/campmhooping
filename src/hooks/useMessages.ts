/**
 * useMessages Hook
 * React hook for managing chat messages with real-time updates
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  getConversations,
  getMessages,
  sendMessage,
  markMessagesAsRead,
  getUnreadCount,
  subscribeToMessages,
  unsubscribeFromMessages,
  type Conversation,
  type Message,
  type SendMessageInput,
} from '@/services/messageCrud';
import { toast } from 'sonner';

// ============================================================================
// useConversations - Get list of conversations
// ============================================================================

export function useConversations() {
  const { user, profileId } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<ReturnType<typeof subscribeToMessages> | null>(null);

  const fetchConversations = useCallback(async () => {
    if (!user || !profileId) {
      setConversations([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const result = await getConversations();

    if (result.success && result.data) {
      setConversations(result.data);
    } else {
      setError(result.error || 'Failed to load conversations');
    }

    setLoading(false);
  }, [user, profileId]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!profileId) return;

    // Initial fetch
    fetchConversations();

    // Subscribe to new messages
    channelRef.current = subscribeToMessages(profileId, (newMessage) => {
      // Refresh conversations when new message arrives
      fetchConversations();
    });

    return () => {
      if (channelRef.current) {
        unsubscribeFromMessages(channelRef.current);
      }
    };
  }, [profileId, fetchConversations]);

  return {
    conversations,
    loading,
    error,
    refresh: fetchConversations,
  };
}

// ============================================================================
// useChat - Chat with a specific user
// ============================================================================

export function useChat(otherUserId: string | null) {
  const { user, profileId } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<ReturnType<typeof subscribeToMessages> | null>(null);

  // Fetch messages for this conversation
  const fetchMessages = useCallback(async () => {
    if (!user || !profileId || !otherUserId) {
      setMessages([]);
      return;
    }

    setLoading(true);
    setError(null);

    const result = await getMessages(otherUserId);

    if (result.success && result.data) {
      setMessages(result.data);
      // Mark as read
      await markMessagesAsRead(otherUserId);
    } else {
      setError(result.error || 'Failed to load messages');
    }

    setLoading(false);
  }, [user, profileId, otherUserId]);

  // Send a message
  const send = useCallback(async (
    content: string,
    options?: { bookingId?: string; campId?: string }
  ) => {
    if (!profileId || !otherUserId || !content.trim()) {
      return false;
    }

    setSending(true);

    const input: SendMessageInput = {
      recipientId: otherUserId,
      content: content.trim(),
      bookingId: options?.bookingId,
      campId: options?.campId,
    };

    const result = await sendMessage(input);

    if (result.success && result.data) {
      // Add to local state immediately
      setMessages(prev => [...prev, result.data!]);
      setSending(false);
      return true;
    } else {
      toast.error(result.error || 'Failed to send message');
      setSending(false);
      return false;
    }
  }, [profileId, otherUserId]);

  // Subscribe to real-time updates for this conversation
  useEffect(() => {
    if (!profileId || !otherUserId) return;

    // Initial fetch
    fetchMessages();

    // Subscribe to new messages
    channelRef.current = subscribeToMessages(profileId, (newMessage) => {
      // Only add if from the other user in this conversation
      if (newMessage.sender_id === otherUserId) {
        setMessages(prev => {
          // Avoid duplicates
          if (prev.some(m => m.id === newMessage.id)) {
            return prev;
          }
          return [...prev, newMessage];
        });
        // Mark as read since we're viewing this conversation
        markMessagesAsRead(otherUserId);
      }
    });

    return () => {
      if (channelRef.current) {
        unsubscribeFromMessages(channelRef.current);
      }
    };
  }, [profileId, otherUserId, fetchMessages]);

  return {
    messages,
    loading,
    sending,
    error,
    send,
    refresh: fetchMessages,
  };
}

// ============================================================================
// useUnreadCount - Get total unread message count
// ============================================================================

export function useUnreadCount() {
  const { profileId } = useAuth();
  const [count, setCount] = useState(0);
  const channelRef = useRef<ReturnType<typeof subscribeToMessages> | null>(null);

  const fetchCount = useCallback(async () => {
    const result = await getUnreadCount();
    if (result.success) {
      setCount(result.data || 0);
    }
  }, []);

  useEffect(() => {
    if (!profileId) {
      setCount(0);
      return;
    }

    // Initial fetch
    fetchCount();

    // Subscribe to new messages to update count
    channelRef.current = subscribeToMessages(profileId, () => {
      fetchCount();
    });

    return () => {
      if (channelRef.current) {
        unsubscribeFromMessages(channelRef.current);
      }
    };
  }, [profileId, fetchCount]);

  return { count, refresh: fetchCount };
}
