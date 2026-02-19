import { useState, useRef, useEffect } from 'react';

export function ProfileDropdown({ user, onOpenProfile, onSignOut }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-xl bg-[#00ff9d]/10 border border-[#00ff9d]/30 
                   flex items-center justify-center text-[#00ff9d] font-bold text-sm
                   hover:bg-[#00ff9d]/20 hover:border-[#00ff9d]/50 hover:shadow-[0_0_15px_rgba(0,255,157,0.3)]
                   transition-all duration-200"
      >
        {user.name.charAt(0).toUpperCase()}
      </button>

      {isOpen && (
        <div className="absolute top-12 left-0 w-56 bg-[#0d1526] border border-[#00ff9d]/20 
                        rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden z-50
                        animate-[slideDown_0.2s_ease-out]">
          <div className="p-3 border-b border-white/[0.07]">
            <p className="text-white font-semibold text-sm">{user.name}</p>
            <p className="text-gray-500 text-xs mt-0.5">{user.email}</p>
          </div>
          
          <button
            onClick={() => {
              setIsOpen(false);
              onOpenProfile();
            }}
            className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-[#00ff9d]/10 
                       hover:text-[#00ff9d] transition-all flex items-center gap-3"
          >
            <span className="text-lg">👤</span>
            Your Profile
          </button>

          <button
            onClick={() => {
              setIsOpen(false);
              onSignOut();
            }}
            className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-red-500/10 
                       hover:text-red-400 transition-all flex items-center gap-3 border-t border-white/[0.07]"
          >
            <span className="text-lg">🚪</span>
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
