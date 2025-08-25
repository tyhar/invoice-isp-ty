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
import { useQueryClient } from 'react-query';

interface FoKabelOdcEdit {
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

export default function Edit() {
    const [t] = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    useTitle('edit_kabel');

    const [form, setForm] = useState<FoKabelOdcEdit>({
        nama_kabel: '',
        deskripsi: '',
        tipe_kabel: 'singlecore',
        panjang_kabel: 0,
        tube_colors: [],
        jumlah_core_in_tube: 1,
        core_colors: [], // initialize empty array
    });
    const [existingTubes, setExistingTubes] = useState<Array<{
        id: number;
        warna_tube: string;
        deskripsi?: string;
        cores: Array<{
            id: number;
            warna_core: string;
            deskripsi?: string;
            kabel_tube_odc_id: number;
        }>;
    }>>([]);
    const [odcs, setOdcs] = useState<OdcOption[]>([]);
    const [errors, setErrors] = useState<ValidationBag>();
    const [isBusy, setIsBusy] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            setLoadError('Invalid Kabel ID.');
            setLoading(false);
            return;
        }
        setLoading(true);
        setLoadError(null);
        Promise.all([
            request('GET', endpoint(`/api/v1/fo-kabel-odcs/${id}`)),
            request('GET', endpoint('/api/v1/fo-odcs?per_page=250&status=active')),
            request('GET', endpoint(`/api/v1/fo-kabel-core-odcs?per_page=250&status=active`)),
            request('GET', endpoint(`/api/v1/fo-kabel-tube-odcs?per_page=250&status=active`)),
        ])
            .then(([resKabel, resOdc, resCores, resTubes]: any) => {
                const kabel = resKabel.data.data;
                const existingCores = resCores.data.data.filter((core: any) => {
                    // Check if this core belongs to any tube of this kabel
                    return kabel.tube_colors.some((tube: any) => tube.id === core.kabel_tube_odc_id);
                });
                const existingTubesData = resTubes.data.data.filter((tube: any) =>
                    tube.kabel_odc_id === kabel.id
                );

                // Organize cores by tube
                const tubesWithCores = existingTubesData.map((tube: any) => ({
                    id: tube.id,
                    warna_tube: tube.warna_tube,
                    deskripsi: tube.deskripsi,
                    cores: existingCores.filter((core: any) => core.kabel_tube_odc_id === tube.id)
                }));

                setExistingTubes(tubesWithCores);
                setForm({
                    nama_kabel: kabel.nama_kabel,
                    deskripsi: kabel.deskripsi ?? '',
                    tipe_kabel: kabel.tipe_kabel,
                    panjang_kabel: kabel.panjang_kabel,
                    tube_colors: (kabel.tube_colors || []).map(
                        (t: any) => t.warna_tube
                    ),
                    jumlah_core_in_tube: kabel.jumlah_core_in_tube,
                    core_colors: [...new Set(existingCores.map((core: any) => core.warna_core))] as string[], // FIX: Use unique core colors only
                });
                setOdcs(
                    resOdc.data.data.map((o: any) => ({
                        id: o.id,
                        nama_odc: o.nama_odc,
                    }))
                );
            })
            .catch(() => {
                setLoadError('Failed to load Kabel data.');
            })
            .finally(() => setLoading(false));
    }, [id, navigate]);

    if (loading) {
        return <Spinner />;
    }
    if (loadError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[300px] text-red-600">
                <div className="mb-2 text-lg font-semibold">{loadError}</div>
                <button
                    className="px-4 py-2 mt-2 text-white bg-blue-600 rounded shadow"
                    onClick={() => navigate('/fo-kabel-odcs')}
                >
                    {t('Back to Kabel List')}
                </button>
            </div>
        );
    }

    const handleCoreDelete = async (coreId: number) => {
        try {
            await request('DELETE', endpoint(`/api/v1/fo-kabel-core-odcs/${coreId}`));
            // Refresh the data after deletion
            window.location.reload();
        } catch (error) {
            toast.error('Failed to delete core');
        }
    };

    const handleCoreAdd = async (tubeId: number, warnaCore: string) => {
        try {
            const coreData = {
                kabel_tube_odc_id: tubeId,
                warna_core: warnaCore,
                deskripsi: `Core ${warnaCore} for tube ${tubeId}`,
                status: 'active'
            };

            await request('POST', endpoint('/api/v1/fo-kabel-core-odcs'), coreData);
            // Refresh the data after addition
            window.location.reload();
        } catch (error) {
            toast.error('Failed to add core');
        }
    };

    const handleSave = (e: FormEvent) => {
        e.preventDefault();
        if (isBusy || !id) return;

        setIsBusy(true);
        toast.processing();

        // Update the Kabel first
        const kabelData = {
            nama_kabel: form.nama_kabel,
            deskripsi: form.deskripsi,
            tipe_kabel: form.tipe_kabel,
            panjang_kabel: form.panjang_kabel,
            jumlah_core_in_tube: form.jumlah_core_in_tube,
            tube_colors: form.tube_colors,
        };

        request('PUT', endpoint(`/api/v1/fo-kabel-odcs/${id}`), kabelData)
            .then(async (kabelResponse) => {
                // Get the updated tubes from the response
                const updatedTubes = kabelResponse.data.data.tube_colors || [];

                // Update tube descriptions with automatic deskripsi
                if (updatedTubes.length > 0) {
                    const colorCounts: { [key: string]: number } = {};
                    const tubeUpdatePromises = updatedTubes.map((tube: any) => {
                        // Count occurrences of this color
                        colorCounts[tube.warna_tube] = (colorCounts[tube.warna_tube] || 0) + 1;
                        const tubeDeskripsi = `Tube ${tube.warna_tube}(${colorCounts[tube.warna_tube]}) for cable ${form.nama_kabel}`;
                        return request('PUT', endpoint(`/api/v1/fo-kabel-tube-odcs/${tube.id}`), {
                            deskripsi: tubeDeskripsi,
                        });
                    });

                    await Promise.all(tubeUpdatePromises);

                    // Handle core batch creation/updates if enabled
                    if (form.core_colors.length > 0) {
                        // Get existing cores for all tubes of this kabel
                        const existingCoresResponse = await request('GET', endpoint(`/api/v1/fo-kabel-core-odcs?filter=&status=active`));
                        const allCores = existingCoresResponse.data.data;
                        const existingCores = allCores.filter((core: any) => {
                            return updatedTubes.some((tube: any) => tube.id === core.kabel_tube_odc_id);
                        });

                        // Calculate which cores to delete and which to create
                        const coresToDelete = existingCores.filter((core: any) =>
                            !form.core_colors.includes(core.warna_core)
                        );
                        const coresToCreate: any[] = [];

                        updatedTubes.forEach((tube: any) => {
                            const existingCoresForTube = existingCores.filter((core: any) =>
                                core.kabel_tube_odc_id === tube.id
                            );
                            const existingCoreColorsForTube = existingCoresForTube.map((core: any) => core.warna_core);

                            form.core_colors.forEach((coreColor) => {
                                if (!existingCoreColorsForTube.includes(coreColor)) {
                                    // Count how many cores of this color already exist for this tube
                                    const existingCount = existingCoresForTube.filter((core: any) =>
                                        core.warna_core === coreColor
                                    ).length;
                                    const newCount = existingCount + 1;

                                    coresToCreate.push({
                                        kabel_tube_odc_id: tube.id,
                                        warna_core: coreColor,
                                        deskripsi: `Core ${coreColor}(${newCount}) for tube ${tube.warna_tube}(${colorCounts[tube.warna_tube]})`,
                                    });
                                }
                            });
                        });

                        // Delete cores that are no longer needed
                        const deletePromises = coresToDelete.map((core: any) =>
                            request('DELETE', endpoint(`/api/v1/fo-kabel-core-odcs/${core.id}`))
                        );

                        // Create new cores
                        const createPromises = coresToCreate.map((coreData) =>
                            request('POST', endpoint('/api/v1/fo-kabel-core-odcs'), coreData)
                        );

                        await Promise.all([...deletePromises, ...createPromises]);
                    }
                }

                toast.success('updated kabel with tubes and cores');
                queryClient.invalidateQueries('fo-kabel-odcs');
                queryClient.invalidateQueries('fo-kabel-tube-odcs');
                queryClient.invalidateQueries('fo-kabel-core-odcs');
                navigate('/fo-kabel-odcs');
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
        { name: t('Kabel')!, href: '/fo-kabel-odcs' },
        { name: t('Edit Kabel')!, href: `/fo-kabel-odcs/${id}/edit` },
    ];

    return (
        <Default
            title={t('Edit Kabel')!}
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
                        existingTubes={existingTubes}
                        onCoreDelete={handleCoreDelete}
                        onCoreAdd={handleCoreAdd}
                    />
                </form>
                {isBusy && <Spinner />}
            </Container>
        </Default>
    );
}
