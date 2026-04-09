/**
 * CephasFAB — Bottom-LEFT floating button to enter the Cephas Library.
 * Always accessible. The basement of the museum.
 * (LRH is on the RIGHT)
 */
import { useNavigate } from "react-router-dom";
import { BookOpen } from "lucide-react";

export function CephasFAB() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/library")}
      className="fixed bottom-4 left-4 z-50 w-14 h-14 rounded-full bg-indigo-600/90 hover:bg-indigo-500 shadow-lg shadow-indigo-600/25 flex items-center justify-center transition-all active:scale-95"
      aria-label="Open Cephas Library"
    >
      <BookOpen className="w-6 h-6 text-white" />
    </button>
  );
}

export default CephasFAB;
