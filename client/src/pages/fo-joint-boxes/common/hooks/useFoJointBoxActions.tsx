import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { MdArchive, MdRestore, MdDelete, MdEdit } from 'react-icons/md';
import { getEntityState } from '$app/common/helpers2';
import { EntityState } from '$app/common/enums/entity-state';
import { useFoJointBoxBulkAction } from '$app/common/queries/foJointBox';
import { useNavigate } from 'react-router-dom';

export const useFoJointBoxActions = (): Array<(res: any) => ReactElement> => {
    const [t] = useTranslation();
    const bulkAction = useFoJointBoxBulkAction();
    const navigate = useNavigate();
    return [
        (res) => {
            const state = getEntityState(res);
            if (state === EntityState.Active) {
                return (
                    <>
                        <DropdownElement
                            onClick={() => navigate(`/fo-joint-boxes/${res.id}/edit`)}
                            icon={<Icon element={MdEdit} />}
                        >
                            {t('edit')}
                        </DropdownElement>
                        <DropdownElement
                            onClick={async () => {
                                await bulkAction([res.id], 'archive');
                            }}
                            icon={<Icon element={MdArchive} />}
                        >
                            {t('archive')}
                        </DropdownElement>
                        <DropdownElement
                            onClick={async () => {
                                await bulkAction([res.id], 'delete');
                            }}
                            icon={<Icon element={MdDelete} />}
                        >
                            {t('delete')}
                        </DropdownElement>
                    </>
                );
            }
            if (state === EntityState.Archived || state === EntityState.Deleted) {
                return (
                    <>
                        <DropdownElement
                            onClick={() => navigate(`/fo-joint-boxes/${res.id}/edit`)}
                            icon={<Icon element={MdEdit} />}
                        >
                            {t('edit')}
                        </DropdownElement>
                        <DropdownElement
                            onClick={async () => {
                                await bulkAction([res.id], 'restore');
                            }}
                            icon={<Icon element={MdRestore} />}
                        >
                            {t('restore')}
                        </DropdownElement>
                        <DropdownElement
                            onClick={async () => {
                                await bulkAction([res.id], 'delete');
                            }}
                            icon={<Icon element={MdDelete} />}
                        >
                            {t('delete')}
                        </DropdownElement>
                    </>
                );
            }
            return <></>;
        },
    ];
};
