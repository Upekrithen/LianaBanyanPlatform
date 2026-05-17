/**
 * Rotating Quotes Component
 *
 * Displays inspirational quotes that rotate automatically.
 * Includes the original "Ideas are Free" quotes plus Audrey Hepburn.
 *
 * Used at the top of the landing page.
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

interface Quote {
  text: string;
  author: string;
  link?: string;
  isYvaine?: boolean;
}

const QUOTES: Quote[] = [
  // 1. Reid Hoffman
  {
    text: "If you aren't ashamed of version 1 of your website, you launched too late.",
    author: "Reid Hoffman, LinkedIn Co-Founder",
    link: "/fly-on-the-wall",
  },
  // 2. The Doors
  {
    text: "The time to hesitate is through.",
    author: "The Doors, 'Light My Fire'",
  },
  // 3. Great-Aunt Yvaine (Stardust) — triggers star effect
  {
    text: "In the darkest moments, when all seems lost, remember what my Great-Aunt Yvaine, Queen of Stormhold, said: 'What do stars do? They SHINE.'",
    author: "The Founder, Liana Banyan",
    isYvaine: true,
  },
  // 18. Martin Luther King Jr.
  {
    text: "If you can't fly then run, if you can't run then walk, if you can't walk then crawl, but whatever you do keep moving forward.",
    author: "Martin Luther King Jr.",
  },
  // 4. Empire Records
  {
    text: "I am guided by a force much greater than luck.",
    author: "Lucas, Empire Records (1995)",
  },
  // 35. Nelson Mandela
  {
    text: "Money won't create success, the freedom to make it will.",
    author: "Nelson Mandela",
  },
  // 28. Burkinabé proverb
  {
    text: "If the river route changes, the crocodile is obliged to follow.",
    author: "Burkinabé proverb (West Africa)",
  },
  // 6. C.S. Lewis
  {
    text: "The grass here would cut your feet to pieces at first. You are only a shadow. The first step is always the hardest.",
    author: "C.S. Lewis, The Great Divorce",
  },
  // 34. Theodore Roosevelt
  {
    text: "Believe you can, and you're halfway there.",
    author: "Theodore Roosevelt",
  },
  // 33. Uncle Iroh
  {
    text: "Sometimes the best way to solve your own problems is to help someone else.",
    author: "Uncle Iroh, Avatar: The Last Airbender",
  },
  // 19. Muhammad Ali
  {
    text: "Those who lack the courage to take risks will achieve nothing in life.",
    author: "Muhammad Ali",
  },
  // 24. West African proverb
  {
    text: "If you want to go fast, go alone. If you want to go far, go together.",
    author: "West African proverb (Burkina Faso)",
  },
  // 20. Wilma Mankiller
  {
    text: "The secret of our success is that we never, never give up.",
    author: "Wilma Mankiller",
  },
  // 29. Irish proverb
  {
    text: "There is no strength without unity.",
    author: "Irish proverb (Gaelic)",
  },
  // 17. A Bug's Life
  {
    text: "Pretend this is a seed.",
    author: "Flick, A Bug's Life (1998)",
  },
  // 27. Roberto Clemente
  {
    text: "If you have a chance to accomplish something that will make things better for people coming behind you, and you don’t do that, you are wasting your time on this Earth.",
    author: "Roberto Clemente",
  },
  // 14. Audrey Hepburn
  {
    text: "As you grow older, you will discover that you have two hands, one for helping yourself, the other for helping others.",
    author: "Audrey Hepburn",
    link: "/help-each-other",
  },
  // 12. Grim Reaper
  {
    text: "Where are your scars? Was nothing worth fighting for?",
    author: "The Grim Reaper",
  },
  // 25. Paulo Coelho
  {
    text: "Be brave. Take risks. Nothing can substitute experience.",
    author: "Paulo Coelho",
  },
  // 15. Liana Banyan
  {
    text: "Help Each Other Help Ourselves.",
    author: "Liana Banyan",
    link: "/help-each-other",
  },
  // Founder
  {
    text: "Find the Will to Act, and the Courage to Believe.",
    author: "The Founder, Liana Banyan",
  },
  // 36. Zig Ziglar
  {
    text: "You can get everything in life you want if you will just help enough other people get what they want.",
    author: "Zig Ziglar",
  },
  // 9. The Founder (army ants)
  {
    text: "If you have ever seen African army ants cross a river, it's an inspiring spectacle. They link together and BECOME the bridge: an Unstoppable Force.",
    author: "The Founder",
  },
  // 32. Mentor
  {
    text: "Meals are a time of joy, not stress, and we're all here for the same reason.",
    author: "Mentor, Frieren: Beyond Journey's End",
  },
  // 23. Sitting Bull
  {
    text: "Let us put our minds together and see what life we can make for our children.",
    author: "Sitting Bull",
  },
  // 22. Booker T. Washington
  {
    text: "There are two ways of exerting one's strength: one is pushing down, the other is pulling up.",
    author: "Booker T. Washington",
  },
  // 4. Treasure Planet
  {
    text: "You're gonna rattle the stars, you are. I hope I'm there to see it.",
    author: "Long John Silver, Treasure Planet (2002)",
  },
  // 30. John Donne
  {
    text: "No man is an island.",
    author: "Jon Bon Jov... John Donne",
  },
  // 11. King David
  {
    text: "I will not offer that which costs me nothing.",
    author: "King David",
  },
  // 16. Helen Keller
  {
    text: "Alone we can do so little; together we can do so much.",
    author: "Helen Keller",
  },
  // 31. Rocky Balboa
  {
    text: "It ain't about how hard you hit; it's about how hard you can get hit and keep moving forward. How much you can take and keep moving forward. That's how winning is done.",
    author: "Rocky Balboa",
  },
  // 21. Carlos Barrios
  {
    text: "If you take responsibility and you create the development of your own self, you're going to help not just you, you're going to help humanity.",
    author: "Carlos Barrios",
  },
  // 26. Raiza Mendoza
  {
    text: "The most wonderful thing about life is that you can always begin again.",
    author: "Raiza Mendoza",
  },
];

interface RotatingQuotesProps {
  intervalMs?: number;
  className?: string;
  style?: React.CSSProperties;
  isActive?: boolean;
}

export function RotatingQuotes({
  intervalMs = 8000,
  className = "",
  style = {},
  isActive = true,
}: RotatingQuotesProps) {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!isActive) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % QUOTES.length);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [intervalMs, isActive]);

  useEffect(() => {
    if (!isActive) return;
    if (!QUOTES[currentIndex]?.isYvaine) return;

    // Delay slightly so the quote is readable before the shine sequence starts.
    const timer = window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent('yvaine-shine'));
    }, 1500);

    return () => window.clearTimeout(timer);
  }, [currentIndex, isActive]);

  const currentQuote = QUOTES[currentIndex];

  const handleClick = () => {
    if (currentQuote.link) {
      navigate(currentQuote.link);
    }
  };

  return (
    <div
      className={`text-center ${className}`}
      style={{
        minHeight: '90px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        ...style
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
          onClick={handleClick}
          style={{ cursor: currentQuote.link ? 'pointer' : 'default' }}
        >
          <p
            className="text-white/80 italic"
            style={{
              fontFamily: "'Crimson Pro', Georgia, serif",
              fontSize: 'clamp(0.85rem, 2vw, 1.1rem)',
              lineHeight: 1.5,
              width: '500px',
              maxWidth: '90vw',
              margin: '0 auto',
              textWrap: 'balance' as any,
            }}
          >
            "{currentQuote.text}"
          </p>
          <p
            className={`mt-2 text-sm ${currentQuote.link ? 'text-green-400 hover:text-green-300' : 'text-white/50'}`}
            style={{ transition: 'color 0.2s ease' }}
          >
            — {currentQuote.author}
            {currentQuote.link && (
              <span className="ml-1 text-xs">→</span>
            )}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Progress dots */}
      <div className="flex gap-1.5 mt-3">
        {QUOTES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`w-1.5 h-1.5 rounded-full transition-all ${
              i === currentIndex
                ? 'bg-green-400 w-4'
                : 'bg-white/20 hover:bg-white/40'
            }`}
            aria-label={`Go to quote ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export default RotatingQuotes;
