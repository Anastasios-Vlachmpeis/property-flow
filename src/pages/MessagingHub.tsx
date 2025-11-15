import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Send, RefreshCw, Sparkles } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useState } from 'react';
import { fakeApiCall } from '@/lib/mockData';
import { toast } from 'sonner';

const platformIcons = {
  airbnb: '🏠',
  booking: '📘',
  vrbo: '🏖️',
};

const aiSuggestions = [
  "Thank you for your message! Check-in is at 3:00 PM. I'll send you detailed instructions closer to your arrival date.",
  "Yes, free parking is included with your reservation. There's a dedicated spot right in front of the property.",
  "I appreciate your inquiry! The property accommodates up to 4 guests comfortably.",
];

export default function MessagingHub() {
  const { chats, selectedChat, setSelectedChat } = useStore();
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(true);
  const [replyText, setReplyText] = useState('');

  const handleSendMessage = async () => {
    await fakeApiCall('/messages/send', { chatId: selectedChat?.id, message: replyText });
    toast.success('Message sent successfully');
    setReplyText('');
  };

  const handleApplySuggestion = (suggestion: string) => {
    setReplyText(suggestion);
  };

  const handleRegenerate = async () => {
    await fakeApiCall('/messages/regenerate', { chatId: selectedChat?.id });
    toast.success('New suggestions generated');
  };

  return (
    <AppLayout title="Messaging Hub">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold text-foreground mb-4">Conversations</h3>
          <div className="space-y-2">
            {chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                className={`p-3 rounded-lg cursor-pointer transition-all hover:shadow-sm ${
                  selectedChat?.id === chat.id
                    ? 'bg-primary/10 border-2 border-primary'
                    : 'bg-card border border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{platformIcons[chat.platform]}</span>
                    <h4 className="font-semibold text-foreground text-sm">{chat.guestName}</h4>
                  </div>
                  <Badge variant={chat.isAuto ? 'default' : 'secondary'} className="text-xs">
                    {chat.isAuto ? 'Auto' : 'Manual'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1">{chat.preview}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Chat Window */}
        <Card className="lg:col-span-2">
          {selectedChat ? (
            <div className="flex h-[600px]">
              {/* Messages */}
              <div className="flex-1 flex flex-col">
                <div className="p-4 border-b border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{platformIcons[selectedChat.platform]}</span>
                      <div>
                        <h3 className="font-semibold text-foreground">{selectedChat.guestName}</h3>
                        <p className="text-xs text-muted-foreground capitalize">{selectedChat.platform}</p>
                      </div>
                    </div>
                    <Badge variant={selectedChat.isAuto ? 'default' : 'secondary'}>
                      {selectedChat.isAuto ? 'Auto-Reply On' : 'Manual'}
                    </Badge>
                  </div>
                </div>

                <div className="flex-1 p-4 space-y-4 overflow-auto">
                  {selectedChat.messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.sender === 'host' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          msg.sender === 'host'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        <p className="text-sm">{msg.text}</p>
                        <p className="text-xs mt-1 opacity-70">{msg.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 border-t border-border">
                  <div className="flex gap-2">
                    <Textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your message..."
                      className="resize-none"
                      rows={2}
                    />
                    <Button onClick={handleSendMessage} size="icon" className="shrink-0">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* AI Reply Panel */}
              <div className="w-80 border-l border-border p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-reply" className="text-sm font-semibold">Auto-Reply</Label>
                  <Switch
                    id="auto-reply"
                    checked={autoReplyEnabled}
                    onCheckedChange={setAutoReplyEnabled}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-foreground">AI Suggestions</h4>
                    <Button onClick={handleRegenerate} variant="ghost" size="sm">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {aiSuggestions.map((suggestion, i) => (
                      <button
                        key={i}
                        onClick={() => handleApplySuggestion(suggestion)}
                        className="w-full text-left p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm text-foreground"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>

                <Button className="w-full gap-2" variant="secondary">
                  <Sparkles className="h-4 w-4" />
                  Generate Custom Reply
                </Button>
              </div>
            </div>
          ) : (
            <div className="h-[600px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Send className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Select a conversation to view messages</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}
