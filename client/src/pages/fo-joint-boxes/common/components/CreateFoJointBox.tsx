import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '$app/components/cards';
import { Element } from '$app/components/cards';
import { InputField } from '$app/components/forms/InputField';
import { SelectField } from '$app/components/forms/SelectField';
import { Checkbox } from '$app/components/forms/Checkbox';
import { ValidationBag } from '$app/common/interfaces/validation-bag';

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
}

export function CreateFoJointBox({ form, setForm, errors, setErrors, lokasis, kabelOdcs, odcs, odpss }: Props) {
    const [t] = useTranslation();
    // Determine connection type and checkbox states
    const [selectedConnectionType, setSelectedConnectionType] = useState<'odc-odc' | 'odc-odp' | ''>('');
    const [showOdcToOdcFields, setShowOdcToOdcFields] = useState(false);
    const [showOdcToOdpFields, setShowOdcToOdpFields] = useState(false);

    // Initialize state based on existing form data (for editing)
    useEffect(() => {
        // Determine connection type from existing data
        if (form.odc_2_id) {
            setSelectedConnectionType('odc-odc');
            setShowOdcToOdcFields(true);
        } else if (form.odp_id) {
            setSelectedConnectionType('odc-odp');
            setShowOdcToOdpFields(true);
        } else {
            setSelectedConnectionType('');
            setShowOdcToOdcFields(false);
            setShowOdcToOdpFields(false);
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
        // Clear all connection fields and checkbox states when changing type
        setForm(f => ({
            ...f,
            odc_id: '',
            odc_2_id: '',
            odp_id: ''
        }));
        setShowOdcToOdcFields(false);
        setShowOdcToOdpFields(false);
    };

    const handleOdcToOdcCheckbox = (checked: boolean) => {
        setShowOdcToOdcFields(checked);
        if (checked) {
            // Enable ODC→ODC fields
            setForm(f => ({
                ...f,
                odc_2_id: '' // Clear so user can select
            }));
        } else {
            // Disable ODC→ODC fields
            setForm(f => ({
                ...f,
                odc_id: '',
                odc_2_id: ''
            }));
        }
    };

    const handleOdcToOdpCheckbox = (checked: boolean) => {
        setShowOdcToOdpFields(checked);
        if (checked) {
            // Enable ODC→ODP fields
            setForm(f => ({
                ...f,
                odp_id: '' // Clear so user can select
            }));
        } else {
            // Disable ODC→ODP fields
            setForm(f => ({
                ...f,
                odc_id: '',
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
                    {t('Create a new lokasi or select an existing lokasi below.')}
                </div>
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
                <Element leftSide={t('Lokasi')} required>
                    <SelectField
                        required
                        value={form.lokasi_id}
                        onValueChange={v => handleChange('lokasi_id', v)}
                        errorMessage={errors?.errors?.lokasi_id}
                    >
                        <option value="">{t('Pilih Lokasi')}</option>
                        {lokasis.map(l => (
                            <option key={l.id} value={l.id}>{l.nama_lokasi}</option>
                        ))}
                    </SelectField>
                </Element>
            )}

            {/* Separator */}
            <div className="px-5 sm:px-6">
                <div className="h-px bg-gray-200" />
            </div>

            {/* Section: Joint Box */}
            <div className="px-5 sm:px-6 py-3">
                <div className="text-sm md:text-base font-semibold text-gray-700">{t('JOINT BOX')}</div>
                <div className="text-xs text-gray-500 mt-1">
                    {t('Fill in the basic information for this JOINT BOX.')}
                </div>
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
                <SelectField
                    required
                    value={form.kabel_odc_id}
                    onValueChange={v => {
                        handleChange('kabel_odc_id', v);
                        // Reset dependent selections when Kabel ODC changes
                        setForm(f => ({ ...f, odc_id: '', odp_id: '' }));
                    }}
                    errorMessage={errors?.errors?.kabel_odc_id}
                >
                    <option value="">{t('Pilih Kabel')}</option>
                    {kabelOdcs.map(k => (
                        <option key={k.id} value={k.id}>{k.nama_kabel}</option>
                    ))}
                </SelectField>
            </Element>

            {/* Separator */}
            <div className="px-5 sm:px-6">
                <div className="h-px bg-gray-200" />
            </div>

            {/* Section: Connection Type */}
            <div className="px-5 sm:px-6 py-3">
                <div className="text-sm md:text-base font-semibold text-gray-700">{t('CONNECTION TYPE & DETAILS')}</div>
                <div className="text-xs text-gray-500 mt-1">
                    {t('Choose the type of connection this joint box will facilitate. Then configure the specific connection details based on your selection.')}
                </div>
            </div>

            {/* Connection Type Selection */}
            <Element leftSide={t('Connection Type')}>
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

            {/* Checkboxes that appear based on radio selection */}
            {selectedConnectionType === 'odc-odc' && (
                <Element leftSide={t('Create ODC → ODC Connection')}>
                    <Checkbox
                        checked={showOdcToOdcFields}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleOdcToOdcCheckbox(e.target.checked)}
                    />
                </Element>
            )}

            {selectedConnectionType === 'odc-odp' && (
                <Element leftSide={t('Create ODC → ODP Connection')}>
                    <Checkbox
                        checked={showOdcToOdpFields}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleOdcToOdpCheckbox(e.target.checked)}
                    />
                </Element>
            )}

            {/* ODC→ODC Fields */}
            {showOdcToOdcFields && (
                <>
                    <Element leftSide={t('Source ODC')} required>
                        <SelectField
                            required
                            value={form.odc_id || ''}
                            onValueChange={v => {
                                handleChange('odc_id', v);
                                // Reset dependent selections when source ODC changes
                                setForm(f => ({ ...f, odp_id: '', odc_2_id: '' }));
                            }}
                            errorMessage={errors?.errors?.odc_id}
                        >
                            <option value="">{t('Pilih ODC Sumber')}</option>
                            {filteredOdcs.map(o => (
                                <option key={o.id} value={o.id}>
                                    {o.nama_odc}{o.lokasi_name ? ` - ${o.lokasi_name}` : ''}
                                </option>
                            ))}
                        </SelectField>
                    </Element>
                    <Element leftSide={t('Target ODC')} required>
                        <SelectField
                            required
                            value={form.odc_2_id}
                            onValueChange={v => handleChange('odc_2_id', v)}
                            errorMessage={errors?.errors?.odc_2_id}
                        >
                            <option value="">{t('Pilih ODC Target')}</option>
                            {filteredOdcs.filter(odc => odc.id !== form.odc_id).map(o => (
                                <option key={o.id} value={o.id}>
                                    {o.nama_odc}{o.lokasi_name ? ` - ${o.lokasi_name}` : ''}
                                </option>
                            ))}
                        </SelectField>
                    </Element>
                </>
            )}

            {/* ODC→ODP Fields */}
            {showOdcToOdpFields && (
                <>
                    <Element leftSide={t('Source ODC')} required>
                        <SelectField
                            required
                            value={form.odc_id || ''}
                            onValueChange={v => {
                                handleChange('odc_id', v);
                                // Reset dependent selections when source ODC changes
                                setForm(f => ({ ...f, odp_id: '', odc_2_id: '' }));
                            }}
                            errorMessage={errors?.errors?.odc_id}
                        >
                            <option value="">{t('Pilih ODC Sumber')}</option>
                            {filteredOdcs.map(o => (
                                <option key={o.id} value={o.id}>
                                    {o.nama_odc}{o.lokasi_name ? ` - ${o.lokasi_name}` : ''}
                                </option>
                            ))}
                        </SelectField>
                    </Element>
                    <Element leftSide={t('Target ODP')} required>
                        <SelectField
                            required
                            value={form.odp_id}
                            onValueChange={v => handleChange('odp_id', v)}
                            errorMessage={errors?.errors?.odp_id}
                        >
                            <option value="">{t('Pilih ODP Target')}</option>
                            {filteredOdps.map(o => (
                                <option key={o.id} value={o.id}>
                                    {o.nama_odp}{o.lokasi_name ? ` - ${o.lokasi_name}` : ''}
                                </option>
                            ))}
                        </SelectField>
                    </Element>
                </>
            )}

            {/* Visual feedback for connection types */}
            {(showOdcToOdcFields || showOdcToOdpFields) && (
                <div className="px-5 sm:px-6 py-3">
                    <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
                        <div className="text-sm text-blue-800">
                            <strong>{t('Active Connections')}:</strong>
                            {showOdcToOdcFields && <div>• {t('ODC → ODC')}</div>}
                            {showOdcToOdpFields && <div>• {t('ODC → ODP')}</div>}
                        </div>
                    </div>
                </div>
            )}
            {/* Status field removed for consistency with other FO modules */}
        </Card>
    );
}
