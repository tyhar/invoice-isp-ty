import { useTranslation } from 'react-i18next';
import { useTitle } from '$app/common/hooks/useTitle';
import { Page } from '$app/components/Breadcrumbs';
import { Default } from '$app/components/layouts/Default';
import { DataTable2 } from '$app/components/DataTable2';
import { useFoJointBoxBulkActions } from '../common/hooks/useFoJointBoxBulkActions';
import { useFoJointBoxActions } from '../common/hooks/useFoJointBoxActions';
import { useFoJointBoxColumns } from '../common/hooks2';
import { foJointBoxResource } from '../common/atoms';

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
