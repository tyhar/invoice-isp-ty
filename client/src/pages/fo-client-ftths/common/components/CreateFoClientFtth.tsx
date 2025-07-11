import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Element } from '$app/components/cards';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { InputField, SelectField, Checkbox } from '$app/components/forms';

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
}

export function CreateFoClientFtth({
    values,
    setValues,
    errors,
    lokasis,
    odps,
    clients,
    isEdit,
}: Props) {
    const [t] = useTranslation();
    const onChange = <K extends keyof FoClientFtthFormValues>(
        field: K,
        value: FoClientFtthFormValues[K]
    ) => setValues((v) => ({ ...v, [field]: value }));

    return (
        <Card title={isEdit ? t('Edit Client FTTH') : t('New Client FTTH')}>
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

            <Element leftSide={t('ODP')} required>
                <SelectField
                    required
                    value={values.odp_id}
                    onValueChange={(v) => onChange('odp_id', v)}
                    errorMessage={errors?.errors.odp_id}
                >
                    <option value="">{t('select odp')}</option>
                    {odps.map((o) => (
                        <option key={o.id} value={o.id.toString()}>
                            {o.nama_odp}
                        </option>
                    ))}
                </SelectField>
            </Element>

            <Element leftSide={t('Client')}>
                <SelectField
                    value={values.client_id}
                    onValueChange={(v) => onChange('client_id', v)}
                    errorMessage={errors?.errors.client_id}
                >
                    <option value="">
                        {t('select client') || 'Select a client (optional)'}
                    </option>
                    {clients.map((c) => (
                        <option key={c.id} value={c.id.toString()}>
                            {c.name}
                        </option>
                    ))}
                </SelectField>
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
                    value={values.alamat}
                    onValueChange={(v) => onChange('alamat', v)}
                    errorMessage={errors?.errors.alamat}
                />
            </Element>
        </Card>
    );
}
