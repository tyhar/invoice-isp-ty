import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Element } from '$app/components/cards';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { InputField, Checkbox } from '$app/components/forms';
import Select from 'react-select';

export interface FoClientFtthFormValues {
    create_new_lokasi: boolean;
    lokasi_id: string;
    lokasi_name: string;
    lokasi_deskripsi: string;
    lokasi_latitude: string;
    lokasi_longitude: string;
    odp_id: string;
    client_id: string; // can be empty string for null
    nama_client: string;
    alamat: string;
    status: 'active' | 'archived';
}

interface Option {
    id: number;
    name: string;
}
interface LokasiOption {
    id: number;
    nama_lokasi: string;
}
interface OdpOption {
    id: number;
    nama_odp: string;
}

interface Props {
    values: FoClientFtthFormValues;
    setValues: React.Dispatch<React.SetStateAction<FoClientFtthFormValues>>;
    errors?: ValidationBag;
    lokasis: LokasiOption[];
    odps: OdpOption[];
    clients: Option[];
    isEdit?: boolean;
    // Loading flags per field
    lokasisLoading?: boolean;
    odpsLoading?: boolean;
    clientsLoading?: boolean;
}

export function CreateFoClientFtth({
    values,
    setValues,
    errors,
    lokasis,
    odps,
    clients,
    isEdit,
    lokasisLoading = false,
    odpsLoading = false,
    clientsLoading = false,
}: Props) {
    const [t] = useTranslation();
    const onChange = <K extends keyof FoClientFtthFormValues>(
        field: K,
        value: FoClientFtthFormValues[K]
    ) => setValues((v) => ({ ...v, [field]: value }));

    return (
        <Card title={isEdit ? t('Edit Client FTTH') : t('New Client FTTH')}>

            {/* Section: Lokasi (full-width) */}
            <div className="px-5 sm:px-6 py-3">
                <div className="text-sm md:text-base font-semibold text-gray-700">{t('LOKASI')}</div>
                <div className="text-xs text-gray-500 mt-1">
                    {t('Create a new lokasi or select an existing lokasi below.')}
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
                        value={lokasis.map((l) => ({
                            value: l.id.toString(),
                            label: l.nama_lokasi
                        })).find(option => option.value === values.lokasi_id)}
                        onChange={(option) => onChange('lokasi_id', option ? option.value : '')}
                        placeholder={lokasisLoading ? t('Loading locations...') : t('Search and select location...')}
                        isClearable
                        className="basic-single"
                        classNamePrefix="select"
                        isLoading={lokasisLoading}
                    />
                    {errors?.errors.lokasi_id && (
                        <p className="text-red-500 text-xs mt-1">{errors.errors.lokasi_id}</p>
                    )}
                </Element>
            )}

            {/* Section: CLIENT FTTH (full-width) */}
            <div className="px-5 sm:px-6 py-3">
                <div className="text-sm md:text-base font-semibold text-gray-700">{t('CLIENT FTTH')}</div>
                <div className="text-xs text-gray-500 mt-1">
                    {t('Select the ODP and fill in the basic information for this Client FTTH.')}
                </div>
            </div>
            {/* Separator */}
            <div className="px-5 sm:px-6">
                <div className="h-px bg-gray-200" />
            </div>

            <Element leftSide={t('Select ODP')} required>
                <Select
                    name="odp_id"
                    options={odps.map((o) => ({
                        value: o.id.toString(),
                        label: o.nama_odp
                    }))}
                    value={odps.map((o) => ({
                        value: o.id.toString(),
                        label: o.nama_odp
                    })).find(option => option.value === values.odp_id)}
                    onChange={(option) => onChange('odp_id', option ? option.value : '')}
                    placeholder={odpsLoading ? t('Loading ODPs...') : t('Search and select ODP...')}
                    isClearable
                    className="basic-single"
                    classNamePrefix="select"
                    isLoading={odpsLoading}
                />
                {errors?.errors.odp_id && (
                    <p className="text-red-500 text-xs mt-1">{errors.errors.odp_id}</p>
                )}
            </Element>

            <Element leftSide={t('Client')}>
                <Select
                    name="client_id"
                    options={clients.map((c) => ({
                        value: c.id.toString(),
                        label: c.name
                    }))}
                    value={clients.map((c) => ({
                        value: c.id.toString(),
                        label: c.name
                    })).find(option => option.value === values.client_id)}
                    onChange={(option) => onChange('client_id', option ? option.value : '')}
                    placeholder={clientsLoading ? t('Loading clients...') : t('Search and select client (optional)...')}
                    isClearable
                    className="basic-single"
                    classNamePrefix="select"
                    isLoading={clientsLoading}
                />
                {errors?.errors.client_id && (
                    <p className="text-red-500 text-xs mt-1">{errors.errors.client_id}</p>
                )}
            </Element>

            <Element leftSide={t('Nama Client')}>
                <InputField
                    value={values.nama_client}
                    onValueChange={(v) => onChange('nama_client', v)}
                    errorMessage={errors?.errors.nama_client}
                />
            </Element>

            <Element leftSide={t('Alamat')}>
                <InputField
                    element='textarea'
                    value={values.alamat}
                    onValueChange={(v) => onChange('alamat', v)}
                    errorMessage={errors?.errors.alamat}
                />
            </Element>
        </Card>
    );
}
