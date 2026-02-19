import { useState } from 'react';

export function ProfileModal({ user, onClose, onSave }) {
  const [profile, setProfile] = useState({
    name: user.name || '',
    email: user.email || '',
    dob: user.dob || '',
    weight: user.weight || '',
    height: user.height || '',
  });

  const [errors, setErrors] = useState({});

  const update = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!profile.name.trim()) newErrors.name = 'Name is required';
    if (profile.weight && (profile.weight < 20 || profile.weight > 300)) {
      newErrors.weight = 'Weight must be 20-300 kg';
    }
    if (profile.height && (profile.height < 50 || profile.height > 250)) {
      newErrors.height = 'Height must be 50-250 cm';
    }
    return newErrors;
  };

  const handleSave = () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSave(profile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
      <div className="w-full max-w-md bg-[#0d1526]/95 border border-[#00ff9d]/20 rounded-2xl 
                      shadow-[0_0_50px_rgba(0,255,157,0.15)] relative">
        
        {/* Header */}
        <div className="p-6 border-b border-white/[0.07]">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center 
                       text-gray-500 hover:text-[#00ff9d] rounded-lg hover:bg-[#00ff9d]/10 
                       transition-all"
          >
            ✕
          </button>
          <h2 className="text-2xl font-bold text-white">Your Profile</h2>
          <p className="text-gray-400 text-sm mt-1">Update your personal information</p>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          
          {/* Avatar */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-[#00ff9d]/10 border-2 border-[#00ff9d]/30 
                            flex items-center justify-center text-[#00ff9d] text-3xl font-bold
                            shadow-[0_0_20px_rgba(0,255,157,0.2)]">
              {profile.name.charAt(0).toUpperCase()}
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">
              👤 Full Name
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => update('name', e.target.value)}
              className="w-full bg-[#060b14] border border-[#00ff9d]/20 text-white text-sm 
                         rounded-xl px-4 py-3 outline-none placeholder-gray-600
                         focus:border-[#00ff9d]/50 focus:shadow-[0_0_15px_rgba(0,255,157,0.1)]
                         transition-all"
              placeholder="Enter your full name"
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">⚠ {errors.name}</p>}
          </div>

          {/* Email - Read Only */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">
              ✉️ Email Address
            </label>
            <input
              type="email"
              value={profile.email}
              disabled
              className="w-full bg-[#060b14]/50 border border-[#00ff9d]/10 text-gray-400 text-sm 
                         rounded-xl px-4 py-3 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed after signup</p>
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">
              📅 Date of Birth
            </label>
            <input
              type="date"
              value={profile.dob}
              onChange={(e) => update('dob', e.target.value)}
              className="w-full bg-[#060b14] border border-[#00ff9d]/20 text-white text-sm 
                         rounded-xl px-4 py-3 outline-none
                         focus:border-[#00ff9d]/50 focus:shadow-[0_0_15px_rgba(0,255,157,0.1)]
                         transition-all"
            />
          </div>

          {/* Weight & Height */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">
                ⚖️ Weight (kg)
              </label>
              <input
                type="number"
                value={profile.weight}
                onChange={(e) => update('weight', e.target.value)}
                className="w-full bg-[#060b14] border border-[#00ff9d]/20 text-white text-sm 
                           rounded-xl px-4 py-3 outline-none placeholder-gray-600
                           focus:border-[#00ff9d]/50 focus:shadow-[0_0_15px_rgba(0,255,157,0.1)]
                           transition-all"
                placeholder="70"
              />
              {errors.weight && <p className="text-red-400 text-xs mt-1">⚠ {errors.weight}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">
                📏 Height (cm)
              </label>
              <input
                type="number"
                value={profile.height}
                onChange={(e) => update('height', e.target.value)}
                className="w-full bg-[#060b14] border border-[#00ff9d]/20 text-white text-sm 
                           rounded-xl px-4 py-3 outline-none placeholder-gray-600
                           focus:border-[#00ff9d]/50 focus:shadow-[0_0_15px_rgba(0,255,157,0.1)]
                           transition-all"
                placeholder="175"
              />
              {errors.height && <p className="text-red-400 text-xs mt-1">⚠ {errors.height}</p>}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/[0.07] flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 text-sm font-medium text-gray-400 border border-white/10 
                       rounded-xl hover:bg-white/5 hover:text-white transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-3 text-sm font-bold bg-[#00ff9d] text-[#060b14] 
                       rounded-xl hover:bg-[#00ff9d]/90 hover:shadow-[0_0_25px_rgba(0,255,157,0.4)]
                       transition-all active:scale-95"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
