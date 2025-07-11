import { request } from '$app/common/helpers/request';
import { endpoint } from '../helpers';
import { useQueryClient } from 'react-query';
import { useAtomValue } from 'jotai';
import { invalidationQueryAtom } from '../atoms/data-table';
import { toast } from '../helpers/toast/toast';

type Action = 'archive' | 'delete' | 'restore';

export function useFoJointBoxBulkAction() {
    const queryClient = useQueryClient();
    const invalidateQueryValue = useAtomValue(invalidationQueryAtom);

    return async (ids: number[] | string[], action: Action) => {
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

// Keep the old function for backward compatibility
export function bulk(ids: number[] | string[], action: Action) {
    return request('POST', endpoint('/api/v1/fo-joint-boxes/bulk'), {
        ids,
        action,
    });
}
