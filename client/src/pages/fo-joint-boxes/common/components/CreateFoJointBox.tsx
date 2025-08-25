import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '$app/components/cards';
import { Element } from '$app/components/cards';
import { InputField } from '$app/components/forms/InputField';
import { Checkbox } from '$app/components/forms/Checkbox';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import Select from 'react-select';

export interface FoJointBoxForm {
    create_new_lokasi: boolean;
    lokasi_id: string;
    lokasi_name: string;
    lokasi_deskripsi: string;
    lokasi_latitude: string;
    lokasi_longitude: string;
    kabel_odc_id: string;
    odc_id: string;
    odc_2_id: string;
    odp_id: string;
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

interface OdcOption {
    id: string;
    nama_odc: string;
    lokasi_name?: string;
    kabel_odc_id?: string; // for filtering by selected Kabel ODC
}

interface OdpOption {
    id: string;
    nama_odp: string;
    lokasi_name?: string;
    odc_id?: string; // for filtering by selected ODC
}

interface Props {
    form: FoJointBoxForm;
    setForm: React.Dispatch<React.SetStateAction<FoJointBoxForm>>;
    errors?: ValidationBag;
    setErrors?: React.Dispatch<React.SetStateAction<ValidationBag | undefined>>;
    lokasis: LokasiOption[];
    kabelOdcs: KabelOdcOption[];
    odcs: OdcOption[];
    odpss: OdpOption[];
    // Loading flags per field
    lokasisLoading?: boolean;
    kabelOdcsLoading?: boolean;
    odcsLoading?: boolean;
    odpsLoading?: boolean;
}

export function CreateFoJointBox({ form, setForm, errors, setErrors, lokasis, kabelOdcs, odcs, odpss, lokasisLoading = false, kabelOdcsLoading = false, odcsLoading = false, odpsLoading = false }: Props) {
    const [t] = useTranslation();
    // Determine connection type and enable/disable state
    const [selectedConnectionType, setSelectedConnectionType] = useState<'odc-odc' | 'odc-odp' | ''>('');
    const [connectionEnabled, setConnectionEnabled] = useState(false);

    // Initialize state based on existing form data (for editing)
    useEffect(() => {
        // Determine connection type from existing data
        if (form.odc_2_id) {
            setSelectedConnectionType('odc-odc');
            setConnectionEnabled(true);
        } else if (form.odp_id) {
            setSelectedConnectionType('odc-odp');
            setConnectionEnabled(true);
        } else {
            setSelectedConnectionType('');
            setConnectionEnabled(false);
        }
    }, [form.odc_2_id, form.odp_id]);

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

    const handleConnectionTypeChange = (type: 'odc-odc' | 'odc-odp' | '') => {
        setSelectedConnectionType(type);
        // Clear all connection fields when changing type
        setForm(f => ({
            ...f,
            odc_id: '',
            odc_2_id: '',
            odp_id: ''
        }));
    };

    const handleConnectionEnabledChange = (enabled: boolean) => {
        setConnectionEnabled(enabled);
        if (!enabled) {
            // Clear all connection selections when disabling
            setSelectedConnectionType('');
            setForm(f => ({
                ...f,
                odc_id: '',
                odc_2_id: '',
                odp_id: ''
            }));
        }
    };

    // Derive filtered ODCs based on selected Kabel ODC
    const selectedKabelId = form.kabel_odc_id;
    const selectedOdcId = form.odc_id;

    let filteredOdcs = odcs.filter(o => !selectedKabelId || o.kabel_odc_id === selectedKabelId);
    // Ensure currently selected ODC remains visible even if it doesn't match filter
    if (selectedOdcId && !filteredOdcs.some(o => o.id === selectedOdcId)) {
        const current = odcs.find(o => o.id === selectedOdcId);
        if (current) filteredOdcs = [current, ...filteredOdcs];
    }

    // Derive filtered ODPs based on selected ODC, else by selected Kabel's ODCs
    const allowedOdcIds = new Set<string>();
    if (selectedOdcId) {
        allowedOdcIds.add(selectedOdcId);
    } else if (selectedKabelId) {
        odcs.forEach(o => {
            if (o.kabel_odc_id === selectedKabelId) allowedOdcIds.add(o.id);
        });
    }
    let filteredOdps = odpss.filter(p => allowedOdcIds.size === 0 || (p.odc_id && allowedOdcIds.has(p.odc_id)));
    // Ensure currently selected ODP remains visible
    if (form.odp_id && !filteredOdps.some(p => p.id === form.odp_id)) {
        const current = odpss.find(p => p.id === form.odp_id);
        if (current) filteredOdps = [current, ...filteredOdps];
    }
    return (
        <Card title={form.create_new_lokasi ? 'New Lokasi and Joint Box' : 'New Joint Box'}>

            {/* Section: Lokasi */}
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

            {/* Create New Lokasi Toggle */}
            <Element leftSide={t('Create New Lokasi')} required>
                <Checkbox
                    checked={form.create_new_lokasi}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('create_new_lokasi', e.target.checked)}
                />
            </Element>
            {/* Lokasi Fields */}
            {form.create_new_lokasi ? (
                <>
                    <Element leftSide={t('Nama Lokasi')} required>
                        <InputField
                            required
                            value={form.lokasi_name}
                            onValueChange={v => handleChange('lokasi_name', v)}
                            errorMessage={errors?.errors?.nama_lokasi}
                        />
                    </Element>
                    <Element leftSide={t('Deskripsi')}>
                        <InputField
                            element="textarea"
                            value={form.lokasi_deskripsi}
                            onValueChange={v => handleChange('lokasi_deskripsi', v)}
                            errorMessage={errors?.errors?.deskripsi}
                        />
                    </Element>
                    <Element leftSide={t('Latitude')} required>
                        <InputField
                            required
                            type="number"
                            value={form.lokasi_latitude}
                            onValueChange={v => handleChange('lokasi_latitude', v)}
                            errorMessage={errors?.errors?.latitude}
                        />
                    </Element>
                    <Element leftSide={t('Longitude')} required>
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
                <Element leftSide={t('Select Lokasi')} required>
                    <Select
                        name="lokasi_id"
                        options={lokasis.map((l) => ({
                            value: l.id,
                            label: l.nama_lokasi
                        }))}
                        value={lokasis.find((l) => l.id === form.lokasi_id) ? {
                            value: form.lokasi_id,
                            label: lokasis.find((l) => l.id === form.lokasi_id)?.nama_lokasi || ''
                        } : null}
                        onChange={(option: any) => handleChange('lokasi_id', option?.value || '')}
                        placeholder={lokasisLoading ? t('Loading locations...') : t('Search and select location...')}
                        isClearable
                        isSearchable
                        className="w-full"
                        classNamePrefix="select"
                        noOptionsMessage={() => t('No locations found')}
                        loadingMessage={() => t('Loading locations...')}
                        isLoading={lokasisLoading}
                    />
                    {errors?.errors?.lokasi_id && (
                        <div className="text-red-500 text-sm mt-1">{errors.errors.lokasi_id}</div>
                    )}
                </Element>
            )}

            {/* Section: Joint Box */}
            <div className="px-5 sm:px-6 py-3">
                <div className="text-sm md:text-base font-semibold text-gray-700">{t('JOINT BOX')}</div>
                <div className="text-xs text-gray-500 mt-1">
                    {t('Fill in the basic information for this Joint Box.')}
                </div>
            </div>
            {/* Separator */}
            <div className="px-5 sm:px-6">
                <div className="h-px bg-gray-200" />
            </div>

            {/* Joint Box Fields */}
            <Element leftSide={t('Nama Joint Box')} required>
                <InputField
                    required
                    value={form.nama_joint_box}
                    onValueChange={v => handleChange('nama_joint_box', v)}
                    errorMessage={errors?.errors?.nama_joint_box}
                />
            </Element>

            <Element leftSide={t('Deskripsi')}>
                <InputField
                    element="textarea"
                    value={form.deskripsi || ''}
                    onValueChange={v => handleChange('deskripsi', v)}
                    errorMessage={errors?.errors?.deskripsi}
                />
            </Element>
            <Element leftSide={t('Kabel')} required>
                <Select
                    name="kabel_odc_id"
                    options={kabelOdcs.map((k) => ({
                        value: k.id,
                        label: k.nama_kabel
                    }))}
                    value={kabelOdcs.find((k) => k.id === form.kabel_odc_id) ? {
                        value: form.kabel_odc_id,
                        label: kabelOdcs.find((k) => k.id === form.kabel_odc_id)?.nama_kabel || ''
                    } : null}
                    onChange={(option: any) => {
                        handleChange('kabel_odc_id', option?.value || '');
                        // Reset dependent selections when Kabel ODC changes
                        setForm(f => ({ ...f, odc_id: '', odp_id: '' }));
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
                {errors?.errors?.kabel_odc_id && (
                    <div className="text-red-500 text-sm mt-1">{errors.errors.kabel_odc_id}</div>
                )}
            </Element>

            {/* Section: Connection Type */}
            <div className="px-5 sm:px-6 py-3">
                <div className="text-sm md:text-base font-semibold text-gray-700">{t('Connection Type & Details (Optional)')}</div>
                <div className="text-xs text-gray-500 mt-1">
                    {t('Optionally choose the type of connection this joint box will facilitate. Then configure the specific connection details based on your selection.')}
                </div>
            </div>
            {/* Separator */}
            <div className="px-5 sm:px-6">
                <div className="h-px bg-gray-200" />
            </div>

            {/* Connection Type Toggle */}
            <Element leftSide={t('Connection Type')}>
                <Checkbox
                    checked={connectionEnabled}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleConnectionEnabledChange(e.target.checked)}
                />
            </Element>

            {/* Radio options shown when enabled */}
            {connectionEnabled && (
                <Element leftSide={t('Select Connection')}>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <input
                                type="radio"
                                id="odc-odc"
                                name="connection_type"
                                value="odc-odc"
                                checked={selectedConnectionType === 'odc-odc'}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleConnectionTypeChange(e.target.value as 'odc-odc' | 'odc-odp' | '')}
                            />
                            <label htmlFor="odc-odc">{t('ODC → ODC Connection')}</label>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="radio"
                                id="odc-odp"
                                name="connection_type"
                                value="odc-odp"
                                checked={selectedConnectionType === 'odc-odp'}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleConnectionTypeChange(e.target.value as 'odc-odc' | 'odc-odp' | '')}
                            />
                            <label htmlFor="odc-odp">{t('ODC → ODP Connection')}</label>
                        </div>
                    </div>
                </Element>
            )}

            {/* ODC→ODC Fields */}
            {connectionEnabled && selectedConnectionType === 'odc-odc' && (
                <>
                    <Element leftSide={t('Source ODC')} required>
                        <Select
                            name="odc_id"
                            options={filteredOdcs.map((o) => ({
                                value: o.id,
                                label: `${o.nama_odc}${o.lokasi_name ? ` - ${o.lokasi_name}` : ''}`
                            }))}
                            value={filteredOdcs.find((o) => o.id === form.odc_id) ? {
                                value: form.odc_id,
                                label: (() => {
                                    const odc = filteredOdcs.find((o) => o.id === form.odc_id);
                                    return odc ? `${odc.nama_odc}${odc.lokasi_name ? ` - ${odc.lokasi_name}` : ''}` : '';
                                })()
                            } : null}
                            onChange={(option: any) => {
                                handleChange('odc_id', option?.value || '');
                                // Reset dependent selections when source ODC changes
                                setForm(f => ({ ...f, odp_id: '', odc_2_id: '' }));
                            }}
                            placeholder={odcsLoading ? t('Loading ODCs...') : t('Search and select source ODC...')}
                            isClearable
                            isSearchable
                            className="w-full"
                            classNamePrefix="select"
                            noOptionsMessage={() => t('No ODCs found')}
                            loadingMessage={() => t('Loading ODCs...')}
                            isLoading={odcsLoading}
                            isDisabled={!form.kabel_odc_id}
                        />
                        {errors?.errors?.odc_id && (
                            <div className="text-red-500 text-sm mt-1">{errors.errors.odc_id}</div>
                        )}
                    </Element>
                    <Element leftSide={t('Target ODC')} required>
                        <Select
                            name="odc_2_id"
                            options={filteredOdcs.filter(odc => odc.id !== form.odc_id).map((o) => ({
                                value: o.id,
                                label: `${o.nama_odc}${o.lokasi_name ? ` - ${o.lokasi_name}` : ''}`
                            }))}
                            value={filteredOdcs.find((o) => o.id === form.odc_2_id) ? {
                                value: form.odc_2_id,
                                label: (() => {
                                    const odc = filteredOdcs.find((o) => o.id === form.odc_2_id);
                                    return odc ? `${odc.nama_odc}${odc.lokasi_name ? ` - ${odc.lokasi_name}` : ''}` : '';
                                })()
                            } : null}
                            onChange={(option: any) => handleChange('odc_2_id', option?.value || '')}
                            placeholder={odcsLoading ? t('Loading ODCs...') : t('Search and select target ODC...')}
                            isClearable
                            isSearchable
                            className="w-full"
                            classNamePrefix="select"
                            noOptionsMessage={() => t('No ODCs found')}
                            loadingMessage={() => t('Loading ODCs...')}
                            isLoading={odcsLoading}
                            isDisabled={!form.odc_id}
                        />
                        {errors?.errors?.odc_2_id && (
                            <div className="text-red-500 text-sm mt-1">{errors.errors.odc_2_id}</div>
                        )}
                    </Element>
                </>
            )}

            {/* ODC→ODP Fields */}
            {connectionEnabled && selectedConnectionType === 'odc-odp' && (
                <>
                    <Element leftSide={t('Source ODC')} required>
                        <Select
                            name="odc_id"
                            options={filteredOdcs.map((o) => ({
                                value: o.id,
                                label: `${o.nama_odc}${o.lokasi_name ? ` - ${o.lokasi_name}` : ''}`
                            }))}
                            value={filteredOdcs.find((o) => o.id === form.odc_id) ? {
                                value: form.odc_id,
                                label: (() => {
                                    const odc = filteredOdcs.find((o) => o.id === form.odc_id);
                                    return odc ? `${odc.nama_odc}${odc.lokasi_name ? ` - ${odc.lokasi_name}` : ''}` : '';
                                })()
                            } : null}
                            onChange={(option: any) => {
                                handleChange('odc_id', option?.value || '');
                                // Reset dependent selections when source ODC changes
                                setForm(f => ({ ...f, odp_id: '', odc_2_id: '' }));
                            }}
                            placeholder={odcsLoading ? t('Loading ODCs...') : t('Search and select source ODC...')}
                            isClearable
                            isSearchable
                            className="w-full"
                            classNamePrefix="select"
                            noOptionsMessage={() => t('No ODCs found')}
                            loadingMessage={() => t('Loading ODCs...')}
                            isLoading={odcsLoading}
                            isDisabled={!form.kabel_odc_id}
                        />
                        {errors?.errors?.odc_id && (
                            <div className="text-red-500 text-sm mt-1">{errors.errors.odc_id}</div>
                        )}
                    </Element>
                    <Element leftSide={t('Target ODP')} required>
                        <Select
                            name="odp_id"
                            options={filteredOdps.map((o) => ({
                                value: o.id,
                                label: `${o.nama_odp}${o.lokasi_name ? ` - ${o.lokasi_name}` : ''}`
                            }))}
                            value={filteredOdps.find((o) => o.id === form.odp_id) ? {
                                value: form.odp_id,
                                label: (() => {
                                    const odp = filteredOdps.find((o) => o.id === form.odp_id);
                                    return odp ? `${odp.nama_odp}${odp.lokasi_name ? ` - ${odp.lokasi_name}` : ''}` : '';
                                })()
                            } : null}
                            onChange={(option: any) => handleChange('odp_id', option?.value || '')}
                            placeholder={odpsLoading ? t('Loading ODPs...') : t('Search and select target ODP...')}
                            isClearable
                            isSearchable
                            className="w-full"
                            classNamePrefix="select"
                            noOptionsMessage={() => t('No ODPs found')}
                            loadingMessage={() => t('Loading ODPs...')}
                            isLoading={odpsLoading}
                            isDisabled={!form.odc_id}
                        />
                        {errors?.errors?.odp_id && (
                            <div className="text-red-500 text-sm mt-1">{errors.errors.odp_id}</div>
                        )}
                    </Element>
                </>
            )}

            {/* Visual feedback for connection types */}
            {connectionEnabled && (
                <div className="px-5 sm:px-6 py-3">
                    <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
                        <div className="text-sm text-blue-800">
                            <strong>{t('Active Connections')}:</strong>
                            {selectedConnectionType === 'odc-odc' && <div>• {t('ODC → ODC')}</div>}
                            {selectedConnectionType === 'odc-odp' && <div>• {t('ODC → ODP')}</div>}
                        </div>
                    </div>
                </div>
            )}
            {/* Status field removed for consistency with other FO modules */}
        </Card>
    );
}
