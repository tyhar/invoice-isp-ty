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
import { CreateFoJointBox } from '../common/components/CreateFoJointBox';
import { useQueryClient } from 'react-query';

interface FoJointBoxForm {
    create_new_lokasi: boolean;
    lokasi_id: string;
    lokasi_name: string;
    lokasi_deskripsi: string;
    lokasi_latitude: string;
    lokasi_longitude: string;
    kabel_odc_id: string;
    nama_joint_box: string;
    status: 'active' | 'archived';
}

interface LokasiOption {
    id: string;
    nama_lokasi: string;
}

interface KabelOdcOption {
    id: string;
    nama_kabel: string;
}

export default function Edit() {
    const [t] = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    useTitle('Edit FO Joint Box');

    const [form, setForm] = useState<(Omit<FoJointBoxForm, 'status'> & { status: 'active' | 'archived' }) | null>(null);
    const [errors, setErrors] = useState<ValidationBag>();
    const [isBusy, setIsBusy] = useState(false);
    const [lokasis, setLokasis] = useState<LokasiOption[]>([]);
    const [kabelOdcs, setKabelOdcs] = useState<KabelOdcOption[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch existing record and options
    useEffect(() => {
        setLoading(true);
        Promise.all([
            request('GET', endpoint(`/api/v1/fo-joint-boxes/${id}`)),
            request('GET', endpoint('/api/v1/fo-lokasis')),
            request('GET', endpoint('/api/v1/fo-kabel-odcs')),
        ])
            .then(([res, lokRes, kabelRes]: any) => {
                const data = res.data.data;
                // Always set as string
                const lokasi_id = data.lokasi?.id ? String(data.lokasi.id) : '';
                const kabel_odc_id = data.kabel_odc?.id ? String(data.kabel_odc.id) : '';
                setForm({
                    create_new_lokasi: false, // always false in edit
                    lokasi_id,
                    lokasi_name: '',
                    lokasi_deskripsi: '',
                    lokasi_latitude: '',
                    lokasi_longitude: '',
                    kabel_odc_id,
                    nama_joint_box: data.nama_joint_box || '',
                    deskripsi: data.deskripsi || '',
                    status: data.status || 'active', // keep for backend, not for UI
                });
                // If current relation is not in options, add it
                let lokasisArr = (lokRes.data.data as any[]).map((l: any) => ({ id: String(l.id), nama_lokasi: l.nama_lokasi }));
                if (lokasi_id && !lokasisArr.some((l: any) => l.id === lokasi_id) && data.lokasi) {
                    lokasisArr = [{ id: lokasi_id, nama_lokasi: data.lokasi.nama_lokasi }, ...lokasisArr];
                }
                setLokasis(lokasisArr);
                let kabelArr = (kabelRes.data.data as any[]).map((k: any) => ({ id: String(k.id), nama_kabel: k.nama_kabel }));
                if (kabel_odc_id && !kabelArr.some((k: any) => k.id === kabel_odc_id) && data.kabel_odc) {
                    kabelArr = [{ id: kabel_odc_id, nama_kabel: data.kabel_odc.nama_kabel }, ...kabelArr];
                }
                setKabelOdcs(kabelArr);
            })
            .catch(() => {
                toast.error('error refresh page');
                navigate('/fo-joint-boxes');
            })
            .finally(() => setLoading(false));
    }, [id, navigate]);

    const handleSave = (event: FormEvent) => {
        event.preventDefault();
        if (!form || isBusy) return;
        setIsBusy(true);
        toast.processing();
        request('PUT', endpoint(`/api/v1/fo-joint-boxes/${id}`), {
            lokasi_id: form.lokasi_id,
            kabel_odc_id: form.kabel_odc_id,
            nama_joint_box: form.nama_joint_box,
            deskripsi: form.deskripsi,
            status: form.status, // send as loaded, not editable
        })
            .then(() => {
                toast.success('updated joint box');
                queryClient.invalidateQueries(['/api/v1/fo-joint-boxes']);
                queryClient.invalidateQueries(['fo-joint-boxes']);
                queryClient.invalidateQueries(['/api/v1/fo-lokasis']);
                navigate('/fo-joint-boxes');
            })
            .catch((error) => {
                if (error.response?.status === 422) {
                    setErrors(error.response.data);
                    toast.dismiss();
                } else {
                    toast.error('error refresh page');
                }
            })
            .finally(() => setIsBusy(false));
    };

    if (loading || !form) {
        return <Spinner />;
    }

    // Omit status when passing to CreateFoJointBox
    const formWithoutStatus = { ...form };
    delete (formWithoutStatus as any).status;

    const pages = [
        { name: t('FO Joint Box')!, href: '/fo-joint-boxes' },
        { name: t('Edit FO Joint Box')!, href: `/fo-joint-boxes/${id}/edit` },
    ];

    return (
        <Default
            title={t('Edit FO Joint Box')!}
            breadcrumbs={pages}
            disableSaveButton={isBusy}
            onSaveClick={handleSave}
        >
            <Container breadcrumbs={[]}>
                <form onSubmit={handleSave}>
                    <CreateFoJointBox
                        form={formWithoutStatus}
                        setForm={(updater) => {
                            setForm((prev) => {
                                if (!prev) return prev;
                                const prevWithoutStatus = { ...prev };
                                delete (prevWithoutStatus as any).status;
                                const updated = typeof updater === 'function' ? updater(prevWithoutStatus) : updater;
                                return { ...updated, status: prev.status };
                            });
                        }}
                        errors={errors}
                        setErrors={setErrors}
                        lokasis={lokasis}
                        kabelOdcs={kabelOdcs}
                    />
                </form>
                {isBusy && <Spinner />}
            </Container>
        </Default>
    );
}
