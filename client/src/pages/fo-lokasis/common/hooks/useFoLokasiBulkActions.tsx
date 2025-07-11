// client/src/pages/fo-lokasis/common/hooks/useFoLokasiBulkActions.tsx
// import React from 'react';
import { useTranslation } from 'react-i18next';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import {
    MdLocationOn,
    MdArchive,
    MdDelete,
    MdRestore,
    //  MdRestore
} from 'react-icons/md';
import { toast } from '$app/common/helpers/toast/toast';
import { CustomBulkAction } from '$app/components/DataTable2';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
import { useFoLokasiBulkAction } from '$app/common/queries/foLokasi';

export const useFoLokasiBulkActions = (): CustomBulkAction<any>[] => {
    const [t] = useTranslation();
    const bulkAction = useFoLokasiBulkAction();

    const handleBulkGeocode = async (selectedIds: string[], setSelected: (ids: string[]) => void) => {
        if (selectedIds.length === 0) {
            toast.error('No locations selected for geocoding.');
            return;
        }

        try {
            // Fetch the full resource data for selected IDs to check coordinates
            const response = await request('GET', endpoint('/api/v1/fo-lokasis'), {
                ids: selectedIds.join(','),
            });

            const resources = response.data.data;
            const resourcesToGeocode = resources.filter(
                (res: any) => res.latitude && res.longitude
            );

            if (resourcesToGeocode.length === 0) {
                toast.error('No locations selected for geocoding. Make sure locations have coordinates.');
                return;
            }

            const idsToGeocode = resourcesToGeocode.map((res: any) => res.id);
            const geocodeResponse = await request('POST', endpoint('/api/v1/fo-lokasis/bulk-geocode'), {
                ids: idsToGeocode
            });

            if (geocodeResponse.data.status === 'success') {
                const { success, failed } = geocodeResponse.data.data;

                if (success > 0) {
                    toast.success(`Successfully geocoded ${success} location(s)`);
                }
                if (failed > 0) {
                    toast.error(`Failed to geocode ${failed} location(s)`);
                }

                setSelected([]);
                // Refresh the page to show updated data
                window.location.reload();
            } else {
                toast.error('Failed to geocode locations');
            }
        } catch (error) {
            console.error('Bulk geocoding error:', error);
            toast.error('Failed to geocode locations. Please try again.');
        }
    };

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

                <DropdownElement
                    onClick={() => handleBulkGeocode(selectedIds, setSelected)}
                    icon={<Icon element={MdLocationOn} />}
                >
                    Bulk Geocode ({selectedIds.length})
                </DropdownElement>
            </>
        ),
    ];
};
