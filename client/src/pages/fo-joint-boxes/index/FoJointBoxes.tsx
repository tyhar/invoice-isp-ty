import { useTranslation } from 'react-i18next';
import { useTitle } from '$app/common/hooks/useTitle';
import { Page } from '$app/components/Breadcrumbs';
import { Default } from '$app/components/layouts/Default';
import { DataTable2 } from '$app/components/DataTable2';
import { useFoJointBoxBulkActions } from '../common/hooks/useFoJointBoxBulkActions';
import { useFoJointBoxActions } from '../common/hooks/useFoJointBoxActions';
import { useFoJointBoxColumns } from '../common/hooks2';
import { foJointBoxResource } from '../common/atoms';
import React, { useState } from 'react';

interface FoJointBox {
    id: string;
    nama_joint_box: string;
    lokasi: { id: number; nama_lokasi: string } | null;
    kabel_odc: { id: number; nama_kabel: string } | null;
    status: 'active' | 'archived';
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
}

export default function FoJointBoxes() {
    useTitle('FO Joint Box');
    const [t] = useTranslation();
    const pages: Page[] = [
        { name: t('FO Joint Box'), href: '/fo-joint-boxes' },
    ];

    const columns = useFoJointBoxColumns();
    // Add state for expanded rows
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    // Custom row renderer to show nested kabel_odc tubes/cores
    // @ts-ignore: row is any because DataTable2 does not type expanded row props
    const renderRowDetails = (row: any) => {
        return (
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded mt-2">
                {/* Lokasi details */}
                <div className="font-semibold mb-1">Lokasi</div>
                {row.lokasi ? (
                    <div className="ml-2 mb-2">
                        <div><b>ID:</b> {row.lokasi.id}</div>
                        <div><b>Nama Lokasi:</b> {row.lokasi.nama_lokasi}</div>
                        <div><b>Deskripsi:</b> {row.lokasi.deskripsi}</div>
                        <div><b>Latitude:</b> {row.lokasi.latitude}</div>
                        <div><b>Longitude:</b> {row.lokasi.longitude}</div>
                        <div><b>City:</b> {row.lokasi.city}</div>
                        <div><b>Province:</b> {row.lokasi.province}</div>
                        <div><b>Country:</b> {row.lokasi.country}</div>
                        <div><b>Geocoded At:</b> {row.lokasi.geocoded_at}</div>
                    </div>
                ) : (
                    <div className="ml-2 mb-2 text-gray-500">No lokasi data</div>
                )}
                {/* Kabel ODC details */}
                <div className="font-semibold mb-1">Kabel ODC</div>
                {row.kabel_odc ? (
                    <div className="ml-2 mb-2">
                        <div><b>ID:</b> {row.kabel_odc.id}</div>
                        <div><b>Nama Kabel:</b> {row.kabel_odc.nama_kabel}</div>
                        <div><b>Tipe Kabel:</b> {row.kabel_odc.tipe_kabel}</div>
                        <div><b>Panjang Kabel:</b> {row.kabel_odc.panjang_kabel}</div>
                        <div><b>Jumlah Tube:</b> {row.kabel_odc.jumlah_tube}</div>
                        <div><b>Jumlah Core per Tube:</b> {row.kabel_odc.jumlah_core_in_tube}</div>
                        <div><b>Jumlah Total Core:</b> {row.kabel_odc.jumlah_total_core}</div>
                        {/* Tubes and Cores */}
                        <div className="font-semibold mt-2">Tubes</div>
                        {Array.isArray(row.kabel_odc.kabel_tube_odcs) && row.kabel_odc.kabel_tube_odcs.length > 0 ? (
                            row.kabel_odc.kabel_tube_odcs.map((tube: any) => (
                                <div key={tube.id} className="mb-2 ml-2">
                                    <div><b>Tube ID:</b> {tube.id} <b>Color:</b> {tube.warna_tube}</div>
                                    {Array.isArray(tube.kabel_core_odcs) && tube.kabel_core_odcs.length > 0 && (
                                        <div className="ml-4 mt-1">
                                            <div className="font-medium">Cores:</div>
                                            <ul className="list-disc ml-6">
                                                {tube.kabel_core_odcs.map((core: any) => (
                                                    <li key={core.id}>
                                                        <b>Core ID:</b> {core.id} <b>Color:</b> {core.warna_core}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="text-gray-500">No tubes</div>
                        )}
                    </div>
                ) : (
                    <div className="ml-2 mb-2 text-gray-500">No kabel_odc data</div>
                )}
            </div>
        );
    };

    return (
        <Default title={t('FO Joint Box')} breadcrumbs={pages}>
            <DataTable2<FoJointBox>
                resource={foJointBoxResource}
                columns={columns}
                endpoint="/api/v1/fo-joint-boxes"
                linkToCreate="/fo-joint-boxes/create"
                linkToEdit="/fo-joint-boxes/:id/edit"
                withResourcefulActions
                bulkRoute="/api/v1/fo-joint-boxes/bulk"
                queryIdentificator="fo-joint-boxes"
                customBulkActions={useFoJointBoxBulkActions()}
                customActions={useFoJointBoxActions()}
                withoutDefaultBulkActions={true}
            />
        </Default>
    );
}
