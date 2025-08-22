// client/src/pages/fo-lokasis/index/FoLokasis.tsx

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTitle } from '$app/common/hooks/useTitle';
import { Page } from '$app/components/Breadcrumbs';
import { Default } from '$app/components/layouts/Default';
import { DataTable2, DataTableColumns } from '$app/components/DataTable2';
import { useFoLokasiBulkActions } from '../common/hooks/useFoLokasiBulkActions';
import { useFoLokasiActions } from '../common/hooks/useFoLokasiActions';

interface FoLokasi {
    id: string;
    nama_lokasi: string;
    deskripsi: string | null;
    latitude: number;
    longitude: number;
    city?: string;
    province?: string;
    country?: string;
    geocoded_at?: string;
    odcs?: { id: string; nama_odc: string }[];
    odps?: { id: string; nama_odp: string }[];
    clients?: { id: string; nama_client: string }[];
    jointboxes?: { id: string; nama_joint_box: string }[];
    used_for?: string[];
    status: 'active' | 'archived';
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
}

export default function FoLokasis() {
    useTitle('FO Lokasi');

    const [t] = useTranslation();
    const pages: Page[] = [{ name: t('FO Lokasi'), href: '/fo-lokasis' }];

    const columns: DataTableColumns<FoLokasi> = [
        {
            id: 'nama_lokasi',
            label: 'Nama Lokasi',
            format: (val, resource) => (
                <a
                    href={`/fo-lokasis/${resource.id}/edit`}
                    className="text-blue-600 hover:underline"
                >
                    {val}
                </a>
            ),
        },
        {
            id: 'used_for',
            label: 'Used For',
            format: (_f, resource) => (
                <div className="flex flex-wrap gap-1">
                    {(resource.used_for || []).map((type: string) => (
                        <span key={type} className="px-2 py-0.5 rounded text-xs font-semibold bg-gray-200 text-gray-800">
                            {type.replace('_', ' ').toUpperCase()}
                        </span>
                    ))}
                </div>
            ),
        },
        {
            id: 'geocoding',
            label: 'Geocoding Status',
            format: (_f, resource) => {
                if (!resource.latitude || !resource.longitude) {
                    return (
                        <span className="text-gray-500">No coordinates</span>
                    );
                }
                if (resource.geocoded_at) {
                    return (
                        <span className="text-green-600">
                            ✓ Geocoded ({resource.city || 'No city'})
                        </span>
                    );
                }
                return (
                    <span className="text-orange-600">⚠ Needs geocoding</span>
                );
            },
        },
        {
            id: 'odcs',
            label: 'Jumlah ODC',
            format: (_f, resource) => `${resource.odcs?.length ?? 0} ODC`,
        },
        {
            id: 'odps',
            label: 'Jumlah ODP',
            format: (_f, resource) => `${resource.odps?.length ?? 0} ODP`,
        },
        {
            id: 'clients',
            label: 'Jumlah Client',
            format: (_f, resource) => `${resource.clients?.length ?? 0} Client`,
        },
        {
            id: 'jointboxes',
            label: 'Jumlah JointBox',
            format: (_f, resource) => `${resource.jointboxes?.length ?? 0} JointBox`,
        },
        { id: 'deskripsi', label: 'Deskripsi' },
        { id: 'latitude', label: 'Latitude' },
        { id: 'longitude', label: 'Longitude' },
    ];

    // Used For filter options
    const usedForOptions = [
        { value: 'odc', label: 'ODC', backgroundColor: '#e0e7ff', color: '#3730a3', queryKey: 'used_by_status' },
        { value: 'odp', label: 'ODP', backgroundColor: '#fef9c3', color: '#92400e', queryKey: 'used_by_status' },
        { value: 'joint_box', label: 'JointBox', backgroundColor: '#d1fae5', color: '#065f46', queryKey: 'used_by_status' },
        { value: 'client', label: 'Client', backgroundColor: '#f3e8ff', color: '#6d28d9', queryKey: 'used_by_status' },
    ];
    const customFilters = [
        {
            value: '',
            label: t('Used For'),
            backgroundColor: '#f3f4f6',
            color: '#111827',
            options: usedForOptions,
            dropdownKey: '0' as const,
            placeHolder: t('Used For'),
            queryKey: 'used_by_status',
        },
    ];

    // State for custom filter (used_by_status)
    const [customFilter] = useState<string[]>([]);

    // Build endpoint string based on current filter state
    const endpoint = useMemo(() => {
        const search = new URLSearchParams();
        search.set('per_page', '10');
        search.set('page', '1');
        search.set('status', 'active');
        // Rely on backend default sort (newest first). Avoid setting sort here
        // search.set('sort', 'id|desc');
        if (customFilter && customFilter.length > 0) {
            search.set('used_by_status', customFilter.join(','));
        }
        return `/api/v1/fo-lokasis?${search.toString()}`;
    }, [customFilter]);

    return (
        <Default title={t('FO Lokasi')} breadcrumbs={pages}>
            <DataTable2<FoLokasi>
                resource="FO Lokasi"
                columns={columns}
                linkToCreate="/fo-lokasis/create"
                linkToEdit="/fo-lokasis/:id/edit"
                withResourcefulActions
                bulkRoute="/api/v1/fo-lokasis/bulk"
                customBulkActions={useFoLokasiBulkActions()}
                customActions={useFoLokasiActions()}
                withoutDefaultBulkActions={true}
                queryIdentificator="fo-lokasis"
                customFilters={customFilters}
                customFilterPlaceholder={t('Used For') || 'Used For'}
                endpoint={endpoint}
                // Disable sorting in frontend (using sort from backend default which is newest first)
                withoutSortQueryParameter={true}
            />
        </Default>
    );
}
