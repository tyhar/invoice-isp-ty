// client/src/pages/fo-kabel-odcs/edit/Edit.tsx
import React, { FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTitle } from '$app/common/hooks/useTitle';
import { Default } from '$app/components/layouts/Default';
import { Container } from '$app/components/Container';
import { Spinner } from '$app/components/Spinner';
import { toast } from '$app/common/helpers/toast/toast';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
import { useNavigate, useParams } from 'react-router-dom';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { CreateFoKabelOdc } from '../common/components/CreateFoKabelOdc';

interface FoKabelOdcEdit {
    nama_kabel: string;
    tipe_kabel: 'singlecore' | 'multicore';
    panjang_kabel: number;
    tube_colors: string[];
    jumlah_core_in_tube: number;
}

interface OdcOption {
    id: number;
    nama_odc: string;
}

export default function Edit() {
    const [t] = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    useTitle('edit_kabel_odc');

    const [form, setForm] = useState<FoKabelOdcEdit>({
        nama_kabel: '',
        tipe_kabel: 'singlecore',
        panjang_kabel: 0,
        tube_colors: [],
        jumlah_core_in_tube: 1,
    });
    const [odcs, setOdcs] = useState<OdcOption[]>([]);
    const [errors, setErrors] = useState<ValidationBag>();
    const [isBusy, setIsBusy] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            setLoadError('Invalid Kabel ODC ID.');
            setLoading(false);
            return;
        }
        setLoading(true);
        setLoadError(null);
        Promise.all([
            request('GET', endpoint(`/api/v1/fo-kabel-odcs/${id}`)),
            request('GET', endpoint('/api/v1/fo-odcs')),
        ])
            .then(([resKabel, resOdc]: any) => {
                const kabel = resKabel.data.data;
                setForm({
                    nama_kabel: kabel.nama_kabel,
                    tipe_kabel: kabel.tipe_kabel,
                    panjang_kabel: kabel.panjang_kabel,
                    tube_colors: (kabel.tube_colors || []).map((t: any) => t.warna_tube),
                    jumlah_core_in_tube: kabel.jumlah_core_in_tube,
                });
                setOdcs(
                    resOdc.data.data.map((o: any) => ({
                        id: o.id,
                        nama_odc: o.nama_odc,
                    }))
                );
            })
            .catch(() => {
                setLoadError('Failed to load Kabel ODC data.');
            })
            .finally(() => setLoading(false));
    }, [id, navigate]);

    if (loading) {
        return <Spinner />;
    }
    if (loadError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[300px] text-red-600">
                <div className="text-lg font-semibold mb-2">{loadError}</div>
                <button
                    className="px-4 py-2 bg-blue-600 text-white rounded shadow mt-2"
                    onClick={() => navigate('/fo-kabel-odcs')}
                >
                    {t('Back to Kabel ODC List')}
                </button>
            </div>
        );
    }

    const handleSave = (e: FormEvent) => {
        e.preventDefault();
        if (isBusy) return;
        setIsBusy(true);
        request('PUT', endpoint(`/api/v1/fo-kabel-odcs/${id}`), {
            ...form,
            tube_colors: form.tube_colors,
        })
            .then(() => {
                toast.success('updated kabel odc');
                navigate('/fo-kabel-odcs');
            })
            .catch((err) => {
                setErrors(err.response?.data);
            })
            .finally(() => setIsBusy(false));
    };

    const pages = [
        { name: t('FO Kabel ODC')!, href: '/fo-kabel-odcs' },
<<<<<<< Updated upstream
        { name: t('edit_kabel_odc')!, href: `/fo-kabel-odcs/${id}/edit` },
=======
        { name: t('Edit Kabel ODC')!, href: `/fo-kabel-odcs/${id}/edit` },
>>>>>>> Stashed changes
    ];

    return (
        <Default
<<<<<<< Updated upstream
            title={t('edit_kabel_odc')!}
=======
            title={t('Edit Kabel ODC')!}
>>>>>>> Stashed changes
            breadcrumbs={pages}
            disableSaveButton={isBusy}
            onSaveClick={handleSave}
        >
            <Container breadcrumbs={[]}>
                <form onSubmit={handleSave}>
                    <CreateFoKabelOdc
                        form={form}
                        setForm={setForm as any}
                        errors={errors}
                        odcs={odcs}
                        mode="edit"
                    />
                </form>
                {isBusy && <Spinner />}
            </Container>
        </Default>
    );
}
