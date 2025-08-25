// client/src/pages/fo-odps/common/components/CreateFoOdp.tsx

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Element } from '$app/components/cards';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { InputField, Checkbox } from '$app/components/forms';
import Select from 'react-select';

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
    // Loading flags per field
    lokasisLoading?: boolean;
    kabelOdcsLoading?: boolean;
    kabelTubesLoading?: boolean;
    coresLoading?: boolean;
    odcsLoading?: boolean;
}

export function CreateFoOdp({
    values,
    setValues,
    lokasis,
    kabelOdcs,
    kabelTubes,
    cores,
    errors,
    lokasisLoading = false,
    kabelOdcsLoading = false,
    kabelTubesLoading = false,
    coresLoading = false,
    odcsLoading = false,
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
                    <Select
                        name="lokasi_id"
                        options={lokasis.map((l) => ({
                            value: l.id.toString(),
                            label: l.nama_lokasi
                        }))}
                        value={lokasis.find((l) => l.id.toString() === values.lokasi_id) ? {
                            value: values.lokasi_id,
                            label: lokasis.find((l) => l.id.toString() === values.lokasi_id)?.nama_lokasi || ''
                        } : null}
                        onChange={(option: any) => onChange('lokasi_id', option?.value || '')}
                        placeholder={lokasisLoading ? t('Loading locations...') : t('Search and select location...')}
                        isClearable
                        isSearchable
                        className="w-full"
                        classNamePrefix="select"
                        noOptionsMessage={() => t('No locations found')}
                        loadingMessage={() => t('Loading locations...')}
                        isLoading={lokasisLoading}
                    />
                    {errors?.errors.lokasi_id && (
                        <div className="text-red-500 text-sm mt-1">{errors.errors.lokasi_id}</div>
                    )}
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
                <Select
                    name="kabel_odc_id"
                    options={kabelOptions.map((k) => ({
                        value: k.id.toString(),
                        label: k.nama_kabel
                    }))}
                    value={kabelOptions.find((k) => k.id.toString() === values.kabel_odc_id) ? {
                        value: values.kabel_odc_id,
                        label: kabelOptions.find((k) => k.id.toString() === values.kabel_odc_id)?.nama_kabel || ''
                    } : null}
                    onChange={(option: any) => {
                        onChange('kabel_odc_id', option?.value || '');
                        // reset dependent
                        onChange('kabel_tube_odc_id', '');
                        onChange('kabel_core_odc_id', '');
                    }}
                    placeholder={kabelOdcsLoading ? t('Loading cables...') : t('Search and select cable...')}
                    isClearable
                    isSearchable
                    className="w-full"
                    classNamePrefix="select"
                    noOptionsMessage={() => t('No cables found')}
                    loadingMessage={() => t('Loading cables...')}
                    isLoading={kabelOdcsLoading}
                />
                {errors?.errors.kabel_odc_id && (
                    <div className="text-red-500 text-sm mt-1">{errors.errors.kabel_odc_id}</div>
                )}
            </Element>

            <Element leftSide={t('Kabel Tube')}>
                <Select
                    name="kabel_tube_odc_id"
                    options={tubeOptions.map((t) => ({
                        value: t.id.toString(),
                        label: `${t.warna_tube} - ${t.deskripsi || `Tube ${t.warna_tube}`}`
                    }))}
                    value={tubeOptions.find((t) => t.id.toString() === values.kabel_tube_odc_id) ? {
                        value: values.kabel_tube_odc_id,
                        label: (() => {
                            const tube = tubeOptions.find((t) => t.id.toString() === values.kabel_tube_odc_id);
                            return tube ? `${tube.warna_tube} - ${tube.deskripsi || `Tube ${tube.warna_tube}`}` : '';
                        })()
                    } : null}
                    onChange={(option: any) => {
                        onChange('kabel_tube_odc_id', option?.value || '');
                        onChange('kabel_core_odc_id', '');
                    }}
                    placeholder={kabelTubesLoading ? t('Loading tubes...') : t('Search and select tube...')}
                    isClearable
                    isSearchable
                    className="w-full"
                    classNamePrefix="select"
                    noOptionsMessage={() => t('No tubes found')}
                    loadingMessage={() => t('Loading tubes...')}
                    isLoading={kabelTubesLoading}
                    isDisabled={!values.kabel_odc_id}
                />
                {errors?.errors.kabel_tube_odc_id && (
                    <div className="text-red-500 text-sm mt-1">{errors.errors.kabel_tube_odc_id}</div>
                )}
            </Element>

            <Element leftSide={t('Kabel Core ODC')}>
                <Select
                    name="kabel_core_odc_id"
                    options={coreOptions.map((c) => ({
                        value: c.id.toString(),
                        label: `${c.warna_core} - ${c.deskripsi || `Core ${c.warna_core} for tube ${c.warna_tube}`}`
                    }))}
                    value={coreOptions.find((c) => c.id.toString() === values.kabel_core_odc_id) ? {
                        value: values.kabel_core_odc_id,
                        label: (() => {
                            const core = coreOptions.find((c) => c.id.toString() === values.kabel_core_odc_id);
                            return core ? `${core.warna_core} - ${core.deskripsi || `Core ${core.warna_core} for tube ${core.warna_tube}`}` : '';
                        })()
                    } : null}
                    onChange={(option: any) => onChange('kabel_core_odc_id', option?.value || '')}
                    placeholder={coresLoading ? t('Loading cores...') : t('Search and select core...')}
                    isClearable
                    isSearchable
                    className="w-full"
                    classNamePrefix="select"
                    noOptionsMessage={() => t('No cores found')}
                    loadingMessage={() => t('Loading cores...')}
                    isLoading={coresLoading}
                    isDisabled={!values.kabel_tube_odc_id}
                />
                {errors?.errors.kabel_core_odc_id && (
                    <div className="text-red-500 text-sm mt-1">{errors.errors.kabel_core_odc_id}</div>
                )}
            </Element>

            <Element leftSide={t('ODC')} required={!!values.kabel_odc_id}>
                <Select
                    name="odc_id"
                    options={odcOptions.map((odc: any) => ({
                        value: odc.id.toString(),
                        label: odc.nama_odc
                    }))}
                    value={odcOptions.find((odc: any) => odc.id.toString() === values.odc_id) ? {
                        value: values.odc_id,
                        label: odcOptions.find((odc: any) => odc.id.toString() === values.odc_id)?.nama_odc || ''
                    } : null}
                    onChange={(option: any) => onChange('odc_id', option?.value || '')}
                    placeholder={odcsLoading ? t('Loading ODCs...') : t('Search and select ODC...')}
                    isClearable
                    isSearchable
                    className="w-full"
                    classNamePrefix="select"
                    noOptionsMessage={() => t('No ODCs found')}
                    loadingMessage={() => t('Loading ODCs...')}
                    isLoading={odcsLoading}
                    isDisabled={!values.kabel_odc_id}
                />
                {errors?.errors.odc_id && (
                    <div className="text-red-500 text-sm mt-1">{errors.errors.odc_id}</div>
                )}
            </Element>
        </Card>
    );
}
