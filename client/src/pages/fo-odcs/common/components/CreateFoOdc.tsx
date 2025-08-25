// client/src/pages/fo-odcs/common/components/CreateFoOdc.tsx

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '$app/components/cards';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Element } from '$app/components/cards';
import { InputField, Checkbox } from '$app/components/forms';
import Select from 'react-select';

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
    // Loading flags for per-field spinners
    lokasisLoading?: boolean;
    kabelOdcsLoading?: boolean;
    odcsLoading?: boolean;
    coresLoading?: boolean;
    kabelTubesLoading?: boolean;
}

export function CreateFoOdc({ values, setValues, lokasis, kabelOdcs, odcs, cores, kabelTubes, errors, lokasisLoading = false, kabelOdcsLoading = false, odcsLoading = false, coresLoading = false, kabelTubesLoading = false }: Props) {
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

            {/* Section: Lokasi (full-width) */}
            <div className="px-5 sm:px-6 py-3">
                <div className="text-sm md:text-base font-semibold text-gray-700">{t('LOKASI')}</div>
                <div className="text-xs text-gray-500 mt-1">
                    {t('Create a new Lokasi or select an existing lokasi below.')}
                </div>
            </div>

            {/* Separator */}
            <div className="px-5 sm:px-6">
                <div className="h-px bg-gray-200" />
            </div>

            {/* Create New Lokasi Toggle */}
            <Element leftSide={t('Create New Lokasi')} required>
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
                <Element leftSide={t('Select Lokasi')} required>
                    <Select
                        name="lokasi_id"
                        options={lokasis.map((l) => ({
                            value: l.id.toString(),
                            label: l.nama_lokasi,
                        }))}
                        onChange={(selected) => {
                            const selectedOption = selected as { value: string; label: string } | null;
                            onChange('lokasi_id', selectedOption ? selectedOption.value : '');
                        }}
                        value={lokasis
                            .filter((l) => l.id.toString() === values.lokasi_id)
                            .map((l) => ({
                                value: l.id.toString(),
                                label: l.nama_lokasi,
                            }))[0] || null}
                        className="w-full"
                        placeholder={lokasisLoading ? t('Loading locations...') : t('Search and select location...')}
                        isClearable
                        isSearchable
                        isLoading={lokasisLoading}
                    />
                    {errors?.errors.lokasi_id && (
                        <div className="mt-1 text-xs text-red-600">
                            {errors.errors.lokasi_id}
                        </div>
                    )}
                </Element>
            )}

            {/* Section: ODC details (full-width) */}
            <div className="px-5 sm:px-6 py-3">
                <div className="text-sm md:text-base font-semibold text-gray-700">{t('ODC')}</div>
                <div className="text-xs text-gray-500 mt-1">
                    {t('Fill in the basic information for this ODC and optionally specify Tube/Core.')}
                </div>
            </div>

            {/* Separator */}
            <div className="px-5 sm:px-6">
                <div className="h-px bg-gray-200" />
            </div>

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

            <Element leftSide={t('Tipe splitter')} required>
                <Select
                    name="tipe_splitter"
                    options={['1:2', '1:4', '1:8', '1:16', '1:32', '1:64', '1:128'].map((opt) => ({
                        value: opt,
                        label: opt,
                    }))}
                    onChange={(selected) => {
                        const selectedOption = selected as { value: string; label: string } | null;
                        onChange('tipe_splitter', selectedOption ? selectedOption.value : '');
                    }}
                    value={values.tipe_splitter ? {
                        value: values.tipe_splitter,
                        label: values.tipe_splitter,
                    } : null}
                    className="w-full"
                    placeholder={t('Select splitter type...')}
                    isClearable
                    isSearchable
                />
                {errors?.errors.tipe_splitter && (
                    <div className="mt-1 text-xs text-red-600">
                        {errors.errors.tipe_splitter}
                    </div>
                )}
            </Element>

            <Element leftSide={t('Kabel')}>
                <Select
                    name="kabel_odc_id"
                    options={kabelOdcs.map((k) => ({
                        value: k.id.toString(),
                        label: k.nama_kabel,
                    }))}
                    onChange={(selected) => {
                        const selectedOption = selected as { value: string; label: string } | null;
                        const newValue = selectedOption ? selectedOption.value : '';
                        onChange('kabel_odc_id', newValue);
                        // Clear selected ODC when Kabel ODC changes
                        onChange('odc_id', '');
                        // Clear selected Core when Kabel ODC changes
                        onChange('kabel_core_odc_id', '');
                        // Clear selected Tube when Kabel ODC changes
                        onChange('kabel_tube_odc_id', '');
                    }}
                    value={kabelOdcs
                        .filter((k) => k.id.toString() === values.kabel_odc_id)
                        .map((k) => ({
                            value: k.id.toString(),
                            label: k.nama_kabel,
                        }))[0] || null}
                    className="w-full"
                    placeholder={kabelOdcsLoading ? t('Loading cables...') : t('Select cable...')}
                    isClearable
                    isSearchable
                    isLoading={kabelOdcsLoading}
                />
                {errors?.errors.kabel_odc_id && (
                    <div className="mt-1 text-xs text-red-600">
                        {errors.errors.kabel_odc_id}
                    </div>
                )}
            </Element>

            <Element leftSide={t('Kabel Tube')}>
                <Select
                    name="kabel_tube_odc_id"
                    options={filteredTubes.map((t) => ({
                        value: t.id.toString(),
                        label: `${t.warna_tube}${t.deskripsi ? ` - ${t.deskripsi}` : ''}`,
                    }))}
                    onChange={(selected) => {
                        const selectedOption = selected as { value: string; label: string } | null;
                        const newValue = selectedOption ? selectedOption.value : '';
                        onChange('kabel_tube_odc_id', newValue);
                        // Reset core when tube changes
                        onChange('kabel_core_odc_id', '');
                    }}
                    value={filteredTubes
                        .filter((t) => t.id.toString() === values.kabel_tube_odc_id)
                        .map((t) => ({
                            value: t.id.toString(),
                            label: `${t.warna_tube}${t.deskripsi ? ` - ${t.deskripsi}` : ''}`,
                        }))[0] || null}
                    className="w-full"
                    placeholder={kabelTubesLoading ? t('Loading tubes...') : t('Select tube (optional)...')}
                    isClearable
                    isSearchable
                    isLoading={kabelTubesLoading}
                />
                {errors?.errors.kabel_tube_odc_id && (
                    <div className="mt-1 text-xs text-red-600">
                        {errors.errors.kabel_tube_odc_id}
                    </div>
                )}
            </Element>

            {/* Optional: Core that feeds this child ODC */}
            <Element leftSide={t('Kabel Core')}>
                <Select
                    name="kabel_core_odc_id"
                    options={filteredCores.map((c) => ({
                        value: c.id.toString(),
                        label: `${c.warna_core}${c.warna_tube ? ` - Tube ${c.warna_tube}` : ''}`,
                    }))}
                    onChange={(selected) => {
                        const selectedOption = selected as { value: string; label: string } | null;
                        onChange('kabel_core_odc_id', selectedOption ? selectedOption.value : '');
                    }}
                    value={filteredCores
                        .filter((c) => c.id.toString() === values.kabel_core_odc_id)
                        .map((c) => ({
                            value: c.id.toString(),
                            label: `${c.warna_core}${c.warna_tube ? ` - Tube ${c.warna_tube}` : ''}`,
                        }))[0] || null}
                    className="w-full"
                    placeholder={coresLoading ? t('Loading cores...') : t('Select core (optional)...')}
                    isClearable
                    isSearchable
                    isLoading={coresLoading}
                />
                {errors?.errors.kabel_core_odc_id && (
                    <div className="mt-1 text-xs text-red-600">
                        {errors.errors.kabel_core_odc_id}
                    </div>
                )}
            </Element>

            {/* Section: Connection (full-width) */}
            <div className="px-5 sm:px-6 py-3">
                <div className="text-sm md:text-base font-semibold text-gray-700">{t('ODC Connection')}</div>
                <div className="text-xs text-gray-500 mt-1">
                    {t('Optionally link this ODC to another ODC.')}
                </div>
            </div>
            {/* Separator */}
            <div className="px-5 sm:px-6">
                <div className="h-px bg-gray-200" />
            </div>

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
                    <Element leftSide={t('Connected ODC')}>
                        <Select
                            name="odc_id"
                            options={filteredOdcs.map((o) => ({
                                value: o.id.toString(),
                                label: `${o.nama_odc}${o.lokasi_name ? ` - ${o.lokasi_name}` : ''}`,
                            }))}
                            onChange={(selected) => {
                                const selectedOption = selected as { value: string; label: string } | null;
                                onChange('odc_id', selectedOption ? selectedOption.value : '');
                            }}
                            value={filteredOdcs
                                .filter((o) => o.id.toString() === values.odc_id)
                                .map((o) => ({
                                    value: o.id.toString(),
                                    label: `${o.nama_odc}${o.lokasi_name ? ` - ${o.lokasi_name}` : ''}`,
                                }))[0] || null}
                            className="w-full"
                            placeholder={
                                values.kabel_odc_id && filteredOdcs.length === 0
                                    ? t('No ODCs available for selected Kabel')
                                    : odcsLoading ? t('Loading ODCs...') : t('Select ODC (optional)...')
                            }
                            isClearable
                            isSearchable
                            isDisabled={Boolean(values.kabel_odc_id) && filteredOdcs.length === 0}
                            isLoading={odcsLoading}
                        />
                        {errors?.errors.odc_id && (
                            <div className="mt-1 text-xs text-red-600">
                                {errors.errors.odc_id}
                            </div>
                        )}
                    </Element>
                </>
            )}

        </Card>
    );
}
