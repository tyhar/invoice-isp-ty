// client/src/pages/fo-kabel-tube-odcs/create/Create.tsx
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
import { CreateFoKabelTubeOdc } from '../common/components/CreateFoKabelTubeOdc';
import { useQueryClient } from 'react-query';

interface FoKabelTubeOdcCreate {
    kabel_odc_id: number;
    deskripsi: string;
    warna_tube: string;
    core_colors: string[]; // new field for core colors
}

interface KabelOdcOption {
    id: number;
    nama_kabel: string;
    jumlah_core_in_tube?: number;
}

export default function Create() {
    useTitle('New Tube Kabel');
    const [t] = useTranslation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const pages = [
        { name: t('Tube Kabel')!, href: '/fo-kabel-tube-odcs' },
        {
            name: t('New Tube Kabel')!,
            href: '/fo-kabel-tube-odcs/create',
        },
    ];

    const [form, setForm] = useState<FoKabelTubeOdcCreate>({
        kabel_odc_id: 0,
        deskripsi: '',
        warna_tube: '',
        core_colors: [], // initialize empty array
    });
    const [odcs, setOdcs] = useState<KabelOdcOption[]>([]);
    const [errors, setErrors] = useState<ValidationBag>();
    const [isBusy, setIsBusy] = useState(false);

    useEffect(() => {
        request('GET', endpoint('/api/v1/fo-kabel-odcs')).then((res) => {
            setOdcs(
                res.data.data.map((o: any) => ({
                    id: o.id,
                    nama_kabel: o.nama_kabel,
                    jumlah_core_in_tube: o.jumlah_core_in_tube,
                }))
            );
        });
    }, []);

    const handleSave = (e: FormEvent) => {
        e.preventDefault();
        if (isBusy) return;

        // Client-side validation for maximum cores
        const selectedKabelOdc = odcs.find(o => o.id === form.kabel_odc_id);
        if (selectedKabelOdc?.jumlah_core_in_tube && form.core_colors.length > selectedKabelOdc.jumlah_core_in_tube) {
            toast.error(`Cannot create more than ${selectedKabelOdc.jumlah_core_in_tube} cores for this tube`);
            return;
        }

        setIsBusy(true);

        // Create the tube first
        const tubeData = {
            kabel_odc_id: form.kabel_odc_id,
            deskripsi: form.deskripsi,
            warna_tube: form.warna_tube,
        };

        request('POST', endpoint('/api/v1/fo-kabel-tube-odcs'), tubeData)
            .then((tubeResponse) => {
                const tubeId = tubeResponse.data.data.id;

                // If core colors are selected, create cores
                if (form.core_colors.length > 0) {
                    const colorCounts: { [key: string]: number } = {};
                    const corePromises = form.core_colors.map((color) => {
                        // Count occurrences of this color
                        colorCounts[color] = (colorCounts[color] || 0) + 1;
                        return request('POST', endpoint('/api/v1/fo-kabel-core-odcs'), {
                            kabel_tube_odc_id: tubeId,
                            warna_core: color,
                            deskripsi: `Core ${color}(${colorCounts[color]}) for tube ${form.warna_tube}`,
                        });
                    });

                    return Promise.all(corePromises).then(() => {
                        toast.success('created tube odc with cores');
                        navigate('/fo-kabel-tube-odcs');
                        queryClient.invalidateQueries('fo-kabel-tube-odcs');
                        queryClient.invalidateQueries('fo-kabel-core-odcs');
                    });
                } else {
                    toast.success('created tube odc');
                    navigate('/fo-kabel-tube-odcs');
                    queryClient.invalidateQueries('fo-kabel-tube-odcs');
                }
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
            title={t('New Tube Kabel')}
            breadcrumbs={pages}
            disableSaveButton={isBusy}
            onSaveClick={handleSave}
        >
            <Container breadcrumbs={[]}>
                <form onSubmit={handleSave}>
                    <CreateFoKabelTubeOdc
                        form={form}
                        setForm={setForm}
                        errors={errors}
                        odcs={odcs}
                    />
                </form>
                {isBusy && <Spinner />}
            </Container>
        </Default>
    );
}
