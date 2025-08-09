import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTitle } from '$app/common/hooks/useTitle';
import { Default } from '$app/components/layouts/Default';
import { Container } from '$app/components/Container';
import { Spinner } from '$app/components/Spinner';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';

export default function Show() {
    useTitle('FO Joint Box Detail');
    const [t] = useTranslation();
    const { id } = useParams();
    const [data, setData] = useState<any>(null);
    const [isBusy, setIsBusy] = useState(false);

    useEffect(() => {
        setIsBusy(true);
        request('GET', endpoint(`/api/v1/fo-joint-boxes/${id}`))
            .then((res: any) => setData(res.data.data))
            .catch(() => setData(null))
            .finally(() => setIsBusy(false));
    }, [id]);

    if (isBusy || !data) return <Spinner />;

    return (
        <Default title={t('FO Joint Box Detail')} breadcrumbs={[]}>
            <Container breadcrumbs={[]}>
                <h2 className="text-xl font-bold mb-4">{data.nama_joint_box}</h2>
                <div className="space-y-2">
                    <div><b>ID:</b> {data.id}</div>
                    <div><b>Status:</b> {data.status}</div>
                    <div><b>Created At:</b> {data.created_at}</div>
                    <div><b>Updated At:</b> {data.updated_at}</div>
                    <div><b>Deleted At:</b> {data.deleted_at ?? '-'}</div>
                    <hr className="my-2" />
                    <div className="font-semibold">Lokasi</div>
                    {data.lokasi ? (
                        <div className="ml-4 space-y-1">
                            <div><b>ID:</b> {data.lokasi.id}</div>
                            <div><b>Nama Lokasi:</b> {data.lokasi.nama_lokasi}</div>
                            <div><b>Deskripsi:</b> {data.lokasi.deskripsi ?? '-'}</div>
                            <div><b>Latitude:</b> {data.lokasi.latitude}</div>
                            <div><b>Longitude:</b> {data.lokasi.longitude}</div>
                            <div><b>City:</b> {data.lokasi.city ?? '-'}</div>
                            <div><b>Province:</b> {data.lokasi.province ?? '-'}</div>
                            <div><b>Country:</b> {data.lokasi.country ?? '-'}</div>
                            <div><b>Geocoded At:</b> {data.lokasi.geocoded_at ?? '-'}</div>
                            <div><b>Status:</b> {data.lokasi.status}</div>
                            <div><b>Created At:</b> {data.lokasi.created_at}</div>
                            <div><b>Updated At:</b> {data.lokasi.updated_at}</div>
                            <div><b>Deleted At:</b> {data.lokasi.deleted_at ?? '-'}</div>
                        </div>
                    ) : (
                        <div className="ml-4">-</div>
                    )}
                    <hr className="my-2" />
                    <div className="font-semibold">Kabel ODC</div>
                    {data.kabel_odc ? (
                        <div className="ml-4 space-y-1">
                            <div><b>ID:</b> {data.kabel_odc.id}</div>
                            <div><b>Nama Kabel:</b> {data.kabel_odc.nama_kabel}</div>
                            <div><b>Tipe Kabel:</b> {data.kabel_odc.tipe_kabel}</div>
                            <div><b>Panjang Kabel:</b> {data.kabel_odc.panjang_kabel}</div>
                            <div><b>Jumlah Tube:</b> {data.kabel_odc.jumlah_tube}</div>
                            <div><b>Jumlah Core in Tube:</b> {data.kabel_odc.jumlah_core_in_tube}</div>
                            <div><b>Jumlah Total Core:</b> {data.kabel_odc.jumlah_total_core}</div>
                            <div><b>Status:</b> {data.kabel_odc.status}</div>
                            <div><b>Created At:</b> {data.kabel_odc.created_at}</div>
                            <div><b>Updated At:</b> {data.kabel_odc.updated_at}</div>
                            <div><b>Deleted At:</b> {data.kabel_odc.deleted_at ?? '-'}</div>
                        </div>
                    ) : (
                        <div className="ml-4">-</div>
                    )}
                    <hr className="my-2" />
                    <div className="font-semibold">ODC (Optional Connection FROM)</div>
                    {data.odc ? (
                        <div className="ml-4 space-y-1">
                            <div><b>ID:</b> {data.odc.id}</div>
                            <div><b>Nama ODC:</b> {data.odc.nama_odc}</div>
                            <div><b>Tipe Splitter:</b> {data.odc.tipe_splitter ?? '-'}</div>
                            {data.odc.lokasi && (
                                <>
                                    <div className="font-medium mt-2">Lokasi ODC:</div>
                                    <div className="ml-2 space-y-1">
                                        <div><b>Nama Lokasi:</b> {data.odc.lokasi.nama_lokasi}</div>
                                        <div><b>Latitude:</b> {data.odc.lokasi.latitude}</div>
                                        <div><b>Longitude:</b> {data.odc.lokasi.longitude}</div>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="ml-4">-</div>
                    )}
                    <hr className="my-2" />
                    <div className="font-semibold">ODP (Optional Connection TO)</div>
                    {data.odp ? (
                        <div className="ml-4 space-y-1">
                            <div><b>ID:</b> {data.odp.id}</div>
                            <div><b>Nama ODP:</b> {data.odp.nama_odp}</div>
                            {data.odp.lokasi && (
                                <>
                                    <div className="font-medium mt-2">Lokasi ODP:</div>
                                    <div className="ml-2 space-y-1">
                                        <div><b>Nama Lokasi:</b> {data.odp.lokasi.nama_lokasi}</div>
                                        <div><b>Latitude:</b> {data.odp.lokasi.latitude}</div>
                                        <div><b>Longitude:</b> {data.odp.lokasi.longitude}</div>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="ml-4">-</div>
                    )}
                </div>
            </Container>
        </Default>
    );
}
