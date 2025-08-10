// client/src/pages/fo-odcs/edit/Edit.tsx

import React, { FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTitle } from '$app/common/hooks/useTitle';
import { Default } from '$app/components/layouts/Default';
import { Container } from '$app/components/Container';
import { Spinner } from '$app/components/Spinner';
import { toast } from '$app/common/helpers/toast/toast';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
// import { route } from '$app/common/helpers/route';
import { useNavigate, useParams } from 'react-router-dom';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { CreateFoOdc, FoOdcFormValues } from '../common/components/CreateFoOdc';
import { useQueryClient } from 'react-query';

interface LokasiOption {
    id: number;
    nama_lokasi: string;
}

interface KabelOdcOption {
    id: number;
    nama_kabel: string;
}

interface OdcOption {
    id: number;
    nama_odc: string;
    lokasi_name?: string;
    kabel_odc_id?: number;
}

export default function Edit() {
    useTitle('Edit FO ODC');
    const [t] = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Default form values
    const initialValues: FoOdcFormValues = {
        create_new_lokasi: false,
        lokasi_id: '',
        lokasi_name: '',
        lokasi_deskripsi: '',
        lokasi_latitude: '',
        lokasi_longitude: '',
        kabel_odc_id: '',
        odc_id: '', // <-- add this for ODC-to-ODC connections
        nama_odc: '',
        deskripsi: '',
        tipe_splitter: '1:8',
    };

    const [values, setValues] = useState<FoOdcFormValues>(initialValues);
    const [lokasis, setLokasis] = useState<LokasiOption[]>([]);
    const [kabelOdcs, setKabelOdcs] = useState<KabelOdcOption[]>([]);
    const [odcs, setOdcs] = useState<OdcOption[]>([]);
    const [errors, setErrors] = useState<ValidationBag>();
    const [isBusy, setIsBusy] = useState(false);
    const [loading, setLoading] = useState(true);

    // Fetch existing ODC and Lokasi list
    useEffect(() => {
        Promise.all([
            request('GET', endpoint(`/api/v1/fo-odcs/${id}`)),
            request('GET', endpoint('/api/v1/fo-lokasis')),
            request('GET', endpoint('/api/v1/fo-kabel-odcs')),
            request('GET', endpoint('/api/v1/fo-odcs')),
        ])
            .then(([odcRes, lokRes, kabelOdcRes, odcsRes]: any) => {
                const odc = odcRes.data.data;
                setValues({
                    ...initialValues,
                    lokasi_id: odc.lokasi.id.toString(),
                    kabel_odc_id: odc.kabel_odc?.id?.toString() ?? '',
                    odc_id: odc.odc_id?.toString() ?? '',
                    nama_odc: odc.nama_odc,
                    deskripsi: odc.deskripsi ?? '',
                    tipe_splitter: odc.tipe_splitter,
                });
                setLokasis(
                    lokRes.data.data.map((l: any) => ({
                        id: l.id,
                        nama_lokasi: l.nama_lokasi,
                    }))
                );
                setKabelOdcs(
                    kabelOdcRes.data.data.map((k: any) => ({
                        id: k.id,
                        nama_kabel: k.nama_kabel,
                    }))
                );
                setOdcs(
                    odcsRes.data.data.map((o: any) => ({
                        id: o.id,
                        nama_odc: o.nama_odc,
                        lokasi_name: o.lokasi?.nama_lokasi,
                        kabel_odc_id: o.kabel_odc_id,
                    }))
                );
            })
            .catch(() => {
                toast.error('error refresh page');
                navigate('/fo-odcs');
            })
            .finally(() => setLoading(false));
    }, [id, navigate]);

    if (loading) {
        return <Spinner />;
    }

    const handleSave = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isBusy) return;
        setIsBusy(true);
        toast.processing();

        const doUpdate = (lokasi_id: number) => {
            request('PUT', endpoint(`/api/v1/fo-odcs/${id}`), {
                lokasi_id,
                kabel_odc_id: values.kabel_odc_id,
                odc_id: values.odc_id === '' ? null : values.odc_id, // Convert empty string to null for optional field
                nama_odc: values.nama_odc,
                deskripsi: values.deskripsi,
                tipe_splitter: values.tipe_splitter,
            })
                .then(() => {
                    toast.success('updated odc');

                    // Invalidate related queries
                    queryClient.invalidateQueries(['/api/v1/fo-odcs']);
                    queryClient.invalidateQueries(['/api/v1/fo-lokasis']);
                })
                .catch((err) => {
                    if (err.response?.status === 422) {
                        setErrors(err.response.data);
                        toast.dismiss();
                    } else {
                        toast.error('error refresh page');
                    }
                })
                .finally(() => setIsBusy(false));
        };

        if (values.create_new_lokasi) {
            request('POST', endpoint('/api/v1/fo-lokasis'), {
                nama_lokasi: values.lokasi_name,
                deskripsi: values.lokasi_deskripsi,
                latitude: parseFloat(values.lokasi_latitude),
                longitude: parseFloat(values.lokasi_longitude),
            })
                .then((res: GenericSingleResourceResponse<any>) =>
                    doUpdate(res.data.data.id)
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
            doUpdate(parseInt(values.lokasi_id, 10));
        }
    };

    const pages = [
        { name: t('FO ODC')!, href: '/fo-odcs' },
        { name: t('Edit ODC')!, href: `/fo-odcs/${id}/edit` },
    ];

    return (
        <Default
            title={t('Edit ODC')!}
            breadcrumbs={pages}
            disableSaveButton={isBusy}
            onSaveClick={handleSave}
        >
            <Container breadcrumbs={[]}>
                <form onSubmit={handleSave}>
                    <CreateFoOdc
                        values={values}
                        setValues={setValues}
                        lokasis={lokasis}
                        kabelOdcs={kabelOdcs}
                        odcs={odcs}
                        errors={errors}
                    />
                </form>
                {isBusy && <Spinner />}
            </Container>
        </Default>
    );
}
