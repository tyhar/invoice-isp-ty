// client/src/pages/fo-lokasis/common/hooks/useFoLokasiBulkActions.tsx
// import React from 'react';
import { useTranslation } from 'react-i18next';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import {
<<<<<<< Updated upstream
    MdDownload,
=======
    MdLocationOn,
    MdArchive,
    MdDelete,
    MdRestore,
>>>>>>> Stashed changes
    //  MdRestore
} from 'react-icons/md';
import { toast } from '$app/common/helpers/toast/toast';
import { CustomBulkAction } from '$app/components/DataTable2';

export const useFoLokasiBulkActions = (): CustomBulkAction<any>[] => {
    const [t] = useTranslation();

    return [
<<<<<<< Updated upstream
        ({ setSelected }) => (
            <DropdownElement
                onClick={() => {
                    // TODO: implement export logic
                    toast.success(t('exported_selected_lokasi')!);
                    setSelected([]);
                }}
                icon={<Icon element={MdDownload} />}
            >
                {t('export')!}
            </DropdownElement>
=======
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

                <DropdownElement
                    onClick={() => handleBulkGeocode(selectedIds, setSelected)}
                    icon={<Icon element={MdLocationOn} />}
                >
                    Bulk Geocode ({selectedIds.length})
                </DropdownElement>
            </>
>>>>>>> Stashed changes
        ),

        // ({ setSelected }) => (
        //     <DropdownElement
        //         onClick={() => {
        //             // TODO: implement export logic
        //             toast.success(t('exported_selected_lokasi')!);
        //             setSelected([]);
        //         }}
        //         icon={<Icon element={MdRestore} />}
        //     >
        //         {t('restore')!}
        //     </DropdownElement>
        // ),
    ];
};
