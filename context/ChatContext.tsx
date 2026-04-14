'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export interface ChatAnchorRect {
  bottom: number;
  right: number;
  left: number;
  top: number;
  width: number;
}

interface ChatContextType {
  isChatOpen: boolean;
  anchorRect: ChatAnchorRect | null;
  openChat: (anchor?: ChatAnchorRect) => void;
  closeChat: () => void;
  toggleChat: (anchor?: ChatAnchorRect) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [anchorRect, setAnchorRect] = useState<ChatAnchorRect | null>(null);

  const openChat = (anchor?: ChatAnchorRect) => {
    if (anchor) setAnchorRect(anchor);
    setIsChatOpen(true);
  };
  const closeChat = () => {
    setIsChatOpen(false);
  };
  const toggleChat = (anchor?: ChatAnchorRect) => {
    setIsChatOpen((v) => {
      if (!v && anchor) setAnchorRect(anchor);
      if (v) setAnchorRect(null);
      return !v;
    });
  };

  return (
    <ChatContext.Provider value={{ isChatOpen, anchorRect, openChat, closeChat, toggleChat }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used inside ChatProvider');
  return ctx;
}
