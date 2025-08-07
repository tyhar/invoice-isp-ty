// client/src/pages/fo-odcs/create/Create.tsx

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

export default function Create() {
    useTitle('New FO ODC');
    const [t] = useTranslation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const pages = [
        { name: t('FO ODC')!, href: '/fo-odcs' },
        { name: t('New FO ODC')!, href: '/fo-odcs/create' },
    ];

    const initialValues: FoOdcFormValues = {
        create_new_lokasi: false,
        lokasi_id: '',
        lokasi_name: '',
        lokasi_deskripsi: '',
        lokasi_latitude: '',
        lokasi_longitude: '',
        kabel_odc_id: '', // <-- add this
        nama_odc: '',
        deskripsi: '',
        tipe_splitter: '1:8',
    };

    const [values, setValues] = useState<FoOdcFormValues>(initialValues);
    const [lokasis, setLokasis] = useState<LokasiOption[]>([]);
    const [kabelOdcs, setKabelOdcs] = useState<KabelOdcOption[]>([]);
    const [errors, setErrors] = useState<ValidationBag>();
    const [isBusy, setIsBusy] = useState(false);

    // Fetch Lokasi list
    useEffect(() => {
        request('GET', endpoint('/api/v1/fo-lokasis'))
            .then((res: any) => {
                setLokasis(
                    res.data.data.map((l: any) => ({
                        id: l.id,
                        nama_lokasi: l.nama_lokasi,
                    }))
                );
            })
            .catch(() => {
                toast.error('error refresh page');
            });
        request('GET', endpoint('/api/v1/fo-kabel-odcs'))
            .then((res: any) => {
                setKabelOdcs(
                    res.data.data.map((k: any) => ({
                        id: k.id,
                        nama_kabel: k.nama_kabel,
                    }))
                );
            })
            .catch(() => {
                toast.error('error refresh page');
            });
    }, []);

    const postOdc = (lokasi_id: number) => {
        request('POST', endpoint('/api/v1/fo-odcs'), {
            lokasi_id,
            kabel_odc_id: values.kabel_odc_id,
            nama_odc: values.nama_odc,
            deskripsi: values.deskripsi,
            tipe_splitter: values.tipe_splitter,
        })
            .then(() => {
                toast.success('created odc');

                // Invalidate related queries
                queryClient.invalidateQueries(['/api/v1/fo-odcs']);
                queryClient.invalidateQueries(['fo-odcs']);
                queryClient.invalidateQueries(['/api/v1/fo-lokasis']);

                navigate('/fo-odcs');
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

    const handleSave = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isBusy) return;
        setIsBusy(true);
        toast.processing();

        if (values.create_new_lokasi) {
            request('POST', endpoint('/api/v1/fo-lokasis'), {
                nama_lokasi: values.lokasi_name,
                deskripsi: values.lokasi_deskripsi,
                latitude: parseFloat(values.lokasi_latitude),
                longitude: parseFloat(values.lokasi_longitude),
            })
                .then((res: GenericSingleResourceResponse<any>) =>
                    postOdc(res.data.data.id)
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
            postOdc(parseInt(values.lokasi_id, 10));
        }
    };

    return (
        <Default
            title={t('New FO ODC')}
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
                        errors={errors}
                    />
                </form>
                {isBusy && <Spinner />}
            </Container>
        </Default>
    );
}
