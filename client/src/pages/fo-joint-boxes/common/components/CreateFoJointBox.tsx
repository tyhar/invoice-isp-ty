import React from 'react';
import { Card } from '$app/components/cards';
import { Element } from '$app/components/cards';
import { InputField, SelectField, Checkbox } from '$app/components/forms';
import { ValidationBag } from '$app/common/interfaces/validation-bag';

export interface FoJointBoxForm {
    create_new_lokasi: boolean;
    lokasi_id: string;
    lokasi_name: string;
    lokasi_deskripsi: string;
    lokasi_latitude: string;
    lokasi_longitude: string;
    kabel_odc_id: string;
    nama_joint_box: string;
    deskripsi: string;
    // status: 'active' | 'archived'; // REMOVE from form interface
}

interface LokasiOption {
    id: string;
    nama_lokasi: string;
}

interface KabelOdcOption {
    id: string;
    nama_kabel: string;
}

interface Props {
    form: FoJointBoxForm;
    setForm: React.Dispatch<React.SetStateAction<FoJointBoxForm>>;
    errors?: ValidationBag;
    setErrors?: React.Dispatch<React.SetStateAction<ValidationBag | undefined>>;
    lokasis: LokasiOption[];
    kabelOdcs: KabelOdcOption[];
}

export function CreateFoJointBox({ form, setForm, errors, setErrors, lokasis, kabelOdcs }: Props) {
    const handleChange = <K extends keyof FoJointBoxForm>(field: K, value: FoJointBoxForm[K]) => {
        setForm(f => ({ ...f, [field]: value }));
        if (setErrors && errors?.errors?.[field]) {
            setErrors(prev => {
                if (!prev) return prev;
                const rest = { ...prev.errors };
                delete rest[field];
                return { ...prev, errors: rest };
            });
        }
    };
    return (
        <Card title={form.create_new_lokasi ? 'New Lokasi and Joint Box' : 'New Joint Box'}>
            {/* Create New Lokasi Toggle */}
            <Element leftSide="Create New Lokasi">
                <Checkbox
                    checked={form.create_new_lokasi}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('create_new_lokasi', e.target.checked)}
                />
            </Element>
            {/* Lokasi Fields */}
            {form.create_new_lokasi ? (
                <>
                    <Element leftSide="Nama Lokasi" required>
                        <InputField
                            required
                            value={form.lokasi_name}
                            onValueChange={v => handleChange('lokasi_name', v)}
                            errorMessage={errors?.errors?.nama_lokasi}
                        />
                    </Element>
                    <Element leftSide="Deskripsi">
                        <InputField
                            element="textarea"
                            value={form.lokasi_deskripsi}
                            onValueChange={v => handleChange('lokasi_deskripsi', v)}
                            errorMessage={errors?.errors?.deskripsi}
                        />
                    </Element>
                    <Element leftSide="Latitude" required>
                        <InputField
                            required
                            type="number"
                            value={form.lokasi_latitude}
                            onValueChange={v => handleChange('lokasi_latitude', v)}
                            errorMessage={errors?.errors?.latitude}
                        />
                    </Element>
                    <Element leftSide="Longitude" required>
                        <InputField
                            required
                            type="number"
                            value={form.lokasi_longitude}
                            onValueChange={v => handleChange('lokasi_longitude', v)}
                            errorMessage={errors?.errors?.longitude}
                        />
                    </Element>
                </>
            ) : (
                <Element leftSide="Lokasi" required>
                    <SelectField
                        required
                        value={form.lokasi_id}
                        onValueChange={v => handleChange('lokasi_id', v)}
                        errorMessage={errors?.errors?.lokasi_id}
                    >
                        <option value="">Pilih Lokasi</option>
                        {lokasis.map(l => (
                            <option key={l.id} value={l.id}>{l.nama_lokasi}</option>
                        ))}
                    </SelectField>
                </Element>
            )}
            {/* Joint Box Fields */}
            <Element leftSide="Nama Joint Box" required>
                <InputField
                    required
                    value={form.nama_joint_box}
                    onValueChange={v => handleChange('nama_joint_box', v)}
                    errorMessage={errors?.errors?.nama_joint_box}
                />
            </Element>

            <Element leftSide="Deskripsi">
                <InputField
                    element="textarea"
                    value={form.deskripsi || ''}
                    onValueChange={v => handleChange('deskripsi', v)}
                    errorMessage={errors?.errors?.deskripsi}
                />
            </Element>
            <Element leftSide="Kabel ODC" required>
                <SelectField
                    required
                    value={form.kabel_odc_id}
                    onValueChange={v => handleChange('kabel_odc_id', v)}
                    errorMessage={errors?.errors?.kabel_odc_id}
                >
                    <option value="">Pilih Kabel ODC</option>
                    {kabelOdcs.map(k => (
                        <option key={k.id} value={k.id}>{k.nama_kabel}</option>
                    ))}
                </SelectField>
            </Element>
            {/* Status field removed for consistency with other FO modules */}
        </Card>
    );
}
