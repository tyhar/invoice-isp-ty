import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataTableColumns } from '$app/components/DataTable2';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { MdArchive, MdDelete, MdRestore, MdEdit } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { toast } from '$app/common/helpers/toast/toast';
import { route } from '$app/common/helpers/route';
import { getEntityState } from '$app/common/helpers2';
import { EntityState } from '$app/common/enums/entity-state';

export interface FoJointBox {
    id: string;
    nama_joint_box: string;
    deskripsi: string;
    lokasi: {
        id: number;
        nama_lokasi: string;
        latitude?: number;
        longitude?: number;
        deskripsi?: string;
        city?: string;
        province?: string;
        country?: string;
    } | null;
    kabel_odc: {
        id: number;
        nama_kabel: string;
        tipe_kabel?: string;
        panjang_kabel?: number;
        jumlah_tube?: number;
        jumlah_core_in_tube?: number;
        jumlah_total_core?: number;
    } | null;
    status: 'active' | 'archived';
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
}

export function useAllFoJointBoxColumns(): readonly string[] {
    return [
        'id',
        'nama_joint_box',
        'lokasi',
        'kabel_odc',
        'status',
        'created_at',
        'updated_at',
        'deleted_at',
    ] as const;
}

export function useFoJointBoxColumns(): DataTableColumns<FoJointBox> {
    const { t } = useTranslation();

    const columns: DataTableColumns<FoJointBox> = [
        {
            id: 'id',
            label: t('id'),
        },
        {
            id: 'nama_joint_box',
            label: t('Nama Joint Box'),
            format: (_field, rec) => (
                <a
                    href={route('/fo-joint-boxes/:id/edit', { id: rec.id })}
                    className="text-blue-600 hover:underline"
                >
                    {rec.nama_joint_box}
                </a>
            ),
        },
        {
            id: 'deskripsi',
            label: t('Deskripsi'),
        },
        {
            id: 'lokasi',
            label: t('lokasi'),
            format: (_field, rec) => rec.lokasi?.nama_lokasi ?? '-',
        },
        {
            id: 'lokasi_latitude',
            label: t('latitude'),
            format: (_field, rec) => rec.lokasi?.latitude ?? '-',
        },
        {
            id: 'lokasi_longitude',
            label: t('longitude'),
            format: (_field, rec) => rec.lokasi?.longitude ?? '-',
        },
        {
            id: 'lokasi_deskripsi',
            label: t('deskripsi'),
            format: (_field, rec) => rec.lokasi?.deskripsi ?? '-',
        },
        {
            id: 'lokasi_city',
            label: t('city'),
            format: (_field, rec) => rec.lokasi?.city ?? '-',
        },
        {
            id: 'lokasi_province',
            label: t('province'),
            format: (_field, rec) => rec.lokasi?.province ?? '-',
        },
        {
            id: 'lokasi_country',
            label: t('country'),
            format: (_field, rec) => rec.lokasi?.country ?? '-',
        },
        {
            id: 'kabel_odc',
            label: t('kabel odc'),
            format: (_field, rec) => rec.kabel_odc?.nama_kabel ?? '-',
        },
        {
            id: 'kabel_odc_tipe',
            label: t('tipe kabel'),
            format: (_field, rec) => rec.kabel_odc?.tipe_kabel ?? '-',
        },
        {
            id: 'kabel_odc_panjang',
            label: t('panjang kabel'),
            format: (_field, rec) => rec.kabel_odc?.panjang_kabel ?? '-',
        },
        {
            id: 'kabel_odc_jumlah_tube',
            label: t('jumlah tube'),
            format: (_field, rec) => rec.kabel_odc?.jumlah_tube ?? '-',
        },
        {
            id: 'kabel_odc_jumlah_core_in_tube',
            label: t('max core in tube'),
            format: (_field, rec) => rec.kabel_odc?.jumlah_core_in_tube ?? '-',
        },
        {
            id: 'kabel_odc_jumlah_total_core',
            label: t('max total_core'),
            format: (_field, rec) => rec.kabel_odc?.jumlah_total_core ?? '-',
        },
    ];

    return columns;
}

export function useFoJointBoxActions() {
    const [t] = useTranslation();
    const navigate = useNavigate();

    const handleAction = async (
        action: 'archive' | 'restore' | 'delete',
        id: string
    ) => {
        let url = '';
        let method: 'PATCH' | 'DELETE' = 'PATCH';

        switch (action) {
            case 'archive':
                url = route('/api/v1/fo-joint-boxes/:id/archive', { id });
                break;
            case 'restore':
                url = route('/api/v1/fo-joint-boxes/:id/restore', { id });
                break;
            case 'delete':
                method = 'DELETE';
                url = route('/api/v1/fo-joint-boxes/:id', { id });
                break;
        }

        toast.processing();

        try {
            await fetch(url, { method });
            toast.success(`${action}d_joint_box`);
        } catch {
            toast.error('error_action');
        }
    };

    const actions: Array<(jb: FoJointBox) => React.ReactNode> = [
        (jb) => (
            <DropdownElement
                key="edit"
                onClick={() =>
                    navigate(route('/fo-joint-boxes/:id/edit', { id: jb.id }))
                }
                icon={<Icon element={MdEdit} />}
            >
                {t('edit')}
            </DropdownElement>
        ),
        (jb) =>
            getEntityState(jb) === EntityState.Active && (
                <DropdownElement
                    key="archive"
                    onClick={() => handleAction('archive', jb.id)}
                    icon={<Icon element={MdArchive} />}
                >
                    {t('archive')}
                </DropdownElement>
            ),
        (jb) =>
            getEntityState(jb) === EntityState.Archived && (
                <DropdownElement
                    key="restore"
                    onClick={() => handleAction('restore', jb.id)}
                    icon={<Icon element={MdRestore} />}
                >
                    {t('restore')}
                </DropdownElement>
            ),
        (jb) =>
            (getEntityState(jb) === EntityState.Active ||
                getEntityState(jb) === EntityState.Archived) && (
                <DropdownElement
                    key="delete"
                    onClick={() => handleAction('delete', jb.id)}
                    icon={<Icon element={MdDelete} />}
                >
                    {t('delete')}
                </DropdownElement>
            ),
    ];

    return actions;
}

export function useFoJointBoxBulkActions() {
    const [t] = useTranslation();

    const bulkAction = async (
        selectedIds: string[],
        action: 'archive' | 'restore' | 'delete'
    ) => {
        toast.processing();

        const promises = selectedIds.map((id) => {
            let url = '';
            let method: 'PATCH' | 'DELETE' = 'PATCH';

            switch (action) {
                case 'archive':
                    url = route('/api/v1/fo-joint-boxes/:id/archive', { id });
                    break;
                case 'restore':
                    url = route('/api/v1/fo-joint-boxes/:id/restore', { id });
                    break;
                case 'delete':
                    method = 'DELETE';
                    url = route('/api/v1/fo-joint-boxes/:id', { id });
                    break;
            }

            return fetch(url, { method });
        });

        try {
            await Promise.all(promises);
            toast.success(`${action}d_joint_box`);
        } catch {
            toast.error('error_bulk_action');
        }
    };

    const customBulkActions: Array<
        (ctx: {
            selectedIds: string[];
            selectedResources: FoJointBox[];
            setSelected: React.Dispatch<React.SetStateAction<string[]>>;
        }) => React.ReactNode
    > = [
        ({ selectedIds }) => (
            <DropdownElement
                key="bulk-archive"
                onClick={() => bulkAction(selectedIds, 'archive')}
            >
                {t('archive')}
            </DropdownElement>
        ),
        ({ selectedIds }) => (
            <DropdownElement
                key="bulk-restore"
                onClick={() => bulkAction(selectedIds, 'restore')}
            >
                {t('restore')}
            </DropdownElement>
        ),
        ({ selectedIds }) => (
            <DropdownElement
                key="bulk-delete"
                onClick={() => bulkAction(selectedIds, 'delete')}
            >
                {t('delete')}
            </DropdownElement>
        ),
    ];

    return customBulkActions;
}
