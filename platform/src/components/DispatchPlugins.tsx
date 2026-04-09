import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Youtube,
  Twitter,
  Mail,
  Rss,
  Podcast,
  MessageSquare,
  Image,
  Hash,
  HelpCircle,
  Check,
  X,
  ExternalLink,
  Settings,
  Zap
} from 'lucide-react';

interface DispatchChannel {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  connected: boolean;
  url?: string;
  handle?: string;
  color: string;
}

interface DispatchPluginsProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

const DISPATCH_CHANNELS: DispatchChannel[] = [
  {
    id: 'youtube',
    name: 'YouTube',
    icon: <Youtube className="w-5 h-5" />,
    description: 'Subscribe to our channel for video updates',
    connected: false,
    url: 'https://youtube.com/@lianabanyan',
    color: '#FF0000'
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    icon: <Twitter className="w-5 h-5" />,
    description: 'Follow for real-time announcements',
    connected: false,
    handle: '@lianabanyan',
    url: 'https://twitter.com/lianabanyan',
    color: '#1DA1F2'
  },
  {
    id: 'bluesky',
    name: 'Bluesky',
    icon: <MessageSquare className="w-5 h-5" />,
    description: 'Follow on the decentralized social network',
    connected: false,
    handle: '@lianabanyan.bsky.social',
    url: 'https://bsky.app/profile/lianabanyan.bsky.social',
    color: '#0085FF'
  },
  {
    id: 'imgur',
    name: 'Imgur',
    icon: <Image className="w-5 h-5" />,
    description: 'Follow our gallery for infographics and deck cards',
    connected: false,
    handle: 'LianaBanyan',
    url: 'https://imgur.com/user/LianaBanyan',
    color: '#1BB76E'
  },
  {
    id: 'discord',
    name: 'Discord',
    icon: <Hash className="w-5 h-5" />,
    description: 'Join the community server for live discussion',
    connected: false,
    url: 'https://discord.gg/lianabanyan',
    color: '#5865F2'
  },
  {
    id: 'stackoverflow',
    name: 'Stack Overflow',
    icon: <HelpCircle className="w-5 h-5" />,
    description: 'Community Q&A — ask questions, find answers',
    connected: false,
    handle: '[lianabanyan]',
    url: 'https://stackoverflow.com/questions/tagged/lianabanyan',
    color: '#F48024'
  },
  {
    id: 'rss',
    name: 'RSS Feed',
    icon: <Rss className="w-5 h-5" />,
    description: 'Add to your favorite RSS reader',
    connected: false,
    url: 'https://cephas.lianabanyan.com/index.xml',
    color: '#FFA500'
  },
  {
    id: 'podcast',
    name: 'Podcast',
    icon: <Podcast className="w-5 h-5" />,
    description: 'Subscribe to audio updates (in development)',
    connected: false,
    color: '#9333EA'
  },
  {
    id: 'email',
    name: 'Email Digest',
    icon: <Mail className="w-5 h-5" />,
    description: 'Weekly summary of platform updates',
    connected: false,
    color: '#22C55E'
  }
];

const STORAGE_KEY = 'lb_dispatch_channels';

export const DispatchPlugins: React.FC<DispatchPluginsProps> = ({
  isOpen,
  onClose,
  userId
}) => {
  const [channels, setChannels] = useState<DispatchChannel[]>(DISPATCH_CHANNELS);
  const [showSuccess, setShowSuccess] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const savedConnections = JSON.parse(saved);
        setChannels(prev => prev.map(ch => ({
          ...ch,
          connected: savedConnections[ch.id] || false
        })));
      } catch (e) {
        console.error('Failed to load dispatch settings');
      }
    }
  }, []);

  const saveConnections = (updated: DispatchChannel[]) => {
    const connections: Record<string, boolean> = {};
    updated.forEach(ch => {
      connections[ch.id] = ch.connected;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(connections));
  };

  const handleConnect = (channelId: string) => {
    const channel = channels.find(c => c.id === channelId);
    if (!channel) return;

    if (channel.url) {
      window.open(channel.url, '_blank');
    }

    const updated = channels.map(ch => 
      ch.id === channelId ? { ...ch, connected: true } : ch
    );
    setChannels(updated);
    saveConnections(updated);
    
    setShowSuccess(channelId);
    setTimeout(() => setShowSuccess(null), 2000);
  };

  const handleDisconnect = (channelId: string) => {
    const updated = channels.map(ch => 
      ch.id === channelId ? { ...ch, connected: false } : ch
    );
    setChannels(updated);
    saveConnections(updated);
  };

  const handleEmailSubscribe = () => {
    if (!emailInput || !emailInput.includes('@')) return;
    
    const updated = channels.map(ch => 
      ch.id === 'email' ? { ...ch, connected: true } : ch
    );
    setChannels(updated);
    saveConnections(updated);
    
    setShowSuccess('email');
    setTimeout(() => setShowSuccess(null), 2000);
    setEmailInput('');
  };

  const connectedCount = channels.filter(c => c.connected).length;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden shadow-2xl border border-white/10"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <Bell className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Dispatch Plugins</h2>
                  <p className="text-sm text-white/60">
                    Get updates through your favorite platforms
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>
            
            {/* Connection Status */}
            <div className="mt-4 flex items-center gap-2">
              <div className="flex -space-x-1">
                {channels.filter(c => c.connected).map(ch => (
                  <div
                    key={ch.id}
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
                    style={{ backgroundColor: ch.color }}
                  >
                    {ch.icon}
                  </div>
                ))}
              </div>
              <span className="text-sm text-white/60">
                {connectedCount} of {channels.length} connected
              </span>
            </div>
          </div>

          {/* Channel List */}
          <div className="p-4 overflow-y-auto max-h-[50vh]">
            <div className="space-y-3">
              {channels.map(channel => (
                <motion.div
                  key={channel.id}
                  layout
                  className={`p-4 rounded-xl border transition-all ${
                    channel.connected
                      ? 'bg-white/5 border-emerald-500/30'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${channel.color}20` }}
                      >
                        <span style={{ color: channel.color }}>{channel.icon}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">{channel.name}</span>
                          {channel.connected && (
                            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                              Connected
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-white/50">{channel.description}</p>
                        {channel.handle && (
                          <p className="text-xs text-white/40 mt-1">{channel.handle}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {showSuccess === channel.id ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="p-2 bg-emerald-500 rounded-lg"
                        >
                          <Check className="w-4 h-4 text-white" />
                        </motion.div>
                      ) : channel.connected ? (
                        <button
                          onClick={() => handleDisconnect(channel.id)}
                          className="px-3 py-1.5 text-sm text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                          Disconnect
                        </button>
                      ) : (
                        <button
                          onClick={() => handleConnect(channel.id)}
                          className="px-3 py-1.5 text-sm bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-1"
                        >
                          Connect
                          {channel.url && <ExternalLink className="w-3 h-3" />}
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Email Input */}
                  {channel.id === 'email' && !channel.connected && (
                    <div className="mt-3 flex gap-2">
                      <input
                        type="email"
                        value={emailInput}
                        onChange={e => setEmailInput(e.target.value)}
                        placeholder="your@email.com"
                        className="flex-1 px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50"
                      />
                      <button
                        onClick={handleEmailSubscribe}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm rounded-lg transition-colors"
                      >
                        Subscribe
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/10 bg-black/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white/40 text-sm">
                <Zap className="w-4 h-4" />
                <span>Piggyback on platforms you already use</span>
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DispatchPlugins;
