// client/src/pages/fo-kabel-core-odcs/create/Create.tsx
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
import { CreateFoKabelCoreOdc } from '../common/components/CreateFoKabelCoreOdc';
import { useQueryClient } from 'react-query';

interface FoKabelCoreOdcCreate {
    kabel_tube_odc_id: number;
    deskripsi: string;
    warna_core: string;
}

interface TubeOdcOption {
    id: number;
    warna_tube: string;
    kabel_odc_id: number;
    nama_kabel: string;
    deskripsi?: string;
}

export default function Create() {
    useTitle('New Core Kabel');
    const [t] = useTranslation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const pages = [
        { name: t('Core Kabel')!, href: '/fo-kabel-core-odcs' },
        {
            name: t('New Core Kabel')!,
            href: '/fo-kabel-core-odcs/create',
        },
    ];

    const [form, setForm] = useState<FoKabelCoreOdcCreate>({
        kabel_tube_odc_id: 0,
        deskripsi: '',
        warna_core: '',
    });
    const [tubes, setTubes] = useState<TubeOdcOption[]>([]);
    const [errors, setErrors] = useState<ValidationBag>();
    const [isBusy, setIsBusy] = useState(false);
    const [tubesLoading, setTubesLoading] = useState(true);

    useEffect(() => {
        request('GET', endpoint('/api/v1/fo-kabel-tube-odcs?per_page=250&status=active')).then(
            (res: any) => {
                setTubes(
                    res.data.data.map((o: any) => ({
                        id: o.id,
                        warna_tube: o.warna_tube,
                        kabel_odc_id: o.kabel_odc.id,
                        nama_kabel: o.kabel_odc.nama_kabel,
                        deskripsi: o.deskripsi,
                    }))
                );
                setTubesLoading(false);
            }
        ).catch(() => setTubesLoading(false));
    }, []);

    const handleSave = (e: FormEvent) => {
        e.preventDefault();
        if (isBusy) return;
        setIsBusy(true);

        request('POST', endpoint('/api/v1/fo-kabel-core-odcs'), form)
            .then(() => {
                toast.success('created core odc');
                navigate('/fo-kabel-core-odcs');
                queryClient.invalidateQueries('fo-kabel-core-odcs');
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

    return (
        <Default
            title={t('New Core Kabel')}
            breadcrumbs={pages}
            disableSaveButton={isBusy}
            onSaveClick={handleSave}
        >
            <Container breadcrumbs={[]}>
                <form onSubmit={handleSave}>
                    <CreateFoKabelCoreOdc
                        form={form}
                        setForm={setForm}
                        errors={errors}
                        tubes={tubes}
                        tubesLoading={tubesLoading}
                    />
                </form>
                {isBusy && <Spinner />}
            </Container>
        </Default>
    );
}
