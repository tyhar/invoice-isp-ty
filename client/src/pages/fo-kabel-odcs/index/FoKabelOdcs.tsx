// client/src/pages/fo-kabel-odcs/index/FoKabelOdcs.tsx

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTitle } from '$app/common/hooks/useTitle';
import { Page } from '$app/components/Breadcrumbs';
import { Default } from '$app/components/layouts/Default';
import { DataTable2, DataTableColumns } from '$app/components/DataTable2';
import { useFoKabelOdcActions } from '../common/hooks/useFoKabelOdcActions';
import { useFoKabelOdcBulkActions } from '../common/hooks/useFoKabelOdcBulkActions';

interface FoKabelOdc {
    id: string;
    nama_kabel: string;
    tipe_kabel: 'singlecore' | 'multicore';
    panjang_kabel: number;
    jumlah_tube: number;
    jumlah_core_in_tube: number;
    jumlah_total_core: number;
    status: 'active' | 'archived';
    kabel_tube_odcs?: { id: number }[];
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
    odcs: { id: number; nama_odc: string }[];
    tube_colors?: { id: number; warna_tube: string }[];
    deskripsi: string;
}

export default function FoKabelOdcs() {
    useTitle('Kabel');

    const [t] = useTranslation();
    const pages: Page[] = [{ name: t('Kabel'), href: '/fo-kabel-odcs' }];

    const columns: DataTableColumns<FoKabelOdc> = [
        // { id: 'id', label: 'ID' },
        {
            id: 'nama_kabel',
            label: 'Nama Kabel',
            format: (val, record) => (
                <a
                    href={`/fo-kabel-odcs/${record.id}/edit`}
                    className="text-blue-600 hover:underline"
                >
                    {val}
                </a>
            ),
        },
        {
            id: 'deskripsi',
            label: 'Deskripsi',
        },
        {
            id: 'odcs',
            label: 'ODC',
            format: (_val, record) => `${record.odcs?.map(odc => odc.nama_odc).join(', ') ?? '-'}`,
        },
        { id: 'tipe_kabel', label: 'Tipe Kabel' },
        {
            id: 'panjang_kabel',
            label: 'Panjang (m)',
            format: (val) => `${val}`,
        },
        {
            id: 'active_tube_count',
            label: 'Active Tube',
            format: (val) => val ?? 0,
        },
        {
            id: 'active_core_count',
            label: 'Active Core',
            format: (val) => val ?? 0,
        },
        { id: 'jumlah_tube', label: 'Total Tube' },
        { id: 'jumlah_core_in_tube', label: 'Max Core per Tube' },
        { id: 'jumlah_total_core', label: 'Max Total Core' },

        // { id: 'status', label: 'Status' },
        // {
        //     id: 'kabel_tube_odcs',
        //     label: 'Tube Count',
        //     format: (_val, record) => `${record.kabel_tube_odcs?.length ?? 0}`,
        // },
        // {
        //     id: 'tube_colors',
        //     label: 'Tubes',
        //     format: (_val: any, record: FoKabelOdc) =>
        //         Array.isArray(record.tube_colors)
        //             ? record.tube_colors.map(tc => tc.warna_tube).join(', ')
        //             : '',
        // },
        // {
        //     id: 'created_at',
        //     label: 'Dibuat Pada',
        //     format: (val) => val,
        // },
        // {
        //     id: 'updated_at',
        //     label: 'Diubah Pada',
        //     format: (val) => val,
        // },
        // {
        //     id: 'deleted_at',
        //     label: 'Dihapus Pada',
        //     format: (val) => val || '-',
        // },
    ];

    return (
        <Default title={t('Kabel')} breadcrumbs={pages}>
            <DataTable2<FoKabelOdc>
                resource="Kabel"
                columns={columns}
                endpoint="/api/v1/fo-kabel-odcs"
                linkToCreate="/fo-kabel-odcs/create"
                linkToEdit="/fo-kabel-odcs/:id/edit"
                withResourcefulActions
                bulkRoute="/api/v1/fo-kabel-odcs/bulk"
                customBulkActions={useFoKabelOdcBulkActions()}
                customActions={useFoKabelOdcActions()}
                withoutDefaultBulkActions={true}
                queryIdentificator="fo-kabel-odcs"
                // Disable sorting in frontend (using sort from backend default which is newest first)
                withoutSortQueryParameter={true}
            />
        </Default>
    );
}
