// client/src/pages/fo-kabel-odcs/common/components/CreateFoKabelOdc.tsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Element } from '$app/components/cards';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { InputField, SelectField, Checkbox } from '$app/components/forms';
import { TubeColorPicker } from './TubeColorPicker';

interface FoKabelOdcCreate {
    nama_kabel: string;
    deskripsi: string;
    tipe_kabel: 'singlecore' | 'multicore';
    panjang_kabel: number;
    tube_colors: string[]; // now a simple array of color strings
    jumlah_core_in_tube: number;
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
}

export function CreateFoKabelOdc(props: Props) {
    const [t] = useTranslation();
    const { form, setForm, errors, mode = 'create' } = props;
    const [showBatchTubes, setShowBatchTubes] = useState(true); // Default to true for create mode

    // Initialize checkbox state based on mode and existing data
    useEffect(() => {
        if (mode === 'edit') {
            // In edit mode, show the checkbox if there are existing tube colors
            setShowBatchTubes(form.tube_colors.length > 0);
        }
    }, [mode, form.tube_colors.length]);

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

    return (
        <Card title={t('New Kabel ODC')}>
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
                <SelectField
                    required
                    value={form.tipe_kabel}
                    onValueChange={(v) => change('tipe_kabel', v as any)}
                    errorMessage={errors?.errors.tipe_kabel}
                >
                    <option value="singlecore">singlecore</option>
                    <option value="multicore">multicore</option>
                </SelectField>
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

            <Element leftSide={t('Create Batch Tubes')}>
                <Checkbox
                    checked={showBatchTubes}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleBatchTubesChange(e.target.checked)}
                />
            </Element>

            {showBatchTubes && (
                <Element leftSide={t('Tube Colors')} required>
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

            <Element leftSide={t('Jumlah Maximum Core per Tube')} required>
                <SelectField
                    required
                    customSelector
                    menuPlacement="bottom"
                    value={
                        form.jumlah_core_in_tube != null
                            ? form.jumlah_core_in_tube.toString()
                            : ''
                    }
                    onValueChange={(v) =>
                        change('jumlah_core_in_tube', v ? parseInt(v) : 1)
                    }
                    errorMessage={errors?.errors.jumlah_core_in_tube}
                >
                    <option value="2">2</option>
                    <option value="4">4</option>
                    <option value="6">6</option>
                    <option value="8">8</option>
                    <option value="12">12</option>
                    <option value="24">24</option>
                    <option value="48">48</option>
                    <option value="72">72</option>
                    <option value="96">96</option>
                    <option value="144">144</option>
                </SelectField>
            </Element>
        </Card>
    );
}
