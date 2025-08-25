// client/src/pages/fo-kabel-tube-odcs/common/components/CreateFoKabelTubeOdc.tsx
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Element } from '$app/components/cards';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import {
    InputField,
    Checkbox,
} from '$app/components/forms';
import Select from 'react-select';
import { CoreColorPicker } from './CoreColorPicker';
import { SingleTubeColorPicker } from './SingleTubeColorPicker';

interface FoKabelTubeOdcCreate {
    kabel_odc_id: number;
    deskripsi: string;
    warna_tube: string;
    core_colors: string[]; // new field for core colors
}

interface KabelOdcOption {
    id: number;
    nama_kabel: string;
    jumlah_core_in_tube?: number;
}

interface Props {
    form: FoKabelTubeOdcCreate;
    setForm: React.Dispatch<React.SetStateAction<FoKabelTubeOdcCreate>>;
    errors?: ValidationBag;
    odcs: KabelOdcOption[];
    mode?: 'create' | 'edit';
    odcsLoading?: boolean;
}

//

export function CreateFoKabelTubeOdc({ form, setForm, errors, odcs, mode = 'create', odcsLoading = false }: Props) {
    const [t] = useTranslation();
    const [selectedKabelOdc, setSelectedKabelOdc] = useState<KabelOdcOption | null>(null);
    const [showBatchCores, setShowBatchCores] = useState(true); // Default to true for create mode

    // Initialize checkbox state for edit mode: default to checked so users see the batch UI
    useEffect(() => {
        if (mode === 'edit') {
            setShowBatchCores(true);
        }
    }, [mode]);

    const change = <K extends keyof FoKabelTubeOdcCreate>(
        field: K,
        value: FoKabelTubeOdcCreate[K]
    ) => {
        setForm((f) => ({ ...f, [field]: value }));
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

    // Update selected Kabel ODC when kabel_odc_id changes
    useEffect(() => {
        if (form.kabel_odc_id) {
            const selected = odcs.find(o => o.id === form.kabel_odc_id);
            setSelectedKabelOdc(selected || null);
        } else {
            setSelectedKabelOdc(null);
        }
    }, [form.kabel_odc_id, odcs]);

    return (
        <Card title={t('New Tube Kabel')}>

            {/* Section: Lokasi (full-width) */}
            <div className="px-5 sm:px-6 py-3">
                <div className="text-sm md:text-base font-semibold text-gray-700">{t('TUBE')}</div>
                <div className="text-xs text-gray-500 mt-1">
                    {t('Fill in the basic information for this Tube.')}
                </div>
            </div>
            {/* Separator */}
            <div className="px-5 sm:px-6">
                <div className="h-px bg-gray-200" />
            </div>

            <Element leftSide={t('Select Kabel')} required>
                <Select
                    name="kabel_odc_id"
                    options={odcs.map((o) => ({
                        value: o.id.toString(),
                        label: o.nama_kabel,
                    }))}
                    value={odcs.map((o) => ({
                        value: o.id.toString(),
                        label: o.nama_kabel,
                    })).find((option) => option.value === form.kabel_odc_id?.toString())}
                    onChange={(option) => change('kabel_odc_id', option ? parseInt(option.value) : 0)}
                    placeholder={odcsLoading ? t('Loading cables...') : t('Search and select cable ODC...')}
                    isClearable
                    className="basic-single"
                    classNamePrefix="select"
                    isLoading={odcsLoading}
                />
                {errors?.errors.kabel_odc_id && (
                    <p className="text-red-500 text-xs mt-1">{errors.errors.kabel_odc_id}</p>
                )}
            </Element>

            <Element leftSide={t('Select Warna Tube')} required>
                <SingleTubeColorPicker
                    value={form.warna_tube}
                    onChange={(color) => change('warna_tube', color)}
                />
                {errors?.errors.warna_tube && (
                    <p className="text-red-500 text-xs mt-1">{errors.errors.warna_tube}</p>
                )}
            </Element>

            <Element leftSide={t('Deskripsi')}>
                <InputField
                    element="textarea"
                    value={form.deskripsi || ''}
                    onValueChange={(v) => change('deskripsi', v)}
                    errorMessage={errors?.errors.deskripsi}
                />
            </Element>

            {/* Section: Connection (full-width) */}
            <div className="px-5 sm:px-6 py-3">
                <div className="text-sm md:text-base font-semibold text-gray-700">{t('Core Batch Creation')}</div>
                <div className="text-xs text-gray-500 mt-1">
                    {t('Automatically create multiple cores for this tube at once')}
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
                        onChange={(colors) => change('core_colors', colors)}
                        maxCores={selectedKabelOdc?.jumlah_core_in_tube}
                    />
                    {errors?.errors.core_colors && (
                        <div className="mt-1 text-xs text-red-600">
                            {errors.errors.core_colors}
                        </div>
                    )}
                    {selectedKabelOdc?.jumlah_core_in_tube && (
                        <div className="mt-1 text-xs text-gray-600">
                            Maximum cores per tube: {selectedKabelOdc.jumlah_core_in_tube}
                        </div>
                    )}
                </Element>
            )}
        </Card>
    );
}
