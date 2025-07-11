import React from 'react';

const TUBE_COLORS = [
  { value: 'biru', label: 'Biru', color: '#2196f3' },
  { value: 'jingga', label: 'Jingga', color: '#ff9800' },
  { value: 'hijau', label: 'Hijau', color: '#4caf50' },
  { value: 'coklat', label: 'Coklat', color: '#795548' },
  { value: 'abu_abu', label: 'Abu-abu', color: '#9e9e9e' },
  { value: 'putih', label: 'Putih', color: '#fff' },
  { value: 'merah', label: 'Merah', color: '#f44336' },
  { value: 'hitam', label: 'Hitam', color: '#000' },
  { value: 'kuning', label: 'Kuning', color: '#ffeb3b' },
  { value: 'ungu', label: 'Ungu', color: '#9c27b0' },
  { value: 'merah_muda', label: 'Merah Muda', color: '#e91e63' },
  { value: 'aqua', label: 'Aqua', color: '#00bcd4' },
];

// Helper: get readable text color (black/white) for a given background
function getContrastText(bg: string) {
  let color = bg.replace('#', '');
  if (color.length === 3) color = color.split('').map(x => x + x).join('');
  if (color.length !== 6) return '#222';
  const r = parseInt(color.substr(0, 2), 16);
  const g = parseInt(color.substr(2, 2), 16);
  const b = parseInt(color.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 170 ? '#222' : '#fff';
}

// Remove TubeColorState and all count/ids logic

interface TubeColorPickerProps {
  value: string[]; // selected color strings
  onChange: (colors: string[]) => void;
  disabledColors?: string[];
}

export function TubeColorPicker({ value, onChange, disabledColors = [] }: TubeColorPickerProps) {
  // Helper: is color selected
  const isSelected = (color: string) => value.includes(color);

  // Add color
  const addColor = (color: string) => {
    if (!isSelected(color)) {
      onChange([...value, color]);
    }
  };

  // Remove color
  const removeColor = (color: string) => {
    onChange(value.filter((c) => c !== color));
  };

  return (
    <div className="flex flex-wrap gap-2">
      {TUBE_COLORS.map((c) => {
        const selected = isSelected(c.value);
        const isDisabled = disabledColors.includes(c.value);
        const textColor = getContrastText(c.color);
        return (
          <button
            key={c.value}
            type="button"
            className={`px-3 py-1 rounded-full border text-xs font-semibold focus:outline-none transition-colors flex items-center ${selected ? 'shadow-lg' : ''}`}
            style={{
              color: textColor,
              backgroundColor: c.color,
              borderColor: c.color,
              boxShadow: selected ? `0 0 0 3px ${c.color}80, 0 0 8px 2px ${c.color}` : undefined,
              cursor: isDisabled ? 'not-allowed' : 'pointer',
              opacity: isDisabled ? 0.5 : 1,
            }}
            disabled={isDisabled}
            onClick={() => (selected ? removeColor(c.value) : addColor(c.value))}
          >
            <span style={{ color: textColor }}>{c.label}</span>
            {selected && (
              <span className="ml-2 text-lg font-bold">×</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
