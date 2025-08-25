// client/src/pages/fo-kabel-odcs/common/components/CreateFoKabelOdc.tsx
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Element } from '$app/components/cards';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import {
    InputField,
    Checkbox,
} from '$app/components/forms';
import Select from 'react-select';
import { TubeColorPicker } from './TubeColorPicker';
import { CoreColorPicker } from '../../../fo-kabel-tube-odcs/common/components/CoreColorPicker';
import { TreeCoreManager } from './TreeCoreManager';

interface FoKabelOdcCreate {
    nama_kabel: string;
    deskripsi: string;
    tipe_kabel: 'singlecore' | 'multicore';
    panjang_kabel: number;
    tube_colors: string[]; // now a simple array of color strings
    jumlah_core_in_tube: number;
    core_colors: string[]; // new field for core colors
}

interface OdcOption {
    id: number;
    nama_odc: string;
}

interface Props {
    form: FoKabelOdcCreate;
    setForm: React.Dispatch<React.SetStateAction<FoKabelOdcCreate>>;
    errors?: ValidationBag;
    odcs: OdcOption[];
    mode?: 'create' | 'edit';
    existingTubes?: Array<{
        id: number;
        warna_tube: string;
        deskripsi?: string;
        cores: Array<{
            id: number;
            warna_core: string;
            deskripsi?: string;
            kabel_tube_odc_id: number;
        }>;
    }>;
    onCoreDelete?: (coreId: number) => void;
    onCoreAdd?: (tubeId: number, warnaCore: string) => void;
}

export function CreateFoKabelOdc(props: Props) {
    const [t] = useTranslation();
    const { form, setForm, errors, mode = 'create', existingTubes, onCoreDelete, onCoreAdd } = props;
    const [showBatchTubes, setShowBatchTubes] = useState(true); // Default to true for create mode
    const [showBatchCores, setShowBatchCores] = useState(true); // Default to true for create mode

    // Initialize checkbox state based on mode and existing data
    useEffect(() => {
        if (mode === 'edit') {
            // In edit mode, show the checkbox if there are existing tube colors
            setShowBatchTubes(form.tube_colors.length > 0);
            // In edit mode, show the checkbox if there are existing core colors
            setShowBatchCores(form.core_colors.length > 0);
        }
    }, [mode, form.tube_colors.length, form.core_colors.length]);

    const change = <K extends keyof FoKabelOdcCreate>(
        field: K,
        value: FoKabelOdcCreate[K]
    ) => {
        setForm((f) => ({ ...f, [field]: value }));
    };

    const handleBatchTubesChange = (checked: boolean) => {
        if (!checked && mode === 'edit' && form.tube_colors.length > 0) {
            // Show confirmation dialog in edit mode when there are existing tubes
            const confirmed = window.confirm(
                'Warning: Unchecking "Create Batch Tubes" will remove all existing tube colors. This action cannot be undone. Are you sure you want to continue?'
            );
            if (!confirmed) {
                return; // Don't proceed if user cancels
            }
        }

        setShowBatchTubes(checked);
        if (!checked) {
            // Clear tube colors when unchecking
            change('tube_colors', []);
        }
    };

    const handleBatchCoresChange = (checked: boolean) => {
        if (!checked && mode === 'edit' && form.core_colors.length > 0) {
            // Show confirmation dialog in edit mode when there are existing cores
            const confirmed = window.confirm(
                'Warning: Unchecking "Create Batch Cores" will remove all existing core colors. This action cannot be undone. Are you sure you want to continue?'
            );
            if (!confirmed) {
                return; // Don't proceed if user cancels
            }
        }

        setShowBatchCores(checked);
        if (!checked) {
            // Clear core colors when unchecking
            change('core_colors', []);
        }
    };

    return (
        <Card title={t('New Kabel')}>

            {/* Section: Lokasi (full-width) */}
            <div className="px-5 sm:px-6 py-3">
                <div className="text-sm md:text-base font-semibold text-gray-700">{t('KABEL')}</div>
                <div className="text-xs text-gray-500 mt-1">
                    {t('Fill in the basic information for this Kabel.')}
                </div>
            </div>
            {/* Separator */}
            <div className="px-5 sm:px-6">
                <div className="h-px bg-gray-200" />
            </div>

            <Element leftSide={t('Nama Kabel')} required>
                <InputField
                    required
                    value={form.nama_kabel}
                    onValueChange={(v) => change('nama_kabel', v)}
                    errorMessage={errors?.errors.nama_kabel}
                />
            </Element>

            <Element leftSide={t('Deskripsi')}>
                <InputField
                    element="textarea"
                    value={form.deskripsi || ''}
                    onValueChange={(v) => change('deskripsi', v)}
                    errorMessage={errors?.errors.deskripsi}
                />
            </Element>

            <Element leftSide={t('Tipe Kabel')} required>
                <Select
                    name="tipe_kabel"
                    options={[
                        { value: 'singlecore', label: 'singlecore' },
                        { value: 'multicore', label: 'multicore' }
                    ]}
                    value={[
                        { value: 'singlecore', label: 'singlecore' },
                        { value: 'multicore', label: 'multicore' }
                    ].find(option => option.value === form.tipe_kabel)}
                    onChange={(option) => change('tipe_kabel', option ? option.value as 'singlecore' | 'multicore' : 'multicore')}
                    placeholder={t('Select cable type...')}
                    isClearable
                    className="basic-single"
                    classNamePrefix="select"
                />
                {errors?.errors.tipe_kabel && (
                    <p className="text-red-500 text-xs mt-1">{errors.errors.tipe_kabel}</p>
                )}
            </Element>


            <Element leftSide={t('Jumlah Maximum Core per Tube')} required>
                <Select
                    name="jumlah_core_in_tube"
                    options={[
                        { value: '2', label: '2' },
                        { value: '4', label: '4' },
                        { value: '6', label: '6' },
                        { value: '8', label: '8' },
                        { value: '12', label: '12' },
                        { value: '24', label: '24' },
                        { value: '48', label: '48' },
                        { value: '72', label: '72' },
                        { value: '96', label: '96' },
                        { value: '144', label: '144' }
                    ]}
                    value={[
                        { value: '2', label: '2' },
                        { value: '4', label: '4' },
                        { value: '6', label: '6' },
                        { value: '8', label: '8' },
                        { value: '12', label: '12' },
                        { value: '24', label: '24' },
                        { value: '48', label: '48' },
                        { value: '72', label: '72' },
                        { value: '96', label: '96' },
                        { value: '144', label: '144' }
                    ].find(option => option.value === (form.jumlah_core_in_tube != null ? form.jumlah_core_in_tube.toString() : ''))}
                    onChange={(option) => change('jumlah_core_in_tube', option ? parseInt(option.value) : 1)}
                    placeholder={t('Select maximum cores per tube...')}
                    isClearable
                    className="basic-single"
                    classNamePrefix="select"
                />
                {errors?.errors.jumlah_core_in_tube && (
                    <p className="text-red-500 text-xs mt-1">{errors.errors.jumlah_core_in_tube}</p>
                )}
            </Element>

            <Element leftSide={t('Panjang Kabel (m)')} required>
                <InputField
                    type="number"
                    required
                    value={
                        form.panjang_kabel != null
                            ? form.panjang_kabel.toString()
                            : ''
                    }
                    onValueChange={(v) =>
                        change('panjang_kabel', v ? parseFloat(v) : 0)
                    }
                    errorMessage={errors?.errors.panjang_kabel}
                />
            </Element>

            {/* Section: Connection (full-width) */}
            <div className="px-5 sm:px-6 py-3">
                <div className="text-sm md:text-base font-semibold text-gray-700">{t('Tube Batch Creation')}</div>
                <div className="text-xs text-gray-500 mt-1">
                    {t('Automatically create multiple tubes for this cable at once')}
                </div>
            </div>
            {/* Separator */}
            <div className="px-5 sm:px-6">
                <div className="h-px bg-gray-200" />
            </div>

            <Element leftSide={t('Create Batch Tubes')}>
                <Checkbox
                    checked={showBatchTubes}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleBatchTubesChange(e.target.checked)}
                />
            </Element>

            {showBatchTubes && (
                <Element leftSide={t('Select Tube Colors')} required>
                <TubeColorPicker
                    value={form.tube_colors}
                    onChange={(colors) => change('tube_colors', colors)}
                />
                {errors?.errors.tube_colors && (
                    <div className="mt-1 text-xs text-red-600">
                        {errors.errors.tube_colors}
                    </div>
                )}
            </Element>
            )}

            {/* Section: Core Batch Creation (full-width) */}
            <div className="px-5 sm:px-6 py-3">
                <div className="text-sm md:text-base font-semibold text-gray-700">{t('Core Batch Creation')}</div>
                <div className="text-xs text-gray-500 mt-1">
                    {t('Automatically create multiple cores for each tube at once')}
                </div>
            </div>
            {/* Separator */}
            <div className="px-5 sm:px-6">
                <div className="h-px bg-gray-200" />
            </div>

            <Element leftSide={t('Create Batch Cores')}>
                <Checkbox
                    checked={showBatchCores}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleBatchCoresChange(e.target.checked)}
                />
            </Element>

            {showBatchCores && (
                <Element leftSide={t('Select Core Colors')}>
                    <CoreColorPicker
                        value={form.core_colors}
                        onChange={(colors: string[]) => change('core_colors', colors)}
                        maxCores={form.jumlah_core_in_tube}
                    />
                    {errors?.errors.core_colors && (
                        <div className="mt-1 text-xs text-red-600">
                            {errors.errors.core_colors}
                        </div>
                    )}
                    {form.jumlah_core_in_tube && (
                        <div className="mt-1 text-xs text-gray-600">
                            Maximum cores per tube: {form.jumlah_core_in_tube}
                        </div>
                    )}
                    {mode === 'edit' && existingTubes && existingTubes.length > 0 && (
                        <div className="mt-1 text-xs text-amber-600">
                            ⚠️ Batch creation will affect all cores in each tube. Use &quot;Existing Cores Management&quot; below for individual core control.
                        </div>
                    )}
                </Element>
            )}

            {/* Existing Cores Management (Edit Mode Only) */}
            {mode === 'edit' && existingTubes && existingTubes.length > 0 && (
                <>
                    {/* Section Header */}
                    <div className="px-5 sm:px-6 py-3">
                        <div className="text-sm md:text-base font-semibold text-gray-700">{t('Existing Cores Management')}</div>
                        <div className="text-xs text-gray-500 mt-1">
                            {t('Manage existing cores for each tube individually')}
                        </div>
                    </div>
                    {/* Separator */}
                    <div className="px-5 sm:px-6">
                        <div className="h-px bg-gray-200" />
                    </div>

                    <Element leftSide={t('Core Management')}>
                        <TreeCoreManager
                            tubes={existingTubes}
                            onCoreDelete={onCoreDelete || (() => {})}
                            onCoreAdd={onCoreAdd || (() => {})}
                            maxCoresPerTube={form.jumlah_core_in_tube}
                            availableCoreColors={['biru', 'jingga', 'hijau', 'coklat', 'abu_abu', 'putih', 'merah', 'hitam', 'kuning', 'ungu', 'merah_muda', 'aqua']}
                        />
                    </Element>
                </>
            )}

            {/* Preview Section */}
            {showBatchTubes && showBatchCores && form.tube_colors.length > 0 && form.core_colors.length > 0 && (
                <>
                    {/* Section Header */}
                    <div className="px-5 sm:px-6 py-3">
                        <div className="text-sm md:text-base font-semibold text-gray-700">{t('Preview of What Will Be Created')}</div>
                        <div className="text-xs text-gray-500 mt-1">
                            {t('This shows exactly what tubes and cores will be created')}
                        </div>
                    </div>
                    {/* Separator */}
                    <div className="px-5 sm:px-6">
                        <div className="h-px bg-gray-200" />
                    </div>

                    <Element leftSide={t('Creation Preview')}>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <div className="text-sm font-medium text-gray-700 mb-3">
                                📁 Tubes and Cores Preview:
                            </div>

                            <div className="space-y-2">
                                {form.tube_colors.map((tubeColor, tubeIndex) => (
                                    <div key={tubeIndex} className="ml-4">
                                        <div className="flex items-center text-sm font-medium text-gray-600">
                                            <span className="mr-2">├──</span>
                                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                                                Tube {tubeColor}
                                            </span>
                                        </div>

                                        <div className="ml-6 space-y-1">
                                            {form.core_colors.map((coreColor, coreIndex) => {
                                                const globalCoreIndex = tubeIndex * form.core_colors.length + coreIndex + 1;
                                                return (
                                                    <div key={coreIndex} className="flex items-center text-sm text-gray-500">
                                                        <span className="mr-2">│   ├──</span>
                                                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">
                                                            Core {globalCoreIndex}: {coreColor}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 pt-3 border-t border-gray-200">
                                <div className="text-sm font-medium text-gray-700">
                                    Total: <span className="text-blue-600 font-bold">{form.tube_colors.length * form.core_colors.length}</span> cores across <span className="text-blue-600 font-bold">{form.tube_colors.length}</span> tubes
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    Each tube will have {form.core_colors.length} core{form.core_colors.length > 1 ? 's' : ''} with the selected colors
                                </div>
                                {mode === 'edit' && existingTubes && existingTubes.length > 0 && (
                                    <div className="mt-2 text-xs text-gray-600">
                                        Note: This preview shows what would be created with batch creation.
                                        Use the &quot;Existing Cores Management&quot; section above to manage individual cores.
                                    </div>
                                )}
                            </div>
                        </div>
            </Element>
                </>
            )}

        </Card>
    );
}
