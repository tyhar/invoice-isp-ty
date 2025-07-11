// This file matches the pattern in fo-odcs/common/hooks/useFoOdcBulkActions.tsx
// Provides custom bulk actions for FO Joint Box
import React from 'react';
import { useTranslation } from 'react-i18next';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { MdArchive, MdDelete, MdRestore } from 'react-icons/md';
import { useFoJointBoxBulkAction } from '$app/common/queries/foJointBox';
import { CustomBulkAction } from '$app/components/DataTable2';

export const useFoJointBoxBulkActions = (): CustomBulkAction<any>[] => {
    const [t] = useTranslation();
    const bulkAction = useFoJointBoxBulkAction();

    return [
        ({ selectedIds, setSelected }) => (
            <>
                <DropdownElement
                    onClick={async () => {
                        await bulkAction(selectedIds, 'archive');
                        setSelected([]);
                    }}
                    icon={<Icon element={MdArchive} />}
                >
                    {t('archive')}
                </DropdownElement>

                <DropdownElement
                    onClick={async () => {
                        await bulkAction(selectedIds, 'delete');
                        setSelected([]);
                    }}
                    icon={<Icon element={MdDelete} />}
                >
                    {t('delete')}
                </DropdownElement>

                <DropdownElement
                    onClick={async () => {
                        await bulkAction(selectedIds, 'restore');
                        setSelected([]);
                    }}
                    icon={<Icon element={MdRestore} />}
                >
                    {t('restore')}
                </DropdownElement>
            </>
        ),
    ];
};
