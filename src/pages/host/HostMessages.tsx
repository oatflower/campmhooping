import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Send, ChevronLeft, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useConversations, useChat } from '@/hooks/useMessages';
import { formatDistanceToNow } from 'date-fns';
import { th, enUS } from 'date-fns/locale';

const HostMessages = () => {
  const { t, i18n } = useTranslation();
  const { profileId } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get conversations
  const { conversations, loading: loadingConversations } = useConversations();

  // Local state
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  // Get selected conversation
  const selectedConversation = conversations.find(c => c.recipientId === selectedUserId);

  // Chat with selected user
  const { messages, loading: loadingMessages, sending, send } = useChat(selectedUserId);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Filter conversations
  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (conv.campName?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesFilter = filter === 'all' || conv.unreadCount > 0;
    return matchesSearch && matchesFilter;
  });

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return formatDistanceToNow(date, {
        addSuffix: false,
        locale: i18n.language === 'th' ? th : enUS,
      });
    } catch {
      return dateStr;
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedUserId || sending) return;

    const success = await send(newMessage, {
      campId: selectedConversation?.campId || undefined,
    });

    if (success) {
      setNewMessage('');
    }
  };

  return (
    <main className="container py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">{t('hostMessages.title', 'Messages')}</h1>
        <p className="text-muted-foreground">{t('hostMessages.subtitle', 'Chat with your guests')}</p>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 h-[600px]">
          {/* Conversations List */}
          <div className={cn(
            "border-r border-border flex flex-col",
            selectedUserId && "hidden md:flex"
          )}>
            {/* Search & Filter */}
            <div className="p-4 border-b border-border space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t('hostMessages.search', 'Search conversations...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('all')}
                  className="flex-1"
                >
                  {t('hostMessages.all', 'All')}
                </Button>
                <Button
                  variant={filter === 'unread' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('unread')}
                  className="flex-1"
                >
                  {t('hostMessages.unread', 'Unread')}
                </Button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {loadingConversations ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">💬</div>
                  <p className="text-muted-foreground text-sm">
                    {filter === 'unread' ? t('hostMessages.noUnread', 'No unread messages') : t('hostMessages.noMessages', 'No messages yet')}
                  </p>
                </div>
              ) : (
                filteredConversations.map(conv => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedUserId(conv.recipientId)}
                    className={cn(
                      "w-full p-4 text-left border-b border-border hover:bg-secondary/50 transition-colors",
                      selectedUserId === conv.recipientId && "bg-secondary"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-lg flex-shrink-0">
                        {conv.recipientName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium truncate">{conv.recipientName}</span>
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            {formatTime(conv.lastMessageTime)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {conv.lastMessage}
                        </p>
                        {conv.campName && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {conv.campName}
                          </p>
                        )}
                      </div>
                      {conv.unreadCount > 0 && (
                        <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center flex-shrink-0">
                          {conv.unreadCount}
                        </div>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat View */}
          <div className={cn(
            "md:col-span-2 flex flex-col",
            !selectedUserId && "hidden md:flex"
          )}>
            <AnimatePresence mode="wait">
              {selectedUserId && selectedConversation ? (
                <motion.div
                  key={selectedUserId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col h-full"
                >
                  {/* Chat Header */}
                  <div className="p-4 border-b border-border flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="md:hidden"
                      onClick={() => setSelectedUserId(null)}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-lg">
                      {selectedConversation.recipientName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{selectedConversation.recipientName}</p>
                      {selectedConversation.campName && (
                        <p className="text-xs text-muted-foreground">{selectedConversation.campName}</p>
                      )}
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {loadingMessages ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        <p>{t('hostMessages.startChat', 'Start the conversation!')}</p>
                      </div>
                    ) : (
                      messages.map(msg => (
                        <div
                          key={msg.id}
                          className={cn(
                            "flex",
                            msg.sender_id === profileId ? "justify-end" : "justify-start"
                          )}
                        >
                          <div className={cn(
                            "max-w-[70%] rounded-2xl px-4 py-2",
                            msg.sender_id === profileId
                              ? "bg-foreground text-background rounded-br-md"
                              : "bg-secondary rounded-bl-md"
                          )}>
                            <p className="text-sm">{msg.content}</p>
                            <p className={cn(
                              "text-xs mt-1",
                              msg.sender_id === profileId ? "text-background/60" : "text-muted-foreground"
                            )}>
                              {formatTime(msg.created_at)}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="p-4 border-t border-border">
                    <div className="flex gap-2">
                      <Input
                        placeholder={t('hostMessages.typeMessage', 'Type a message...')}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        className="flex-1"
                        disabled={sending}
                      />
                      <Button onClick={handleSend} disabled={!newMessage.trim() || sending}>
                        {sending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-1 flex items-center justify-center"
                >
                  <div className="text-center">
                    <div className="text-6xl mb-4">💬</div>
                    <p className="text-muted-foreground">
                      {t('hostMessages.selectConversation', 'Select a conversation to start chatting')}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  );
};

export default HostMessages;
