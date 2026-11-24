import React from 'react';

const ToggleSwitch = ({
  checked = false,
  onChange,
  disabled = false,
  activeColor = 'bg-blue-600',
  labelOn = 'Allowed',
  labelOff = 'Denied',
  showLabel = true,
}) => {
  return (
    <label className={`inline-flex items-center gap-2.5 select-none ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
      <div className="relative inline-block">
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange && onChange(e.target.checked)}
          className="sr-only peer"
        />
        {/* Track */}
        <div
          className={`w-11 h-6 rounded-full transition-colors duration-200 ease-in-out border border-transparent ${
            checked ? activeColor : 'bg-slate-300'
          }`}
        />
        {/* Thumb */}
        <div
          className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full shadow-sm transition-transform duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </div>

      {showLabel && (
        <span
          className={`text-xs font-semibold uppercase tracking-wider transition-colors ${
            checked ? 'text-slate-800' : 'text-slate-400'
          }`}
        >
          {checked ? labelOn : labelOff}
        </span>
      )}
    </label>
  );
};

export default ToggleSwitch;
