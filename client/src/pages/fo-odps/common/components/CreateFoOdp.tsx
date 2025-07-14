// client/src/pages/fo-odps/common/components/CreateFoOdp.tsx

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Element } from '$app/components/cards';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { InputField, SelectField, Checkbox } from '$app/components/forms';

export interface FoOdpFormValues {
    create_new_lokasi: boolean;
    lokasi_id: string;
    lokasi_name: string;
    lokasi_deskripsi: string;
    lokasi_latitude: string;
    lokasi_longitude: string;
    kabel_odc_id: string;
    kabel_tube_odc_id: string;
    kabel_core_odc_id: string;
    nama_odp: string;
}

interface LokasiOption {
    id: number;
    nama_lokasi: string;
}

interface CoreOption {
    id: number;
    warna_core: string;
    kabel_odc_id: number;
    nama_kabel: string;
    kabel_tube_odc_id: number;
    warna_tube: string;
}

interface Props {
    values: FoOdpFormValues;
    setValues: React.Dispatch<React.SetStateAction<FoOdpFormValues>>;
    lokasis: LokasiOption[];
    kabelOdcs: { id: number; nama_kabel: string; kabel_tube_odcs: any[] }[];
    kabelTubes: { id: number; warna_tube: string; kabel_odc_id: number }[]; // New prop
    cores: CoreOption[];
    errors?: ValidationBag;
}

export function CreateFoOdp({
    values,
    setValues,
    lokasis,
    kabelOdcs,
    kabelTubes,
    cores,
    errors,
}: Props) {
    const [t] = useTranslation();
    const onChange = <K extends keyof FoOdpFormValues>(
        field: K,
        value: FoOdpFormValues[K]
    ) => setValues((v) => ({ ...v, [field]: value }));

    // derive kabel options from all kabelOdcs
    const kabelOptions = kabelOdcs.map((k) => ({ id: k.id, nama_kabel: k.nama_kabel }));

    // derive tube options from all kabelTubes for selected kabel_odc_id
    const tubeOptions = kabelTubes.filter((t) => String(t.kabel_odc_id) === values.kabel_odc_id);

    // derive core options based on selected kabel and tube
    const coreOptions = cores.filter(
        (c) =>
            String(c.kabel_odc_id) === values.kabel_odc_id &&
            String(c.kabel_tube_odc_id) === values.kabel_tube_odc_id
    );

    return (
        <Card
            title={t(
                values.create_new_lokasi ? 'New Lokasi and ODP' : 'New ODP'
            )}
        >
            <Element leftSide={t('Create New Lokasi')}>
                <Checkbox
                    checked={values.create_new_lokasi}
                    onChange={(e: { target: { checked: boolean } }) =>
                        onChange('create_new_lokasi', e.target.checked)
                    }
                />
            </Element>

            {values.create_new_lokasi ? (
                <>
                    <Element leftSide={t('Nama Lokasi')} required>
                        <InputField
                            required
                            value={values.lokasi_name}
                            onValueChange={(v) => onChange('lokasi_name', v)}
                            errorMessage={errors?.errors.nama_lokasi}
                        />
                    </Element>
                    <Element leftSide={t('Deskripsi')}>
                        <InputField
                            element="textarea"
                            value={values.lokasi_deskripsi}
                            onValueChange={(v) =>
                                onChange('lokasi_deskripsi', v)
                            }
                            errorMessage={errors?.errors.deskripsi}
                        />
                    </Element>
                    <Element leftSide={t('Latitude')} required>
                        <InputField
                            required
                            type="number"
                            value={values.lokasi_latitude}
                            onValueChange={(v) =>
                                onChange('lokasi_latitude', v)
                            }
                            errorMessage={errors?.errors.latitude}
                        />
                    </Element>
                    <Element leftSide={t('Longitude')} required>
                        <InputField
                            required
                            type="number"
                            value={values.lokasi_longitude}
                            onValueChange={(v) =>
                                onChange('lokasi_longitude', v)
                            }
                            errorMessage={errors?.errors.longitude}
                        />
                    </Element>
                </>
            ) : (
                <Element leftSide={t('Lokasi')} required>
                    <SelectField
                        required
                        value={values.lokasi_id}
                        onValueChange={(v) => onChange('lokasi_id', v)}
                        errorMessage={errors?.errors.lokasi_id}
                    >
                        <option value="">{t('select lokasi')}</option>
                        {lokasis.map((l) => (
                            <option key={l.id} value={l.id.toString()}>
                                {l.nama_lokasi}
                            </option>
                        ))}
                    </SelectField>
                </Element>
            )}

            <Element leftSide={t('Kabel ODC')} required>
                <SelectField
                    required
                    value={values.kabel_odc_id}
                    onValueChange={(v) => {
                        onChange('kabel_odc_id', v);
                        // reset dependent
                        onChange('kabel_tube_odc_id', '');
                        onChange('kabel_core_odc_id', '');
                    }}
                    errorMessage={errors?.errors.kabel_odc_id}
                >
                    <option value="">{t('select kabel odc')}</option>
                    {kabelOptions.map((k) => (
                        <option key={k.id} value={k.id.toString()}>
                            {k.nama_kabel}
                        </option>
                    ))}
                </SelectField>
            </Element>

            <Element leftSide={t('Kabel Tube ODC')} required>
                <SelectField
                    required
                    value={values.kabel_tube_odc_id}
                    onValueChange={(v) => {
                        onChange('kabel_tube_odc_id', v);
                        onChange('kabel_core_odc_id', '');
                    }}
                    errorMessage={errors?.errors.kabel_tube_odc_id}
                >
                    <option value="">{t('select tube odc')}</option>
                    {tubeOptions.map((t) => (
                        <option key={t.id} value={t.id.toString()}>
                            {t.warna_tube}
                        </option>
                    ))}
                </SelectField>
            </Element>

            <Element leftSide={t('Kabel Core ODC')}>
                <SelectField
                    required
                    value={values.kabel_core_odc_id}
                    onValueChange={(v) => onChange('kabel_core_odc_id', v)}
                    errorMessage={errors?.errors.kabel_core_odc_id}
                >
                    <option value="">{t('unassigned core') || '—'}</option>
                    {coreOptions.map((c) => (
                        <option key={c.id} value={c.id.toString()}>
                            {c.warna_core}
                        </option>
                    ))}
                </SelectField>
            </Element>

            <Element leftSide={t('Nama ODP')} required>
                <InputField
                    required
                    value={values.nama_odp}
                    onValueChange={(v) => onChange('nama_odp', v)}
                    errorMessage={errors?.errors.nama_odp}
                />
            </Element>
        </Card>
    );
}
