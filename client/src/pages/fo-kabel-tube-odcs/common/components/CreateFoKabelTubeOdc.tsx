// client/src/pages/fo-kabel-tube-odcs/common/components/CreateFoKabelTubeOdc.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Element } from '$app/components/cards';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import {
    InputField,
    SelectField,
} from '$app/components/forms';

interface FoKabelTubeOdcCreate {
    kabel_odc_id: number;
    deskripsi: string;
    warna_tube: string;
}

interface KabelOdcOption {
    id: number;
    nama_kabel: string;
}

interface Props {
    form: FoKabelTubeOdcCreate;
    setForm: React.Dispatch<React.SetStateAction<FoKabelTubeOdcCreate>>;
    errors?: ValidationBag;
    odcs: KabelOdcOption[];
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

export function CreateFoKabelTubeOdc({ form, setForm, errors, odcs }: Props) {
    const [t] = useTranslation();

    const change = <K extends keyof FoKabelTubeOdcCreate>(
        field: K,
        value: FoKabelTubeOdcCreate[K]
    ) => {
        setForm((f) => ({ ...f, [field]: value }));
    };

    return (
        <Card title={t('New Tube ODC')}>
            <Element leftSide={t('Kabel ODC')} required>
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
        </Card>
    );
}
