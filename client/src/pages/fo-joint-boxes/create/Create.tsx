import React, { FormEvent, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTitle } from '$app/common/hooks/useTitle';
import { Default } from '$app/components/layouts/Default';
import { Container } from '$app/components/Container';
import { Spinner } from '$app/components/Spinner';
import { toast } from '$app/common/helpers/toast/toast';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { useNavigate } from 'react-router-dom';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
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

export default function Create() {
    useTitle('New FO Joint Box');
    const [t] = useTranslation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const pages = [
        { name: t('FO Joint Box')!, href: '/fo-joint-boxes' },
        { name: t('New FO Joint Box')!, href: '/fo-joint-boxes/create' },
    ];
    const [form, setForm] = useState<Omit<FoJointBoxForm, 'status'>>({
        create_new_lokasi: false,
        lokasi_id: '',
        lokasi_name: '',
        lokasi_deskripsi: '',
        lokasi_latitude: '',
        lokasi_longitude: '',
        kabel_odc_id: '',
        nama_joint_box: '',
        deskripsi: '',
    });
    const [errors, setErrors] = useState<ValidationBag>();
    const [isBusy, setIsBusy] = useState(false);
    const [lokasis, setLokasis] = useState<LokasiOption[]>([]);
    const [kabelOdcs, setKabelOdcs] = useState<KabelOdcOption[]>([]);

    useEffect(() => {
        request('GET', endpoint('/api/v1/fo-lokasis'))
            .then((res: any) => {
                setLokasis(res.data.data.map((l: any) => ({ id: String(l.id), nama_lokasi: l.nama_lokasi })));
            })
            .catch(() => toast.error('error refresh page'));
        request('GET', endpoint('/api/v1/fo-kabel-odcs'))
            .then((res: any) => {
                setKabelOdcs(res.data.data.map((k: any) => ({ id: String(k.id), nama_kabel: k.nama_kabel })));
            })
            .catch(() => toast.error('error refresh page'));
    }, []);

    const postJointBox = (lokasi_id: string) => {
        request('POST', endpoint('/api/v1/fo-joint-boxes'), {
            lokasi_id,
            kabel_odc_id: form.kabel_odc_id,
            nama_joint_box: form.nama_joint_box,
            deskripsi: form.deskripsi,
            status: 'active', // always set to active
        })
            .then(() => {
                toast.success('created joint box');
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

    const handleSave = (event: FormEvent) => {
        event.preventDefault();
        if (isBusy) return;
        setIsBusy(true);
        toast.processing();
        if (form.create_new_lokasi) {
            request('POST', endpoint('/api/v1/fo-lokasis'), {
                nama_lokasi: form.lokasi_name,
                deskripsi: form.lokasi_deskripsi,
                latitude: parseFloat(form.lokasi_latitude),
                longitude: parseFloat(form.lokasi_longitude),
            })
                .then((res: GenericSingleResourceResponse<any>) =>
                    postJointBox(String(res.data.data.id))
                )
                .catch((err) => {
                    if (err.response?.status === 422) {
                        setErrors(err.response.data);
                        toast.dismiss();
                    } else {
                        toast.error('error refresh page');
                    }
                });
        } else {
            postJointBox(form.lokasi_id);
        }
    };

    return (
        <Default
            title={t('New FO Joint Box')}
            breadcrumbs={pages}
            disableSaveButton={isBusy}
            onSaveClick={handleSave}
        >
            <Container breadcrumbs={[]}>
                <form onSubmit={handleSave}>
                    <CreateFoJointBox
                        form={form}
                        setForm={setForm}
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
