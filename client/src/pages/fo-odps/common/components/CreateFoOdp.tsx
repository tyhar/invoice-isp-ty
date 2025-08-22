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
    odc_id: string; // <-- add this
    nama_odp: string;
    deskripsi: string;
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
    deskripsi?: string; // Add deskripsi field for cores
}

interface KabelOdcOption {
    id: number;
    nama_kabel: string;
    kabel_tube_odcs: any[];
    odcs?: { id: number; nama_odc: string }[];
}

interface Props {
    values: FoOdpFormValues;
    setValues: React.Dispatch<React.SetStateAction<FoOdpFormValues>>;
    lokasis: LokasiOption[];
    kabelOdcs: KabelOdcOption[];
    kabelTubes: { id: number; warna_tube: string; kabel_odc_id: number; deskripsi?: string }[]; // Add deskripsi field
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

    // derive ODC options from selected kabel_odc_id
    const odcOptions = React.useMemo(() => {
        if (!values.kabel_odc_id) return [];
        const kabel = kabelOdcs.find((k) => String(k.id) === values.kabel_odc_id);
        return kabel?.odcs || [];
    }, [kabelOdcs, values.kabel_odc_id]);

    return (
        <Card
            title={t(
                values.create_new_lokasi ? 'New Lokasi and ODP' : 'New ODP'
            )}
        >

            {/* Section: Lokasi (full-width) */}
            <div className="px-5 sm:px-6 py-3">
                <div className="text-sm md:text-base font-semibold text-gray-700">{t('LOKASI')}</div>
                <div className="text-xs text-gray-500 mt-1">
                    {t('Create a new lokasi or select an existing Lokasi below.')}
                </div>
            </div>
            {/* Separator */}
            <div className="px-5 sm:px-6">
                <div className="h-px bg-gray-200" />
            </div>

            <Element leftSide={t('Create New Lokasi')} required>
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
                <Element leftSide={t('Select Lokasi')} required>
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

            {/* Section: Lokasi (full-width) */}
            <div className="px-5 sm:px-6 py-3">
                <div className="text-sm md:text-base font-semibold text-gray-700">{t('ODP')}</div>
                <div className="text-xs text-gray-500 mt-1">
                    {t('Fill in the basic information for this ODP.')}
                </div>
            </div>
            {/* Separator */}
            <div className="px-5 sm:px-6">
                <div className="h-px bg-gray-200" />
            </div>

            <Element leftSide={t('Nama ODP')} required>
                <InputField
                    required
                    value={values.nama_odp}
                    onValueChange={(v) => onChange('nama_odp', v)}
                    errorMessage={errors?.errors.nama_odp}
                />
            </Element>

            <Element leftSide={t('Deskripsi')}>
                <InputField
                    element="textarea"
                    value={values.deskripsi || ''}
                    onValueChange={(v) => onChange('deskripsi', v)}
                    errorMessage={errors?.errors.deskripsi}
                />
            </Element>

            {/* Section: Connection (full-width) */}
            <div className="px-5 sm:px-6 py-3">
                <div className="text-sm md:text-base font-semibold text-gray-700">{t('ODP Connection')}</div>
                <div className="text-xs text-gray-500 mt-1">
                    {t('Optionally link this ODP to ODC and specify Kabel/Tube/Core.')}
                </div>
            </div>
            {/* Separator */}
            <div className="px-5 sm:px-6">
                <div className="h-px bg-gray-200" />
            </div>

            <Element leftSide={t('Kabel')}>
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

            <Element leftSide={t('Kabel Tube')}>
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
                            {t.warna_tube} - {t.deskripsi || `Tube ${t.warna_tube}`}
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
                            {c.warna_core} - {c.deskripsi || `Core ${c.warna_core} for tube ${c.warna_tube}`}
                        </option>
                    ))}
                </SelectField>
            </Element>

            <Element leftSide={t('ODC')} required={!!values.kabel_odc_id}>
                <SelectField
                    required={!!values.kabel_odc_id}
                    value={values.odc_id}
                    onValueChange={(v) => onChange('odc_id', v)}
                    errorMessage={errors?.errors.odc_id}
                >
                    <option value="">{t('select odc')}</option>
                    {odcOptions.map((odc: any) => (
                        <option key={odc.id} value={odc.id.toString()}>
                            {odc.nama_odc}
                        </option>
                    ))}
                </SelectField>
            </Element>
        </Card>
    );
}
