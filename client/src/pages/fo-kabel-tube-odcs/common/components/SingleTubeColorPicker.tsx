import React from 'react';
import { useTranslation } from 'react-i18next';

interface SingleTubeColorPickerProps {
    value: string;
    onChange: (color: string) => void;
    disabled?: boolean;
}

const TUBE_COLORS = [
    'biru',
    'jingga',
    'hijau',
    'coklat',
    'abu_abu',
    'putih',
    'merah',
    'hitam',
    'kuning',
    'ungu',
    'merah_muda',
    'aqua',
];

const COLOR_MAP: Record<string, { bg: string; text: string }> = {
    biru: { bg: 'bg-blue-500', text: 'text-white' },
    jingga: { bg: 'bg-orange-500', text: 'text-white' },
    hijau: { bg: 'bg-green-500', text: 'text-white' },
    coklat: { bg: 'bg-amber-700', text: 'text-white' },
    abu_abu: { bg: 'bg-gray-500', text: 'text-white' },
    putih: { bg: 'bg-gray-100', text: 'text-gray-800' },
    merah: { bg: 'bg-red-500', text: 'text-white' },
    hitam: { bg: 'bg-gray-800', text: 'text-white' },
    kuning: { bg: 'bg-yellow-400', text: 'text-gray-800' },
    ungu: { bg: 'bg-purple-500', text: 'text-white' },
    merah_muda: { bg: 'bg-pink-400', text: 'text-white' },
    aqua: { bg: 'bg-cyan-400', text: 'text-gray-800' },
};

function getContrastText(bg: string) {
    const colorMap: Record<string, string> = {
        'bg-blue-500': 'text-white',
        'bg-orange-500': 'text-white',
        'bg-green-500': 'text-white',
        'bg-amber-700': 'text-white',
        'bg-gray-500': 'text-white',
        'bg-gray-100': 'text-gray-800',
        'bg-red-500': 'text-white',
        'bg-gray-800': 'text-white',
        'bg-yellow-400': 'text-gray-800',
        'bg-purple-500': 'text-white',
        'bg-pink-400': 'text-white',
        'bg-cyan-400': 'text-white',
    };
    return colorMap[bg] || 'text-white';
}

function getColorDisplayName(color: string): string {
    const colorNames: Record<string, string> = {
        'biru': 'Biru',
        'jingga': 'Jingga',
        'hijau': 'Hijau',
        'coklat': 'Coklat',
        'abu_abu': 'Abu-abu',
        'putih': 'Putih',
        'merah': 'Merah',
        'hitam': 'Hitam',
        'kuning': 'Kuning',
        'ungu': 'Ungu',
        'merah_muda': 'Merah Muda',
        'aqua': 'Aqua',
    };
    return colorNames[color] || color;
}

export function SingleTubeColorPicker({ value, onChange, disabled = false }: SingleTubeColorPickerProps) {
    const [t] = useTranslation();

    const handleColorClick = (color: string) => {
        if (!disabled) {
            onChange(color);
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
                {TUBE_COLORS.map((color) => {
                    const isSelected = value === color;
                    const colorStyle = COLOR_MAP[color];
                    const textColor = getContrastText(colorStyle.bg);

                    return (
                                                <button
                            key={color}
                            type="button"
                            onClick={() => handleColorClick(color)}
                            disabled={disabled}
                            className={`
                                relative px-3 py-2 rounded-full text-xs font-medium transition-all duration-200
                                ${colorStyle.bg} ${textColor}
                                ${isSelected
                                    ? 'ring-2 ring-blue-500 ring-offset-2 shadow-lg scale-110'
                                    : 'hover:shadow-md hover:scale-105'
                                }
                                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                            `}
                        >
                            {getColorDisplayName(color)}
                            {isSelected && (
                                <div className="absolute -top-1 -right-1 bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                                    ✓
                                </div>
                                )}
                        </button>
                    );
                })}
            </div>
            {value && (
                <div className="text-sm text-gray-600">
                    {t('Selected')}: <span className="font-medium">{getColorDisplayName(value)}</span>
                </div>
            )}
        </div>
    );
}
