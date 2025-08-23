// client/src/pages/fo-kabel-odcs/create/Create.tsx
import React, { FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTitle } from '$app/common/hooks/useTitle';
import { Default } from '$app/components/layouts/Default';
import { Container } from '$app/components/Container';
import { Spinner } from '$app/components/Spinner';
import { toast } from '$app/common/helpers/toast/toast';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
import { useNavigate } from 'react-router-dom';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { CreateFoKabelOdc } from '../common/components/CreateFoKabelOdc';
import { useQueryClient } from 'react-query';

interface FoKabelOdcCreate {
    nama_kabel: string;
    deskripsi: string;
    tipe_kabel: 'singlecore' | 'multicore';
    panjang_kabel: number;
    tube_colors: string[];
    jumlah_core_in_tube: number;
    core_colors: string[]; // new field for core colors
}

interface OdcOption {
    id: number;
    nama_odc: string;
}

export default function Create() {
    useTitle('New Kabel');
    const [t] = useTranslation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const pages = [
        { name: t('Kabel')!, href: '/fo-kabel-odcs' },
        { name: t('New Kabel')!, href: '/fo-kabel-odcs/create' },
    ];

    const [form, setForm] = useState<FoKabelOdcCreate>({
        nama_kabel: '',
        deskripsi: '',
        tipe_kabel: 'singlecore',
        panjang_kabel: 0,
        tube_colors: [],
        jumlah_core_in_tube: 1,
        core_colors: [], // initialize empty array
    });
    const [odcs, setOdcs] = useState<OdcOption[]>([]);
    const [errors, setErrors] = useState<ValidationBag>();
    const [isBusy, setIsBusy] = useState(false);

    useEffect(() => {
        request('GET', endpoint('/api/v1/fo-odcs')).then((res) => {
            setOdcs(
                res.data.data.map((o: any) => ({
                    id: o.id,
                    nama_odc: o.nama_odc,
                }))
            );
        });
    }, []);

    const handleSave = (e: FormEvent) => {
        e.preventDefault();
        if (isBusy) return;
        setIsBusy(true);

        // Create the Kabel first
        const kabelData = {
            nama_kabel: form.nama_kabel,
            deskripsi: form.deskripsi,
            tipe_kabel: form.tipe_kabel,
            panjang_kabel: form.panjang_kabel,
            jumlah_core_in_tube: form.jumlah_core_in_tube,
            tube_colors: form.tube_colors,
        };

        request('POST', endpoint('/api/v1/fo-kabel-odcs'), kabelData)
            .then(async (kabelResponse) => {
                // Get the created tubes from the response
                const createdTubes = kabelResponse.data.data.tube_colors || [];

                // Update tube descriptions with automatic deskripsi
                if (createdTubes.length > 0) {
                    const colorCounts: { [key: string]: number } = {};
                    const tubeUpdatePromises = createdTubes.map((tube: any) => {
                        // Count occurrences of this color
                        colorCounts[tube.warna_tube] = (colorCounts[tube.warna_tube] || 0) + 1;
                        const tubeDeskripsi = `Tube ${tube.warna_tube}(${colorCounts[tube.warna_tube]}) for cable ${form.nama_kabel}`;
                        return request('PUT', endpoint(`/api/v1/fo-kabel-tube-odcs/${tube.id}`), {
                            deskripsi: tubeDeskripsi,
                        });
                    });

                    await Promise.all(tubeUpdatePromises);

                    // Create cores for each tube if core batch creation is enabled
                    if (form.core_colors.length > 0) {
                        const coreCreatePromises: Promise<any>[] = [];

                        createdTubes.forEach((tube: any) => {
                            const tubeColorCounts: { [key: string]: number } = {};

                            form.core_colors.forEach((coreColor) => {
                                // Count occurrences of this core color
                                tubeColorCounts[coreColor] = (tubeColorCounts[coreColor] || 0) + 1;
                                const coreIndex = tubeColorCounts[coreColor];

                                const coreData = {
                                    kabel_tube_odc_id: tube.id,
                                    warna_core: coreColor,
                                    deskripsi: `Core ${coreColor}(${coreIndex}) for tube ${tube.warna_tube}(${colorCounts[tube.warna_tube]})`,
                                };

                                coreCreatePromises.push(
                                    request('POST', endpoint('/api/v1/fo-kabel-core-odcs'), coreData)
                                );
                            });
                        });

                        if (coreCreatePromises.length > 0) {
                            await Promise.all(coreCreatePromises);
                        }
                    }
                }

                toast.success('created kabel with tubes and cores');
                await queryClient.invalidateQueries('fo-kabel-odcs');
                await queryClient.invalidateQueries('fo-kabel-tube-odcs');
                await queryClient.invalidateQueries('fo-kabel-core-odcs');
                navigate('/fo-kabel-odcs');
            })
            .catch((err) => {
                setErrors(err.response?.data?.errors || {});
            })
            .finally(() => setIsBusy(false));
    };

    return (
        <Default
            title={t('New Kabel')}
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
                        mode="create"
                    />
                </form>
                {isBusy && <Spinner />}
            </Container>
        </Default>
    );
}
