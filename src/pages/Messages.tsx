import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MessageSquare, Send, ArrowLeft, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useConversations, useChat } from '@/hooks/useMessages';
import { formatDistanceToNow } from 'date-fns';
import { th, enUS } from 'date-fns/locale';

const Messages = () => {
    const { t, i18n } = useTranslation();
    const { user, profileId } = useAuth();
    const navigate = useNavigate();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Get conversations list
    const { conversations, loading: loadingConversations } = useConversations();

    // Selected conversation state
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const selectedConversation = conversations.find(c => c.recipientId === selectedUserId);

    // Chat with selected user
    const { messages, loading: loadingMessages, sending, send } = useChat(selectedUserId);
    const [newMessage, setNewMessage] = useState('');

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Format time helper
    const formatTime = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            return formatDistanceToNow(date, {
                addSuffix: true,
                locale: i18n.language === 'th' ? th : enUS,
            });
        } catch {
            return dateStr;
        }
    };

    // Auth is handled by ProtectedRoute wrapper

    const handleSendMessage = async () => {
        if (!newMessage.trim() || sending) return;

        const success = await send(newMessage, {
            campId: selectedConversation?.campId || undefined,
        });

        if (success) {
            setNewMessage('');
        }
    };

    const handleSelectConversation = (recipientId: string) => {
        setSelectedUserId(recipientId);
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />
            <main className="flex-1 container py-6 md:py-12">
                <div className="max-w-5xl mx-auto">
                    <h1 className="text-2xl md:text-3xl font-bold mb-6">{t('profile.messages', 'Messages')}</h1>

                    <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
                        <div className="flex h-[500px] md:h-[600px]">
                            {/* Conversation List */}
                            <div className={cn(
                                "w-full md:w-80 border-r border-border flex-shrink-0",
                                selectedUserId ? "hidden md:block" : "block"
                            )}>
                                <div className="p-3 border-b border-border">
                                    <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                                        {t('messages.conversations', 'Conversations')}
                                    </h2>
                                </div>
                                <div className="overflow-y-auto h-[calc(100%-48px)]">
                                    {loadingConversations ? (
                                        <div className="flex items-center justify-center h-full">
                                            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                                        </div>
                                    ) : conversations.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                                            <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
                                            <p className="text-muted-foreground">{t('messages.noConversations', 'No conversations yet')}</p>
                                            <p className="text-sm text-muted-foreground mt-2">{t('messages.startByBooking', 'Book a camp to start messaging hosts')}</p>
                                        </div>
                                    ) : conversations.map(conv => (
                                        <button
                                            key={conv.id}
                                            onClick={() => handleSelectConversation(conv.recipientId)}
                                            className={cn(
                                                "w-full p-4 flex items-start gap-3 hover:bg-secondary/50 transition-colors text-left border-b border-border",
                                                selectedUserId === conv.recipientId && "bg-secondary"
                                            )}
                                        >
                                            <Avatar className="w-12 h-12 flex-shrink-0">
                                                <AvatarImage src={conv.recipientAvatar || ''} />
                                                <AvatarFallback>{conv.recipientName.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className={cn("font-medium truncate", conv.unreadCount > 0 && "font-bold")}>
                                                        {conv.recipientName}
                                                    </p>
                                                    <span className="text-xs text-muted-foreground flex-shrink-0">
                                                        {formatTime(conv.lastMessageTime)}
                                                    </span>
                                                </div>
                                                {conv.campName && (
                                                    <p className="text-xs text-muted-foreground truncate">{conv.campName}</p>
                                                )}
                                                <p className={cn(
                                                    "text-sm truncate mt-0.5",
                                                    conv.unreadCount > 0 ? "text-foreground font-medium" : "text-muted-foreground"
                                                )}>
                                                    {conv.lastMessage}
                                                </p>
                                            </div>
                                            {conv.unreadCount > 0 && (
                                                <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center flex-shrink-0">
                                                    {conv.unreadCount}
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Chat Panel */}
                            <div className={cn(
                                "flex-1 flex flex-col",
                                !selectedUserId ? "hidden md:flex" : "flex"
                            )}>
                                {selectedUserId && selectedConversation ? (
                                    <>
                                        {/* Chat Header */}
                                        <div className="p-4 border-b border-border flex items-center gap-3">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="md:hidden"
                                                onClick={() => setSelectedUserId(null)}
                                            >
                                                <ArrowLeft className="w-5 h-5" />
                                            </Button>
                                            <Avatar className="w-10 h-10">
                                                <AvatarImage src={selectedConversation.recipientAvatar || ''} />
                                                <AvatarFallback>{selectedConversation.recipientName.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-semibold">{selectedConversation.recipientName}</p>
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
                                                    <p>{t('messages.noMessages', 'No messages yet. Say hello!')}</p>
                                                </div>
                                            ) : messages.map((msg) => (
                                                <div
                                                    key={msg.id}
                                                    className={cn(
                                                        "flex",
                                                        msg.sender_id === profileId ? "justify-end" : "justify-start"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "max-w-[80%] px-4 py-2 rounded-2xl",
                                                        msg.sender_id === profileId
                                                            ? "bg-primary text-primary-foreground rounded-br-md"
                                                            : "bg-secondary text-foreground rounded-bl-md"
                                                    )}>
                                                        <p className="text-sm">{msg.content}</p>
                                                        <p className={cn(
                                                            "text-[10px] mt-1",
                                                            msg.sender_id === profileId ? "text-primary-foreground/70" : "text-muted-foreground"
                                                        )}>
                                                            {formatTime(msg.created_at)}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                            <div ref={messagesEndRef} />
                                        </div>

                                        {/* Input */}
                                        <div className="p-4 border-t border-border">
                                            <div className="flex gap-2">
                                                <Input
                                                    value={newMessage}
                                                    onChange={(e) => setNewMessage(e.target.value)}
                                                    placeholder={t('messages.typeMessage', 'Type a message...')}
                                                    className="flex-1"
                                                    disabled={sending}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && !e.shiftKey) {
                                                            e.preventDefault();
                                                            handleSendMessage();
                                                        }
                                                    }}
                                                />
                                                <Button
                                                    onClick={handleSendMessage}
                                                    disabled={!newMessage.trim() || sending}
                                                >
                                                    {sending ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Send className="w-4 h-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex-1 flex items-center justify-center text-center p-8">
                                        <div>
                                            <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                                            <h2 className="text-xl font-semibold mb-2">
                                                {t('messages.selectConversation', 'Select a conversation')}
                                            </h2>
                                            <p className="text-muted-foreground">
                                                {t('messages.selectHint', 'Choose a conversation from the list to start chatting')}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Messages;
