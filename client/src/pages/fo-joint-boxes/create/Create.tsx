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
import { CreateFoJointBox, FoJointBoxForm } from '../common/components/CreateFoJointBox';
import { useQueryClient } from 'react-query';



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
}

interface OdpOption {
    id: string;
    nama_odp: string;
    lokasi_name?: string;
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
    const [form, setForm] = useState<FoJointBoxForm>({
        create_new_lokasi: false,
        lokasi_id: '',
        lokasi_name: '',
        lokasi_deskripsi: '',
        lokasi_latitude: '',
        lokasi_longitude: '',
        kabel_odc_id: '',
        odc_id: '',
        odc_2_id: '',
        odp_id: '',
        nama_joint_box: '',
        deskripsi: '',
    });
    const [errors, setErrors] = useState<ValidationBag>();
    const [isBusy, setIsBusy] = useState(false);
    const [lokasis, setLokasis] = useState<LokasiOption[]>([]);
    const [kabelOdcs, setKabelOdcs] = useState<KabelOdcOption[]>([]);
    const [odcs, setOdcs] = useState<OdcOption[]>([]);
    const [odpss, setOdpss] = useState<OdpOption[]>([]);

    useEffect(() => {
        // Fetch all required options
        Promise.all([
            request('GET', endpoint('/api/v1/fo-lokasis')),
            request('GET', endpoint('/api/v1/fo-kabel-odcs')),
            request('GET', endpoint('/api/v1/fo-odcs')),
            request('GET', endpoint('/api/v1/fo-odps'))
        ])
        .then(([lokasiRes, kabelRes, odcRes, odpRes]: any[]) => {
            setLokasis(lokasiRes.data.data.map((l: any) => ({
                id: String(l.id),
                nama_lokasi: l.nama_lokasi
            })));
            setKabelOdcs(kabelRes.data.data.map((k: any) => ({
                id: String(k.id),
                nama_kabel: k.nama_kabel
            })));
            setOdcs(odcRes.data.data.map((o: any) => ({
                id: String(o.id),
                nama_odc: o.nama_odc,
                lokasi_name: o.lokasi?.nama_lokasi,
                kabel_odc_id: o.kabel_odc_id ? String(o.kabel_odc_id) : undefined,
            })));
            setOdpss(odpRes.data.data.map((p: any) => ({
                id: String(p.id),
                nama_odp: p.nama_odp,
                lokasi_name: p.lokasi?.nama_lokasi,
                odc_id: p.odc_id ? String(p.odc_id) : undefined,
            })));
        })
        .catch(() => toast.error('error refresh page'));
    }, []);

    const postJointBox = (lokasi_id: string) => {
        request('POST', endpoint('/api/v1/fo-joint-boxes'), {
            lokasi_id,
            kabel_odc_id: form.kabel_odc_id,
            odc_id: form.odc_id === '' ? null : form.odc_id, // Convert empty strings to null for optional fields
            odc_2_id: form.odc_2_id === '' ? null : form.odc_2_id,
            odp_id: form.odp_id === '' ? null : form.odp_id,
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
                        odcs={odcs}
                        odpss={odpss}
                    />
                </form>
                {isBusy && <Spinner />}
            </Container>
        </Default>
    );
}
