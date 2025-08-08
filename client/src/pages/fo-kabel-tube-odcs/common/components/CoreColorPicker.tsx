import React, { useState, useEffect } from 'react';

const CORE_COLORS = [
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

// Helper: create numbered color variant
function createNumberedColor(baseColor: typeof CORE_COLORS[0], number: number) {
  return {
    value: baseColor.value, // Keep the same value for backend compatibility
    label: `(${number}) ${baseColor.label}`,
    color: baseColor.color,
    number: number
  };
}

interface CoreColorPickerProps {
  value: string[]; // selected color strings (will contain duplicates for numbered variants)
  onChange: (colors: string[]) => void;
  disabledColors?: string[];
  maxCores?: number;
}

export function CoreColorPicker({ value, onChange, disabledColors = [], maxCores }: CoreColorPickerProps) {
  const [showNumberedColorPicker, setShowNumberedColorPicker] = useState(false);
  const [numberedColors, setNumberedColors] = useState<{ color: string; number: number }[]>([]);

  // Initialize numbered colors from selected values
  useEffect(() => {
    const colorCounts: { [key: string]: number } = {};
    const numbered: { color: string; number: number }[] = [];

    value.forEach(color => {
      if (colorCounts[color]) {
        colorCounts[color]++;
        numbered.push({ color, number: colorCounts[color] });
      } else {
        colorCounts[color] = 1;
      }
    });

    setNumberedColors(numbered);
  }, [value]);

  // Helper: is color selected
  const isSelected = (color: string) => value.includes(color);

  // Helper: get count of a specific color
  const getColorCount = (color: string) => {
    return value.filter(c => c === color).length;
  };

  // Add color
  const addColor = (color: string) => {
    if (!maxCores || value.length < maxCores) {
      onChange([...value, color]);
    }
  };

  // Remove color
  const removeColor = (color: string) => {
    const newValue = [...value];
    const index = newValue.lastIndexOf(color);
    if (index > -1) {
      newValue.splice(index, 1);
      onChange(newValue);
    }
  };

  // Add numbered color
  const addNumberedColor = (baseColor: typeof CORE_COLORS[0]) => {
    addColor(baseColor.value);
  };

  // Remove numbered color
  const removeNumberedColor = () => {
    if (numberedColors.length > 0) {
      const lastNumbered = numberedColors[numberedColors.length - 1];
      removeColor(lastNumbered.color);
    }
  };

  // Get all available colors (default + numbered variants)
  const getAllColors = () => {
    const colors = [...CORE_COLORS];

    // Add numbered variants for colors that have multiple instances
    numberedColors.forEach(({ color, number }) => {
      const baseColor = CORE_COLORS.find(c => c.value === color);
      if (baseColor) {
        colors.push(createNumberedColor(baseColor, number));
      }
    });

    return colors;
  };

  const allColors = getAllColors();

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {allColors.map((c, index) => {
          const selected = isSelected(c.value);
          const isDisabled = disabledColors.includes(c.value) || (maxCores && value.length >= maxCores && !selected);
          const isNumbered = 'number' in c;
          const textColor = getContrastText(c.color);
          return (
            <button
              key={`${c.value}-${index}`}
              type="button"
              className={`px-3 py-1 rounded-full border text-xs font-semibold focus:outline-none transition-colors flex items-center ${selected ? 'shadow-lg' : ''} ${isNumbered ? 'border-dashed' : ''}`}
              style={{
                color: textColor,
                backgroundColor: c.color,
                borderColor: c.color,
                boxShadow: selected ? `0 0 0 3px ${c.color}80, 0 0 8px 2px ${c.color}` : undefined,
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                opacity: isDisabled ? 0.5 : 1,
              }}
              disabled={!!isDisabled}
              onClick={() => (selected ? removeColor(c.value) : addColor(c.value))}
            >
              <span style={{ color: textColor }}>{c.label}</span>
              {selected && (
                <span className="ml-2 text-lg font-bold">×</span>
              )}
            </button>
          );
        })}

        {/* Add numbered color button */}
        {(!maxCores || value.length < maxCores) && (
          <button
            type="button"
            className="px-3 py-1 rounded-full border-2 border-dashed border-gray-400 text-gray-600 hover:border-gray-600 hover:text-gray-800 focus:outline-none transition-colors flex items-center"
            onClick={() => setShowNumberedColorPicker(!showNumberedColorPicker)}
          >
            <span className="text-lg font-bold">+</span>
          </button>
        )}

        {/* Remove numbered color button */}
        {numberedColors.length > 0 && (
          <button
            type="button"
            className="px-3 py-1 rounded-full border-2 border-dashed border-red-400 text-red-600 hover:border-red-600 hover:text-red-800 focus:outline-none transition-colors flex items-center"
            onClick={removeNumberedColor}
          >
            <span className="text-lg font-bold">-</span>
          </button>
        )}
      </div>

      {/* Numbered color picker dropdown */}
      {showNumberedColorPicker && (
        <div className="mt-2 p-3 border border-gray-300 rounded-lg bg-white shadow-lg">
          <div className="text-sm font-medium text-gray-700 mb-2">Select color to add another instance:</div>
          <div className="flex flex-wrap gap-2">
            {CORE_COLORS.map((c) => {
              const currentCount = getColorCount(c.value);
              const textColor = getContrastText(c.color);
              return (
                <button
                  key={c.value}
                  type="button"
                  className="px-3 py-1 rounded-full border text-xs font-semibold focus:outline-none transition-colors flex items-center hover:shadow-md"
                  style={{
                    color: textColor,
                    backgroundColor: c.color,
                    borderColor: c.color,
                    cursor: 'pointer',
                  }}
                  onClick={() => addNumberedColor(c)}
                >
                  <span style={{ color: textColor }}>
                    {c.label} {currentCount > 0 && `(${currentCount + 1})`}
                  </span>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            className="mt-2 text-sm text-gray-500 hover:text-gray-700"
            onClick={() => setShowNumberedColorPicker(false)}
          >
            Cancel
          </button>
        </div>
      )}

      {maxCores && (
        <div className="mt-2 text-sm text-gray-600">
          Selected: {value.length}/{maxCores} cores
          {value.length >= maxCores && (
            <span className="ml-2 text-orange-600 font-medium">
              Maximum cores reached for this tube
            </span>
          )}
        </div>
      )}
    </div>
  );
}
