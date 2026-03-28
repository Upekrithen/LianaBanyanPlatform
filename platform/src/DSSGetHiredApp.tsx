import { useState } from 'react';
import { DeckCardFrame } from './components/DSSDeckCardFrame';
import './styles/dss/wildfire.css';

function DSSGetHiredApp() {
  const [showStakeInfo, setShowStakeInfo] = useState(false);

  // Card 1: Get Your Cue Card - go to platform signup
  function handleCueCardClick() {
    window.open('https://lianabanyan.com/redcarpet', '_blank');
  }

  // Card 2: Your $100 Stake - show info modal
  function handleStakeClick() {
    setShowStakeInfo(true);
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950">
      {/* Main Landing Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-8">
        
        {/* Simple Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3">
            Get Hired Doing What You Like
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-xl mx-auto">
            Start a project with nothing. Design your business card. Keep it forever.
          </p>
        </div>

        {/* TWO DECK CARDS - The Core Demo */}
        <div className="flex items-start justify-center gap-8 md:gap-12 flex-wrap">
          
          {/* Card 1: GET YOUR CUE CARD */}
          <DeckCardFrame 
            cardId="cue-card"
            cardData={{
              topText: "Design Your",
              icon: "📇",
              bottomText: "Business Card — FREE",
              plaqueTitle: "GET YOUR CUE CARD",
              rarity: "legendary"
            }}
            onCardClick={handleCueCardClick}
          />
          
          {/* Card 2: YOUR $100 STAKE */}
          <DeckCardFrame 
            cardId="stake"
            cardData={{
              topText: "$100 in Patent IP",
              icon: "🎫",
              bottomText: "JOULES — Forever Stamps",
              plaqueTitle: "YOUR $100 STAKE",
              rarity: "mythic"
            }}
            onCardClick={handleStakeClick}
          />
        </div>

        {/* 6 Degrees Concept */}
        <div className="mt-12 text-center max-w-2xl mx-auto">
          <p className="text-gray-500 text-sm md:text-base mb-2">
            <span className="text-amber-500 font-semibold">6 Degrees of Separation</span>
          </p>
          <p className="text-gray-400 text-sm md:text-base">
            Someone you know knows someone who needs what you do.
            <br />
            <span className="text-gray-500">Share your Cue Card. They share theirs. Everyone connects.</span>
          </p>
        </div>

        {/* Simple CTA */}
        <div className="mt-8">
          <a 
            href="https://lianabanyan.com/redcarpet"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold px-8 py-4 rounded-lg transition-colors text-lg"
          >
            Get Started — It's Free
          </a>
          <p className="text-gray-600 text-xs mt-2 text-center">
            $5/year to create and sell. Free to browse and learn.
          </p>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="text-center py-4 text-gray-600 text-xs border-t border-gray-800">
        <p>
          © 2026 Liana Banyan Corporation · Cost + 20% — Forever · 
          <a href="/cephas" className="text-amber-600 hover:underline ml-1">
            Learn More
          </a>
        </p>
      </footer>

      {/* Stake Info Modal */}
      {showStakeInfo && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
          onClick={() => setShowStakeInfo(false)}
        >
          <div 
            className="bg-gray-900 border border-amber-600/30 rounded-xl p-6 md:p-8 max-w-lg w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-white mb-4">
              Your $100 Stake
            </h2>
            
            <div className="space-y-4 text-gray-300">
              <p>
                <span className="text-amber-500 font-semibold">We paid $525,000</span> over 9 years 
                to build 8 utility patents worth $630K declared (Cost + 20%) with a $116M pessimist's floor.
              </p>
              
              <p>
                We're giving away <span className="text-amber-500 font-semibold">$100 worth</span> of 
                that IP to each of the first 5,250 members. No tricks. No gotchas.
              </p>
              
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <p className="text-amber-400 font-semibold mb-2">What are JOULES?</p>
                <p className="text-sm">
                  Think of them as <span className="text-white">forever stamps</span> for platform services. 
                  Even if prices change, your JOULES buy the same service at 
                  <span className="text-amber-400"> Cost + 20%</span> — locked forever.
                </p>
              </div>
              
              <p className="text-sm text-gray-400">
                Your $100 stake means you <span className="text-white">own part of the patent portfolio</span>. 
                Use it to hire designers, get business cards printed, or fund your own project.
              </p>
            </div>
            
            <div className="mt-6 flex gap-3">
              <a 
                href="https://lianabanyan.com/redcarpet"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-semibold py-3 rounded-lg transition-colors text-center"
              >
                Claim Your Stake
              </a>
              <button 
                onClick={() => setShowStakeInfo(false)}
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DSSGetHiredApp;
