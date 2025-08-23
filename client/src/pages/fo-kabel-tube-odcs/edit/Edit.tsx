// client/src/pages/fo-kabel-tube-odcs/edit/Edit.tsx
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
import { CreateFoKabelTubeOdc } from '../common/components/CreateFoKabelTubeOdc';
import { useQueryClient } from 'react-query';

interface FoKabelTubeOdcForm {
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

export default function Edit() {
    const [t] = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    useTitle('Edit Tube Kabel');

    const [form, setForm] = useState<FoKabelTubeOdcForm>({
        kabel_odc_id: 0,
        deskripsi: '',
        warna_tube: '',
        core_colors: [], // initialize empty array
    });
    const [odcs, setOdcs] = useState<KabelOdcOption[]>([]);
    const [errors, setErrors] = useState<ValidationBag>();
    const [isBusy, setIsBusy] = useState(false);

    useEffect(() => {
        if (!id) {
            toast.error('Invalid tube ID');
            navigate('/fo-kabel-tube-odcs');
            return;
        }

        Promise.all([
            request('GET', endpoint(`/api/v1/fo-kabel-tube-odcs/${id}`)),
            request('GET', endpoint('/api/v1/fo-kabel-odcs?per_page=250')),
            request('GET', endpoint(`/api/v1/fo-kabel-core-odcs?filter=&status=active?per_page=250`)),
        ])
            .then(([resTube, resOdc, resCores]: any) => {
                const tubeData = resTube.data.data;
                const existingCores = resCores.data.data.filter((core: any) =>
                    core.kabel_tube_odc_id === parseInt(id)
                );

                setForm({
                    kabel_odc_id: tubeData.kabel_odc_id,
                    deskripsi: tubeData.deskripsi ?? '',
                    warna_tube: tubeData.warna_tube,
                    core_colors: existingCores.map((core: any) => core.warna_core), // populate with existing cores
                });
                setOdcs(
                    resOdc.data.data.map((o: any) => ({
                        id: o.id,
                        nama_kabel: o.nama_kabel,
                        jumlah_core_in_tube: o.jumlah_core_in_tube,
                    }))
                );
            })
            .catch(() => {
                toast.error('error refresh page');
                navigate('/fo-kabel-tube-odcs');
            });
    }, [id, navigate]);

    const handleSave = (e: FormEvent) => {
        e.preventDefault();
        if (isBusy || !id) return;

        // Client-side validation for maximum cores
        const selectedKabelOdc = odcs.find(o => o.id === form.kabel_odc_id);
        if (selectedKabelOdc?.jumlah_core_in_tube && form.core_colors.length > selectedKabelOdc.jumlah_core_in_tube) {
            toast.error(`Cannot create more than ${selectedKabelOdc.jumlah_core_in_tube} cores for this tube`);
            return;
        }

        setIsBusy(true);
        toast.processing();

        // Update the tube first
        const tubeData = {
            kabel_odc_id: form.kabel_odc_id,
            deskripsi: form.deskripsi,
            warna_tube: form.warna_tube,
        };

        request('PUT', endpoint(`/api/v1/fo-kabel-tube-odcs/${id}`), tubeData)
            .then(() => {
                // Get existing cores for this tube
                return request('GET', endpoint(`/api/v1/fo-kabel-core-odcs?filter=&status=active`));
            })
            .then((resCores: any) => {
                const existingCores = resCores.data.data.filter((core: any) =>
                    core.kabel_tube_odc_id === parseInt(id)
                );

                // Create frequency maps for comparison
                const existingColorCounts: { [key: string]: number } = {};
                const newColorCounts: { [key: string]: number } = {};

                // Count existing colors
                existingCores.forEach((core: any) => {
                    existingColorCounts[core.warna_core] = (existingColorCounts[core.warna_core] || 0) + 1;
                });

                // Count new colors
                form.core_colors.forEach(color => {
                    newColorCounts[color] = (newColorCounts[color] || 0) + 1;
                });

                // Find cores to delete (existing colors that are not in new selection or have fewer instances)
                const coresToDelete: any[] = [];
                existingCores.forEach((core: any) => {
                    const existingCount = existingColorCounts[core.warna_core];
                    const newCount = newColorCounts[core.warna_core] || 0;

                    if (newCount < existingCount) {
                        // We need to delete some instances of this color
                        const currentDeletedCount = coresToDelete.filter(c => c.warna_core === core.warna_core).length;
                        if (currentDeletedCount < (existingCount - newCount)) {
                            coresToDelete.push(core);
                        }
                    }
                });

                // Find colors to create (new colors that don't exist or have more instances)
                const coresToCreate: string[] = [];
                Object.keys(newColorCounts).forEach(color => {
                    const existingCount = existingColorCounts[color] || 0;
                    const newCount = newColorCounts[color];

                    if (newCount > existingCount) {
                        // We need to create more instances of this color
                        const additionalNeeded = newCount - existingCount;
                        for (let i = 0; i < additionalNeeded; i++) {
                            coresToCreate.push(color);
                        }
                    }
                });

                // Execute deletions
                const deletePromises = coresToDelete.map((core: any) =>
                    request('DELETE', endpoint(`/api/v1/fo-kabel-core-odcs/${core.id}`))
                );

                // Execute creations
                const colorCounts: { [key: string]: number } = {};
                const createPromises = coresToCreate.map((color) => {
                    // Count occurrences of this color in the new cores being created
                    colorCounts[color] = (colorCounts[color] || 0) + 1;

                    // Calculate the correct index for this color based on existing cores + new cores
                    const existingCoresOfThisColor = existingCores.filter((core: any) => core.warna_core === color).length;
                    const coreIndex = existingCoresOfThisColor + colorCounts[color];

                    return request('POST', endpoint('/api/v1/fo-kabel-core-odcs'), {
                        kabel_tube_odc_id: parseInt(id),
                        warna_core: color,
                        deskripsi: `Core ${color}(${coreIndex}) for tube ${form.warna_tube}`,
                    });
                });

                return Promise.all([...deletePromises, ...createPromises]);
            })
            .then(() => {
                toast.success('updated tube kabel with cores');
                queryClient.invalidateQueries('fo-kabel-tube-odcs');
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

    const pages = [
        { name: t('Tube Kabel')!, href: '/fo-kabel-tube-odcs' },
        { name: t('Edit Tube Kabel')!, href: `/fo-kabel-tube-odcs/${id}/edit` },
    ];

    if (!form.kabel_odc_id && !form.warna_tube) {
        return <Spinner />;
    }

    return (
        <Default
            title={t('Edit Tube Kabel')!}
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
                        mode="edit"
                    />
                </form>
                {isBusy && <Spinner />}
            </Container>
        </Default>
    );
}
