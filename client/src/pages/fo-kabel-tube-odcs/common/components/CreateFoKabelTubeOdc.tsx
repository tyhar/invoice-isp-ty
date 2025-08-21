// client/src/pages/fo-kabel-tube-odcs/common/components/CreateFoKabelTubeOdc.tsx
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Element } from '$app/components/cards';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import {
    InputField,
    SelectField,
    Checkbox,
} from '$app/components/forms';
import { CoreColorPicker } from './CoreColorPicker';

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

export function CreateFoKabelTubeOdc({ form, setForm, errors, odcs, mode = 'create' }: Props) {
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
            <Element leftSide={t('Kabel')} required>
                <SelectField
                    required
                    value={form.kabel_odc_id || ''}
                    onValueChange={(v) => change('kabel_odc_id', parseInt(v))}
                    errorMessage={errors?.errors.kabel_odc_id}
                >
                    <option value="">{t('select kabel odc')}</option>
                    {odcs.map((o) => (
                        <option key={o.id} value={o.id}>
                            {o.nama_kabel}
                        </option>
                    ))}
                </SelectField>
            </Element>

            <Element leftSide={t('Deskripsi')}>
                <InputField
                    element="textarea"
                    value={form.deskripsi || ''}
                    onValueChange={(v) => change('deskripsi', v)}
                    errorMessage={errors?.errors.deskripsi}
                />
            </Element>

            <Element leftSide={t('Warna Tube')} required>
                <SelectField
                    required
                    value={form.warna_tube}
                    onValueChange={(v) => change('warna_tube', v)}
                    errorMessage={errors?.errors.warna_tube}
                >
                    <option value="">{t('select warna tube')}</option>
                    {TUBE_COLORS.map((color) => (
                        <option key={color} value={color}>
                            {t(color)}
                        </option>
                    ))}
                </SelectField>
            </Element>

            <Element leftSide={t('Create Batch Cores')}>
                <Checkbox
                    checked={showBatchCores}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleBatchCoresChange(e.target.checked)}
                />
            </Element>

            {showBatchCores && (
                <Element leftSide={t('Core Colors')}>
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
