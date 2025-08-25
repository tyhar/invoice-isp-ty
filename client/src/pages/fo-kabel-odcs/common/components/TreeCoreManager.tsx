import React, { useState } from 'react';

interface CoreData {
    id: number;
    warna_core: string;
    deskripsi?: string;
    kabel_tube_odc_id: number;
}

interface TubeData {
    id: number;
    warna_tube: string;
    deskripsi?: string;
    cores: CoreData[];
}

interface TreeCoreManagerProps {
    tubes: TubeData[];
    onCoreDelete: (coreId: number) => void;
    onCoreAdd: (tubeId: number, warnaCore: string) => void;
    maxCoresPerTube?: number;
    availableCoreColors: string[];
}

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

export function TreeCoreManager({
    tubes,
    onCoreDelete,
    onCoreAdd,
    maxCoresPerTube,
    availableCoreColors
}: TreeCoreManagerProps) {
    const [showAddCoreForTube, setShowAddCoreForTube] = useState<number | null>(null);

    const canAddCore = (tubeId: number) => {
        if (!maxCoresPerTube) return true;
        const tube = tubes.find(t => t.id === tubeId);
        return tube && tube.cores.length < maxCoresPerTube;
    };

    const handleAddCore = (tubeId: number, warnaCore: string) => {
        onCoreAdd(tubeId, warnaCore);
        setShowAddCoreForTube(null);
    };

    return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-700 mb-3">
                📁 Existing Tubes and Cores:
            </div>

            <div className="space-y-3">
                {tubes.map((tube) => (
                    <div key={tube.id} className="ml-4">
                        {/* Tube Header */}
                        <div className="flex items-center justify-between text-sm font-medium text-gray-600">
                            <div className="flex items-center">
                                <span className="mr-2">├──</span>
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                                    Tube {tube.warna_tube}
                                </span>
                                {tube.deskripsi && (
                                    <span className="ml-2 text-xs text-gray-500">
                                        ({tube.deskripsi})
                                    </span>
                                )}
                            </div>

                            {/* Add Core Button */}
                            {canAddCore(tube.id) && (
                                <button
                                    type="button"
                                    onClick={() => setShowAddCoreForTube(showAddCoreForTube === tube.id ? null : tube.id)}
                                    className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                                >
                                    + Add Core
                                </button>
                            )}
                        </div>

                        {/* Cores List */}
                        <div className="ml-6 space-y-2">
                            {tube.cores.length === 0 ? (
                                <div className="text-xs text-gray-400 italic">
                                    No cores assigned to this tube
                                </div>
                            ) : (
                                tube.cores.map((core, coreIndex) => (
                                    <div key={core.id} className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <span className="mr-2">│   ├──</span>
                                            <span
                                                className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold"
                                                style={{
                                                    backgroundColor: CORE_COLORS.find(c => c.value === core.warna_core)?.color + '20',
                                                    color: CORE_COLORS.find(c => c.value === core.warna_core)?.color,
                                                    border: `1px solid ${CORE_COLORS.find(c => c.value === core.warna_core)?.color}40`
                                                }}
                                            >
                                                Core {coreIndex + 1}: {core.warna_core}
                                            </span>
                                            {core.deskripsi && (
                                                <span className="ml-2 text-xs text-gray-500">
                                                    ({core.deskripsi})
                                                </span>
                                            )}
                                        </div>

                                        {/* Delete Core Button */}
                                        <button
                                            type="button"
                                            onClick={() => onCoreDelete(core.id)}
                                            className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                                        >
                                            🗑️ Delete
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Add Core Dropdown */}
                        {showAddCoreForTube === tube.id && (
                            <div className="ml-6 mt-2 p-3 border border-gray-300 rounded-lg bg-white shadow-lg">
                                <div className="text-xs font-medium text-gray-700 mb-2">
                                    Select core color to add:
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {availableCoreColors.map((color) => {
                                        const colorData = CORE_COLORS.find(c => c.value === color);
                                        if (!colorData) return null;

                                        const textColor = getContrastText(colorData.color);
                                        return (
                                            <button
                                                key={color}
                                                type="button"
                                                className="px-2 py-1 rounded text-xs font-semibold focus:outline-none transition-colors hover:shadow-md"
                                                style={{
                                                    color: textColor,
                                                    backgroundColor: colorData.color,
                                                    borderColor: colorData.color,
                                                }}
                                                onClick={() => handleAddCore(tube.id, color)}
                                            >
                                                {colorData.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Core Count Info */}
                        <div className="ml-6 mt-1 text-xs text-gray-500">
                            {tube.cores.length} core{tube.cores.length !== 1 ? 's' : ''}
                            {maxCoresPerTube && ` / ${maxCoresPerTube} max`}
                        </div>
                    </div>
                ))}
            </div>

            {/* Summary */}
            <div className="mt-4 pt-3 border-t border-gray-200">
                <div className="text-sm font-medium text-gray-700">
                    Total: <span className="text-blue-600 font-bold">
                        {tubes.reduce((sum, tube) => sum + tube.cores.length, 0)}
                    </span> cores across <span className="text-blue-600 font-bold">
                        {tubes.length}
                    </span> tubes
                </div>
            </div>
        </div>
    );
}
