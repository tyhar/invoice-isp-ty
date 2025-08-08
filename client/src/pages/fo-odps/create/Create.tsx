// client/src/pages/fo-odps/create/Create.tsx
import React, { FormEvent, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTitle } from '$app/common/hooks/useTitle';
import { Default } from '$app/components/layouts/Default';
import { Container } from '$app/components/Container';
import { Spinner } from '$app/components/Spinner';
import { toast } from '$app/common/helpers/toast/toast';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { useNavigate } from 'react-router-dom';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { CreateFoOdp, FoOdpFormValues } from '../common/components/CreateFoOdp';
import { useQueryClient } from 'react-query';

interface LokasiOption {
  id: number;
  nama_lokasi: string;
}

interface CoreOption {
  id: number;
  warna_core: string;
  kabel_odc_id: number;
  nama_kabel: string;
  kabel_tube_odc_id: number;
  warna_tube: string;
}

export default function Create() {
  useTitle('New FO ODP');
  const [t] = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const pages = [
    { name: t('FO ODP')!, href: '/fo-odps' },
    { name: t('New FO ODP')!, href: '/fo-odps/create' },
  ];

      const [values, setValues] = useState<FoOdpFormValues>({
        create_new_lokasi: false,
        lokasi_id: '',
        lokasi_name: '',
        lokasi_deskripsi: '',
        lokasi_latitude: '',
        lokasi_longitude: '',
        kabel_odc_id: '',
        kabel_tube_odc_id: '',
        kabel_core_odc_id: '',
        odc_id: '', // <-- add this
        nama_odp: '',
        deskripsi: '',
    });

  const [lokasis, setLokasis] = useState<LokasiOption[]>([]);
  const [kabelOdcs, setKabelOdcs] = useState<any[]>([]);
  const [kabelTubes, setKabelTubes] = useState<any[]>([]);
  const [cores, setCores] = useState<CoreOption[]>([]);
  const [errors, setErrors] = useState<ValidationBag>();
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    // Fetch Lokasi options
    request('GET', endpoint('/api/v1/fo-lokasis'))
      .then((res: any) => {
        setLokasis(
          res.data.data.map((l: any) => ({ id: l.id, nama_lokasi: l.nama_lokasi }))
        );
      })
      .catch(() => toast.error('error refresh page'));

    // Fetch Kabel ODCs
    request('GET', endpoint('/api/v1/fo-kabel-odcs?per_page=1000'))
      .then((res: any) => {
        setKabelOdcs(
          res.data.data.map((k: any) => ({
            id: k.id,
            nama_kabel: k.nama_kabel,
            kabel_tube_odcs: k.kabel_tube_odcs || [],
            odcs: k.odcs || [], // <-- add this
          }))
        );
      })
      .catch(() => toast.error('error refresh page'));

    // Fetch Kabel Tubes
    request('GET', endpoint('/api/v1/fo-kabel-tube-odcs?per_page=1000'))
      .then((res: any) => {
        setKabelTubes(
          res.data.data.map((t: any) => ({
            id: t.id,
            warna_tube: t.warna_tube,
            kabel_odc_id: t.kabel_odc_id,
            deskripsi: t.deskripsi,
          }))
        );
      })
      .catch(() => toast.error('error refresh page'));

    // Fetch Core options
    request('GET', endpoint('/api/v1/fo-kabel-core-odcs?per_page=1000'))
      .then((res: any) => {
        setCores(
          res.data.data.map((c: any) => ({
            id: c.id,
            warna_core: c.warna_core,
            kabel_odc_id: c.kabel_odc.id,
            nama_kabel: c.kabel_odc.nama_kabel,
            kabel_tube_odc_id: c.kabel_tube_odc.id,
            warna_tube: c.kabel_tube_odc.warna_tube,
            deskripsi: c.deskripsi,
          }))
        );
      })
      .catch(() => toast.error('error refresh page'));
  }, []);

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (isBusy) return;
    setIsBusy(true);
    toast.processing();

    const payload: Record<string, any> = {
      nama_odp: values.nama_odp,
      deskripsi: values.deskripsi,
    };

    if (values.kabel_core_odc_id !== '') {
      payload.kabel_core_odc_id = parseInt(values.kabel_core_odc_id, 10);
    }
    if (values.odc_id !== '') {
      payload.odc_id = parseInt(values.odc_id, 10);
    }

    const postOdp = (lokasiId: number) => {
      request('POST', endpoint('/api/v1/fo-odps'), {
        ...payload,
        lokasi_id: lokasiId,
      })
        .then(() => {
          toast.success('created odp');
          queryClient.invalidateQueries('fo-odps');
          navigate('/fo-odps');
        })
        .catch((err) => {
          if (err.response?.status === 422) {
            setErrors(err.response.data);
            const validation = err.response.data.errors;
            if (validation.kabel_core_odc_id) {
              toast.error(
                validation.kabel_core_odc_id[0] +
                  ' Please disable or unset the existing ODP before assigning this core.'
              );
            } else {
              toast.dismiss();
            }
          } else {
            toast.error('error refresh page');
          }
        })
        .finally(() => setIsBusy(false));
    };

    if (values.create_new_lokasi) {
      request('POST', endpoint('/api/v1/fo-lokasis'), {
        nama_lokasi: values.lokasi_name,
        deskripsi: values.lokasi_deskripsi,
        latitude: parseFloat(values.lokasi_latitude),
        longitude: parseFloat(values.lokasi_longitude),
      })
        .then((res: GenericSingleResourceResponse<any>) => {
          const newLokasiId = res.data.data.id;
          queryClient.invalidateQueries(['/api/v1/fo-lokasis']);
          postOdp(newLokasiId);
        })
        .catch((err) => {
          if (err.response?.status === 422) {
            setErrors(err.response.data);
            toast.dismiss();
          } else {
            toast.error('error refresh page');
          }
          setIsBusy(false);
        });
    } else {
      postOdp(parseInt(values.lokasi_id, 10));
    }
  };

  return (
    <Default
      title={t('New FO ODP')}
      breadcrumbs={pages}
      disableSaveButton={isBusy}
      onSaveClick={handleSave}
    >
      <Container breadcrumbs={[]}>
        <form onSubmit={handleSave}>
          <CreateFoOdp
            values={values}
            setValues={setValues}
            lokasis={lokasis}
            kabelOdcs={kabelOdcs}
            kabelTubes={kabelTubes}
            cores={cores}
            errors={errors}
          />
        </form>
        {isBusy && <Spinner />}
      </Container>
    </Default>
  );
}
