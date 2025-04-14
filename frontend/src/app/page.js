"use client";

import React, { useState } from 'react';
import Image from 'next/image';

export default function Home() {
  const [url, setUrl] = useState('');
  const [command, setCommand] = useState('');
  const [isBrowserOpen, setIsBrowserOpen] = useState(false);
  const [streamUrl, setStreamUrl] = useState(null);
  const [commandResult, setCommandResult] = useState(null);
  const [streamKey, setStreamKey] = useState(0);

  const handleOpenBrowser = async () => {
    try {
      const response = await fetch(`http://localhost:3001/open${url ? `?url=${encodeURIComponent(url)}` : ''}`);
      const data = await response.json();
      
      if (data.success) {
        setIsBrowserOpen(true);
        setStreamUrl('http://localhost:3001/stream');
        setStreamKey(prev => prev + 1);
      } else {
        console.error('Error opening browser:', data.error);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleCloseBrowser = async () => {
    try {
      const response = await fetch('http://localhost:3001/close');
      const data = await response.json();
      
      if (data.success) {
        setIsBrowserOpen(false);
        setStreamUrl(null);
        setCommandResult(null);
      } else {
        console.error('Error closing browser:', data.error);
      }
    } catch (error) {
      console.error('Error closing browser:', error);
    }
  };

  const handleExecuteCommand = async () => {
    if (!command || !isBrowserOpen) return;

    try {
      const response = await fetch('http://localhost:3001/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command }),
      });

      const data = await response.json();
      setCommandResult(data);

      if (!data.success) {
        console.error('Error executing command:', data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      setCommandResult({ success: false, error: error.message });
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
          <div className="p-6">
            <h1 className="text-2xl font-semibold text-zinc-800 mb-6">
              Playwright Test Runner
            </h1>
            
            {/* URL Input and Browser Control */}
            <div className="flex gap-2 mb-6">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-zinc-900 placeholder:text-zinc-400"
                  placeholder="https://example.com"
                />
              </div>
              <button
                onClick={isBrowserOpen ? handleCloseBrowser : handleOpenBrowser}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors ${
                  isBrowserOpen 
                    ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' 
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {isBrowserOpen ? (
                    <path d="M18 6L6 18M6 6l12 12"/>
                  ) : (
                    <path d="M12 5v14M5 12h14"/>
                  )}
                </svg>
                {isBrowserOpen ? 'Close Browser' : 'Open Browser'}
              </button>
            </div>

            {/* Command Input */}
            <div className="space-y-4 mb-6">
              <div className="bg-zinc-50 rounded-lg p-4 border border-zinc-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-zinc-600">
                    Playwright Command
                  </label>
                  <button
                    onClick={handleExecuteCommand}
                    disabled={!isBrowserOpen}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      !isBrowserOpen
                        ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                        : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200'
                    }`}
                  >
                    Execute Command
                  </button>
                </div>
                <textarea
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  className="w-full h-24 p-3 text-sm font-mono bg-white rounded-md border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-zinc-900 placeholder:text-zinc-400"
                  placeholder="// Enter a single Playwright command, e.g.:
await page.goto('https://example.com');
await page.click('text=Login');
await page.fill('input[name=username]', 'test@example.com');"
                />
                {commandResult && (
                  <div className={`mt-2 p-2 rounded-md text-sm ${
                    commandResult.success 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {commandResult.success ? 'Command executed successfully' : `Error: ${commandResult.error}`}
                  </div>
                )}
              </div>
            </div>

            {/* Stream Display */}
            <div className="relative aspect-video rounded-lg overflow-hidden bg-zinc-100 border border-zinc-200">
              {isBrowserOpen && streamUrl ? (
                <Image
                  key={streamKey}
                  src={`${streamUrl}?t=${Date.now()}`}
                  alt="Browser Stream"
                  fill
                  className="object-contain"
                  unoptimized
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-zinc-400 text-sm">
                    {isBrowserOpen ? 'Starting stream...' : 'Browser will be displayed here'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}