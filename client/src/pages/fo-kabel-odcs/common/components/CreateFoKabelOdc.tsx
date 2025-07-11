// client/src/pages/fo-kabel-odcs/common/components/CreateFoKabelOdc.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Element } from '$app/components/cards';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { InputField, SelectField } from '$app/components/forms';
import { TubeColorPicker } from './TubeColorPicker';

interface FoKabelOdcCreate {
    nama_kabel: string;
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
    const { form, setForm, errors } = props;

    const change = <K extends keyof FoKabelOdcCreate>(
        field: K,
        value: FoKabelOdcCreate[K]
    ) => {
        setForm((f) => ({ ...f, [field]: value }));
    };

    return (
<<<<<<< Updated upstream
        <Card title={t('new_kabel_odc')}>
            <Element leftSide={t('nama_odc')} required>
                <SelectField
                    required
                    value={form.odc_id || ''}
                    onValueChange={(v) => change('odc_id', parseInt(v))}
                    errorMessage={errors?.errors.odc_id}
                >
                    <option value="">{t('select_odc')}</option>
                    {odcs.map((o) => (
                        <option key={o.id} value={o.id}>
                            {o.nama_odc}
                        </option>
                    ))}
                </SelectField>
            </Element>

            <Element leftSide={t('nama_kabel')} required>
=======
        <Card title={t('New Kabel ODC')}>
            <Element leftSide={t('Nama Kabel')} required>
>>>>>>> Stashed changes
                <InputField
                    required
                    value={form.nama_kabel}
                    onValueChange={(v) => change('nama_kabel', v)}
                    errorMessage={errors?.errors.nama_kabel}
                />
            </Element>

<<<<<<< Updated upstream
            <Element leftSide={t('tipe_kabel')} required>
=======
            <Element leftSide={t('Tipe Kabel')} required>
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
            <Element leftSide={t('panjang_kabel')} required>
=======
            <Element leftSide={t('Panjang Kabel (m)')} required>
>>>>>>> Stashed changes
                <InputField
                    type="number"
                    required
                    value={form.panjang_kabel != null ? form.panjang_kabel.toString() : ''}
                    onValueChange={(v) =>
                        change('panjang_kabel', v ? parseFloat(v) : 0)
                    }
                    errorMessage={errors?.errors.panjang_kabel}
                />
            </Element>

<<<<<<< Updated upstream
            <Element leftSide={t('jumlah_tube')} required>
                <SelectField
                    required
                    customSelector
                    menuPlacement='bottom'
                    value={form.jumlah_tube.toString()}
                    onValueChange={(v) => change('jumlah_tube', parseInt(v))}
                    errorMessage={errors?.errors.jumlah_tube}
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

            <Element leftSide={t('jumlah_core_in_tube')} required>
=======
            <Element leftSide={t('Select Tubes')} required>
                <TubeColorPicker
                    value={form.tube_colors}
                    onChange={(colors) => change('tube_colors', colors)}
                />
                {errors?.errors.tube_colors && (
                    <div className="text-red-600 text-xs mt-1">{errors.errors.tube_colors}</div>
                )}
            </Element>

            <Element leftSide={t('Jumlah Maximum Core per Tube')} required>
>>>>>>> Stashed changes
                <SelectField
                    required
                    customSelector
                    menuPlacement='bottom'
                    value={form.jumlah_core_in_tube != null ? form.jumlah_core_in_tube.toString() : ''}
                    onValueChange={(v) => change('jumlah_core_in_tube', v ? parseInt(v) : 1)}
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
