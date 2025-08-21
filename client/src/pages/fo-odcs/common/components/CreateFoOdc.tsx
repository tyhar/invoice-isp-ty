// client/src/pages/fo-odcs/common/components/CreateFoOdc.tsx

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '$app/components/cards';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Element } from '$app/components/cards';
import { InputField, SelectField, Checkbox } from '$app/components/forms';

export interface FoOdcFormValues {
    create_new_lokasi: boolean;
    lokasi_id: string;
    lokasi_name: string;
    lokasi_deskripsi: string;
    lokasi_latitude: string;
    lokasi_longitude: string;
    kabel_odc_id: string;
    odc_id: string; // <-- add this for ODC-to-ODC connections
    kabel_core_odc_id: string; // <-- optional core feeding this child ODC
    kabel_tube_odc_id: string; // <-- used only for filtering cores (not saved)
    odc_connection_enabled: boolean; // <-- toggle to show optional connection fields
    nama_odc: string;
    deskripsi: string;
    tipe_splitter: string;
}

interface LokasiOption {
    id: number;
    nama_lokasi: string;
}

interface KabelOdcOption {
    id: number;
    nama_kabel: string;
}

interface OdcOption {
    id: number;
    nama_odc: string;
    lokasi_name?: string;
    kabel_odc_id?: number; // <-- add this for filtering
}

interface CoreOption {
    id: number;
    warna_core: string;
    kabel_odc_id: number;
    nama_kabel: string;
    kabel_tube_odc_id: number;
    warna_tube: string;
}

interface TubeOption {
    id: number;
    warna_tube: string;
    kabel_odc_id: number;
    deskripsi?: string;
}

interface Props {
    values: FoOdcFormValues;
    setValues: React.Dispatch<React.SetStateAction<FoOdcFormValues>>;
    lokasis: LokasiOption[];
    kabelOdcs: KabelOdcOption[];
    odcs: OdcOption[]; // <-- add this for ODC selection
    cores: CoreOption[]; // <-- available cores to select (optional)
    kabelTubes: TubeOption[]; // <-- available tubes for filtering cores
    errors?: ValidationBag;
}

export function CreateFoOdc({ values, setValues, lokasis, kabelOdcs, odcs, cores, kabelTubes, errors }: Props) {
    const [t] = useTranslation();
    const onChange = <K extends keyof FoOdcFormValues>(field: K, value: FoOdcFormValues[K]) =>
        setValues((v) => ({ ...v, [field]: value }));



    // Filter ODCs based on selected Kabel ODC
    const filteredOdcs = odcs.filter(odc => {
        // If no Kabel ODC is selected, show all ODCs
        if (!values.kabel_odc_id) return true;

        // Show ODCs that have the same kabel_odc_id as the selected one
        return odc.kabel_odc_id?.toString() === values.kabel_odc_id;
    });

    // Filter cores based on selected Kabel ODC (optional linkage)
    const filteredCores = cores.filter(c => {
        if (values.kabel_odc_id && String(c.kabel_odc_id) !== values.kabel_odc_id) return false;
        if (values.kabel_tube_odc_id && String(c.kabel_tube_odc_id) !== values.kabel_tube_odc_id) return false;
        return true;
    });

    // Filter tubes based on selected Kabel ODC
    const filteredTubes = kabelTubes.filter(t => String(t.kabel_odc_id) === values.kabel_odc_id);

    return (
        <Card
            title={t(
                values.create_new_lokasi ? 'New Lokasi and ODC' : 'New ODC'
            )}
        >
            {/* Create New Lokasi Toggle */}
            <Element leftSide={t('Create New Lokasi')}>
                <Checkbox
                    checked={values.create_new_lokasi}
                    onChange={(e: { target: { checked: boolean } }) =>
                        onChange('create_new_lokasi', e.target.checked)
                    }
                />
            </Element>

            {/* Lokasi Fields */}
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

            {/* ODC Fields */}
            <Element leftSide={t('Nama ODC')} required>
                <InputField
                    required
                    value={values.nama_odc}
                    onValueChange={(v) => onChange('nama_odc', v)}
                    errorMessage={errors?.errors.nama_odc}
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

            <Element leftSide={t('Kabel')} required>
                <SelectField
                    required
                    value={values.kabel_odc_id}
                    onValueChange={(v) => {
                        onChange('kabel_odc_id', v);
                        // Clear selected ODC when Kabel ODC changes
                        onChange('odc_id', '');
                        // Clear selected Core when Kabel ODC changes
                        onChange('kabel_core_odc_id', '');
                        // Clear selected Tube when Kabel ODC changes
                        onChange('kabel_tube_odc_id', '');
                    }}
                    errorMessage={errors?.errors.kabel_odc_id}
                >
                    <option value="">{t('Pilih Kabel')}</option>
                    {kabelOdcs.map((k) => (
                        <option key={k.id} value={k.id}>{k.nama_kabel}</option>
                    ))}
                </SelectField>
            </Element>

            {/* Toggle for ODC->ODC optional connection fields */}
            <Element leftSide={t('ODC->ODC connection')}>
                <Checkbox
                    checked={values.odc_connection_enabled}
                    onChange={(e: { target: { checked: boolean } }) => {
                        const next = e.target.checked;
                        if (!next) {
                            const hasExisting = Boolean(values.odc_id || values.kabel_core_odc_id || values.kabel_tube_odc_id);
                            if (hasExisting) {
                                const confirmClear = window.confirm(
                                    t('Disable ODC->ODC connection? This will clear selected Connected ODC, Tube, and Core.') as string
                                );
                                if (!confirmClear) {
                                    return; // keep current state
                                }
                            }
                            onChange('odc_connection_enabled', false);
                            onChange('odc_id', '');
                            onChange('kabel_core_odc_id', '');
                            onChange('kabel_tube_odc_id', '');
                        } else {
                            onChange('odc_connection_enabled', true);
                        }
                    }}
                />
            </Element>

            {values.odc_connection_enabled && (
                <>
                    <Element leftSide={t('Kabel Tube')}>
                        <SelectField
                            value={values.kabel_tube_odc_id}
                            onValueChange={(v) => {
                                onChange('kabel_tube_odc_id', v);
                                // Reset core when tube changes
                                onChange('kabel_core_odc_id', '');
                            }}
                            errorMessage={errors?.errors.kabel_tube_odc_id}
                        >
                            <option value="">{t('Pilih Tube (Opsional)')}</option>
                            {filteredTubes.map((t) => (
                                <option key={t.id} value={t.id.toString()}>
                                    {t.warna_tube} {t.deskripsi ? `- ${t.deskripsi}` : ''}
                                </option>
                            ))}
                        </SelectField>
                    </Element>

                    {/* Optional: Core that feeds this child ODC */}
                    <Element leftSide={t('Kabel Core')}>
                        <SelectField
                            value={values.kabel_core_odc_id}
                            onValueChange={(v) => onChange('kabel_core_odc_id', v)}
                            errorMessage={errors?.errors.kabel_core_odc_id}
                        >
                            <option value="">{t('Pilih Core (Opsional)')}</option>
                            {filteredCores.map((c) => (
                                <option key={c.id} value={c.id.toString()}>
                                    {c.warna_core} {c.warna_tube ? `- Tube ${c.warna_tube}` : ''}
                                </option>
                            ))}
                        </SelectField>
                    </Element>

                    <Element leftSide={t('Connected ODC')}>
                        <SelectField
                            value={values.odc_id}
                            onValueChange={(v) => onChange('odc_id', v)}
                            errorMessage={errors?.errors.odc_id}
                        >
                            <option value="">
                                {values.kabel_odc_id && filteredOdcs.length === 0
                                    ? t('No ODCs available for selected Kabel')
                                    : t('Pilih ODC (Optional)')}
                            </option>
                            {filteredOdcs.map((o) => (
                                <option key={o.id} value={o.id}>
                                    {o.nama_odc}{o.lokasi_name ? ` - ${o.lokasi_name}` : ''}
                                </option>
                            ))}
                        </SelectField>
                    </Element>
                </>
            )}



            <Element leftSide={t('Tipe splitter')} required>
                <SelectField
                    required
                    value={values.tipe_splitter}
                    onValueChange={(v) => onChange('tipe_splitter', v)}
                    errorMessage={errors?.errors.tipe_splitter}
                >
                    {['1:2', '1:4', '1:8', '1:16', '1:32', '1:64', '1:128'].map(
                        (opt) => (
                            <option key={opt} value={opt}>
                                {opt}
                            </option>
                        )
                    )}
                </SelectField>
            </Element>
        </Card>
    );
}
