import { request } from '$app/common/helpers/request';
import { endpoint } from '../helpers';
import { useQueryClient } from 'react-query';
import { useAtomValue } from 'jotai';
import { invalidationQueryAtom } from '../atoms/data-table';
import { toast } from '../helpers/toast/toast';

export function useFoJointBoxBulkAction() {
    const queryClient = useQueryClient();
    const invalidateQueryValue = useAtomValue(invalidationQueryAtom);

    return async (ids: string[], action: 'archive' | 'delete' | 'restore') => {
        toast.processing();

        return request('POST', endpoint('/api/v1/fo-joint-boxes/bulk'), {
            ids,
            action,
        }).then(() => {
            toast.success(`${action}d_fo_joint_box`);

            // Invalidate specific query if available
            invalidateQueryValue &&
                queryClient.invalidateQueries([invalidateQueryValue]);

            // Invalidate all fo-joint-boxes related queries
            queryClient.invalidateQueries(['/api/v1/fo-joint-boxes']);
            queryClient.invalidateQueries(['fo-joint-boxes']);

            // Dispatch custom event for DataTable2 refresh
            window.dispatchEvent(
                new CustomEvent('invalidate.combobox.queries', {
                    detail: { url: endpoint('/api/v1/fo-joint-boxes') },
                })
            );
        });
    };
}

export function bulk(ids: string[], action: 'archive' | 'delete' | 'restore') {
    return request('POST', endpoint('/api/v1/fo-joint-boxes/bulk'), {
        ids,
        action,
    });
}
