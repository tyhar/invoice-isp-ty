import { useEffect, useMemo, useState } from 'react';
import L, { LatLng } from 'leaflet';
import { Marker, useMapEvents } from 'react-leaflet';
import axios from 'axios';

export type FormMode = 'client' | 'odp' | 'odc';

export interface MarkerData {
  id: number;
  lokasi_id: number;
  nama_lokasi: string;
  deskripsi: string;
  latitude: string;
  longitude: string;
  nama_client?: string;
  alamat?: string;
  odp_id?: string;
  client_id: number;
  nama_odp?: string;
  tipe_splitter?: string;
  kabel_core_odc_id?: string;
  kabel_odc_id?: string;
  kabel_tube_odc_id?: string;
  nama_odc?: string;
  nama_joint_box?: string;
  odc_id?: string;
}

interface ODC {
  id: number;
  nama_odc: string;
}

interface AddMarkerFormProps {
  mode: FormMode;
  onSave: () => void;
  onCancel: () => void;
  initialData?: Partial<MarkerData>;
  editingId?: number;
}

export const AddMarkerForm: React.FC<AddMarkerFormProps> = ({ mode, onSave, onCancel, initialData, editingId }) => {
  const parseCoordinate = (value: any): number | null => {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
  };

  const [position, setPosition] = useState<LatLng | null>(() => {
    const lat = parseCoordinate(initialData?.latitude);
    const lng = parseCoordinate(initialData?.longitude);
    if (lat !== null && lng !== null) {
      return new L.LatLng(lat, lng);
    }
    return null;
  });

  const api = "http://localhost:8000";

  const [form, setForm] = useState({
    nama_lokasi: initialData?.nama_lokasi || '',
    deskripsi: initialData?.deskripsi || '',
    deskripsi_odc: mode === 'odc' ? initialData?.deskripsi || '' : '',
    deskripsi_odp: mode === 'odp' ? initialData?.deskripsi || '' : '',
    nama: initialData?.nama_client || initialData?.nama_odp || initialData?.nama_odc || '',
    alamat: initialData?.alamat || '',
    odp_id: initialData?.odp_id || '',
    kabel_core_odc_id: initialData?.kabel_core_odc_id || '',
    tipe_splitter: initialData?.tipe_splitter || '1:8',
    latitude: initialData?.latitude || '',
    longitude: initialData?.longitude || '',
    client_id: initialData?.client_id || '',
    kabel_odc_id: initialData?.kabel_odc_id || '',
    kabel_tube_odc_id: initialData?.kabel_tube_odc_id || '',
    odc_id: initialData?.odc_id || '',
  });

  const allowMapClick = !position && form.nama_lokasi.trim() === '' && form.nama.trim() === '';

  const [odpList, setOdpList] = useState<any[]>([]);
  const [odcCoreList, setOdcCoreList] = useState<any[]>([]);
  const [clientList, setClientList] = useState<any[]>([]);
  const [kabelOdcList, setKabelOdcList] = useState<any[]>([]);
  const [kabelTubeList, setKabelTubeList] = useState<any[]>([]);
  const [odcList, setOdcList] = useState<ODC[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  // Derived selections/filters to align with Create forms
  const selectedCore = useMemo(() => {
    if (!form.kabel_core_odc_id) return null;
    return odcCoreList.find((c: any) => String(c.id) === String(form.kabel_core_odc_id)) || null;
  }, [form.kabel_core_odc_id, odcCoreList]);

  // For ODP form: filter ODCs by selected core's kabel_odc
  const filteredOdcForOdp = useMemo(() => {
    const kabelOdcId = selectedCore?.kabel_odc?.id;
    if (!kabelOdcId) return odcList;
    return odcList.filter((o: any) => String(o.kabel_odc_id) === String(kabelOdcId));
  }, [selectedCore, odcList]);

  // For ODC form: filter ODCs by selected kabel_odc (to connect ODC -> ODC on same kabel)
  const filteredOdcForOdc = useMemo(() => {
    if (!form.kabel_odc_id) return odcList;
    return odcList.filter((o: any) => String(o.kabel_odc_id) === String(form.kabel_odc_id));
  }, [form.kabel_odc_id, odcList]);

  // ODP cascading filters: Kabel → Tube → Core
  const filteredTubesForOdp = useMemo(() => {
    if (!form.kabel_odc_id) return kabelTubeList;
    return kabelTubeList.filter((t: any) => String(t.kabel_odc_id) === String(form.kabel_odc_id));
  }, [form.kabel_odc_id, kabelTubeList]);

  const filteredCoresForOdp = useMemo(() => {
    if (form.kabel_tube_odc_id) {
      return odcCoreList.filter((c: any) => String(c.kabel_tube_odc?.id) === String(form.kabel_tube_odc_id));
    }
    if (form.kabel_odc_id) {
      return odcCoreList.filter((c: any) => String(c.kabel_tube_odc?.kabel_odc?.id) === String(form.kabel_odc_id));
    }
    return odcCoreList;
  }, [form.kabel_tube_odc_id, form.kabel_odc_id, odcCoreList]);

  // ODC cascading filters: Kabel → Tube → Core (for selecting feeding core)
  const filteredTubesForOdc = useMemo(() => {
    if (!form.kabel_odc_id) return kabelTubeList;
    return kabelTubeList.filter((t: any) => String(t.kabel_odc_id) === String(form.kabel_odc_id));
  }, [form.kabel_odc_id, kabelTubeList]);

  const filteredCoresForOdc = useMemo(() => {
    if (form.kabel_tube_odc_id) {
      return odcCoreList.filter((c: any) => String(c.kabel_tube_odc?.id) === String(form.kabel_tube_odc_id));
    }
    if (form.kabel_odc_id) {
      return odcCoreList.filter((c: any) => String(c.kabel_tube_odc?.kabel_odc?.id) === String(form.kabel_odc_id));
    }
    return odcCoreList;
  }, [form.kabel_tube_odc_id, form.kabel_odc_id, odcCoreList]);

  // Update form when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      setForm({
        nama_lokasi: initialData.nama_lokasi || '',
        deskripsi: initialData.deskripsi || '',
        deskripsi_odc: mode === 'odc' ? initialData.deskripsi || '' : '',
        deskripsi_odp: mode === 'odp' ? initialData.deskripsi || '' : '',
        nama: initialData.nama_client || initialData.nama_odp || initialData.nama_odc || '',
        alamat: initialData.alamat || '',
        odp_id: initialData.odp_id || '',
        kabel_core_odc_id: initialData.kabel_core_odc_id || '',
        tipe_splitter: initialData.tipe_splitter || '1:8',
        latitude: initialData.latitude || '',
        longitude: initialData.longitude || '',
        client_id: initialData.client_id || '',
        kabel_odc_id: initialData.kabel_odc_id || '',
        kabel_tube_odc_id: initialData.kabel_tube_odc_id || '',
        odc_id: initialData.odc_id || '',
      });
    }
  }, [initialData, mode]);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('X-API-TOKEN');
      const headers = { headers: { 'X-API-TOKEN': token || '' } };

      try {
        if (mode === 'client') {
          const [odpRes, clientRes] = await Promise.all([
            axios.get(`${api}/api/v1/fo-odps`, headers),
            axios.get(`${api}/api/v1/clients`, headers),
          ]);
          setOdpList(odpRes.data.data);
          setClientList(clientRes.data.data);
        } else if (mode === 'odp') {
          const [coreRes, odcRes, kabelRes, tubeRes] = await Promise.all([
            axios.get(`${api}/api/v1/fo-kabel-core-odcs`, headers),
            axios.get(`${api}/api/v1/fo-odcs`, headers),
            axios.get(`${api}/api/v1/fo-kabel-odcs`, headers),
            axios.get(`${api}/api/v1/fo-kabel-tube-odcs`, headers),
          ]);
          setOdcCoreList(coreRes.data.data);
          setOdcList(odcRes.data.data);
          setKabelOdcList(kabelRes.data.data);
          setKabelTubeList(tubeRes.data.data);
        } else if (mode === 'odc') {
          const [kabelRes, tubeRes, coreRes, odcRes] = await Promise.all([
            axios.get(`${api}/api/v1/fo-kabel-odcs`, headers),
            axios.get(`${api}/api/v1/fo-kabel-tube-odcs`, headers),
            axios.get(`${api}/api/v1/fo-kabel-core-odcs`, headers),
            axios.get(`${api}/api/v1/fo-odcs`, headers),
          ]);
          setKabelOdcList(kabelRes.data.data);
          setKabelTubeList(tubeRes.data.data);
          setOdcCoreList(coreRes.data.data);
          setOdcList(odcRes.data.data);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [mode]);

  useMapEvents({
    click(e) {
      if (!allowMapClick) return;
      setPosition(e.latlng);
      setForm((f) => ({
        ...f,
        latitude: e.latlng.lat.toString(),
        longitude: e.latlng.lng.toString(),
      }));
    },
  });

  const onMarkerDragEnd = (e: L.DragEndEvent) => {
    const marker = e.target;
    const latLng = marker.getLatLng();
    setPosition(latLng);
    setForm((f) => ({ ...f, latitude: latLng.lat.toString(), longitude: latLng.lng.toString() }));
  };

  const handleLatLongChange = (field: 'latitude' | 'longitude', value: string) => {
    setForm((f) => {
      const newForm = { ...f, [field]: value } as any;
      const lat = parseFloat((newForm as any).latitude);
      const lng = parseFloat((newForm as any).longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        const newPos = new L.LatLng(lat, lng);
        setPosition(newPos);
      }
      return newForm;
    });
  };

  const validateForm = (): string | null => {
    // Common validations
    if (!form.nama_lokasi.trim()) return 'Nama Lokasi harus diisi.';
    if (!form.nama.trim()) return 'Nama harus diisi.';
    if (!position) return 'Klik lokasi di peta terlebih dahulu.';

    // Mode-specific validations
    if (mode === 'client') {
      if (!form.odp_id) return 'ODP harus dipilih untuk Client FTTH.';
    } else if (mode === 'odp') {
      if (!form.kabel_core_odc_id) return 'Kabel Core harus dipilih untuk ODP.';
    } else if (mode === 'odc') {
      if (!form.kabel_odc_id) return 'Kabel harus dipilih untuk ODC.';
      if (!form.tipe_splitter) return 'Tipe Splitter harus dipilih untuk ODC.';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      const token = localStorage.getItem('X-API-TOKEN');
      const headers = { headers: { 'X-API-TOKEN': token || '' } };

      // Normalize IDs to numbers or null to match form behavior elsewhere
      const parsedIds = {
        odp_id: form.odp_id ? parseInt(String(form.odp_id), 10) : null,
        client_id: form.client_id && String(form.client_id).trim() !== '' ? form.client_id : null,
        kabel_core_odc_id: form.kabel_core_odc_id ? parseInt(String(form.kabel_core_odc_id), 10) : null,
        kabel_odc_id: form.kabel_odc_id ? parseInt(String(form.kabel_odc_id), 10) : null,
        odc_id: form.odc_id ? parseInt(String(form.odc_id), 10) : null,
      };

      if (editingId) {
        await axios.put(
          `${api}/api/v1/fo-lokasis/${initialData?.lokasi_id}`,
          {
            nama_lokasi: form.nama_lokasi,
            deskripsi: form.deskripsi,
            latitude: position!.lat,
            longitude: position!.lng,
          },
          headers
        );

        if (mode === 'client') {
          await axios.put(
            `${api}/api/v1/fo-client-ftths/${editingId}`,
            {
              lokasi_id: initialData?.lokasi_id,
              odp_id: parsedIds.odp_id,
              nama_client: form.nama,
              alamat: form.alamat,
            },
            headers
          );
        } else if (mode === 'odp') {
          await axios.put(
            `${api}/api/v1/fo-odps/${editingId}`,
            {
              lokasi_id: initialData?.lokasi_id,
              kabel_core_odc_id: parsedIds.kabel_core_odc_id,
              odc_id: parsedIds.odc_id,
              nama_odp: form.nama,
              deskripsi: form.deskripsi_odp,
            },
            headers
          );
        } else if (mode === 'odc') {
          await axios.put(
            `${api}/api/v1/fo-odcs/${editingId}`,
            {
              lokasi_id: initialData?.lokasi_id,
              odc_id: parsedIds.odc_id,
              kabel_odc_id: parsedIds.kabel_odc_id,
              kabel_core_odc_id: parsedIds.kabel_core_odc_id,
              nama_odc: form.nama,
              tipe_splitter: form.tipe_splitter,
              deskripsi: form.deskripsi_odc,
            },
            headers
          );
        }

        window.alert('Data berhasil diperbarui.');
      } else {
        const lokasiRes = await axios.post(
          `${api}/api/v1/fo-lokasis`,
          {
            nama_lokasi: form.nama_lokasi,
            deskripsi: form.deskripsi,
            latitude: position!.lat,
            longitude: position!.lng,
          },
          headers
        );

        const lokasi_id = lokasiRes.data.data.id;

        if (mode === 'client') {
          await axios.post(
            `${api}/api/v1/fo-client-ftths`,
            {
              lokasi_id,
              odp_id: parsedIds.odp_id,
              nama_client: form.nama,
              alamat: form.alamat,
              client_id: parsedIds.client_id,
            },
            headers
          );
        } else if (mode === 'odp') {
          await axios.post(
            `${api}/api/v1/fo-odps`,
            {
              lokasi_id,
              kabel_core_odc_id: parsedIds.kabel_core_odc_id,
              odc_id: parsedIds.odc_id,
              nama_odp: form.nama,
              deskripsi: form.deskripsi_odp,
            },
            headers
          );
        } else if (mode === 'odc') {
          await axios.post(
            `${api}/api/v1/fo-odcs`,
            {
              lokasi_id,
              odc_id: parsedIds.odc_id,
              kabel_odc_id: parsedIds.kabel_odc_id,
              kabel_core_odc_id: parsedIds.kabel_core_odc_id,
              nama_odc: form.nama,
              tipe_splitter: form.tipe_splitter,
              deskripsi: form.deskripsi_odc,
            },
            headers
          );
        }

        setFormError(null);
        window.alert('Data berhasil disimpan.');
      }

      onSave();
    } catch (error: any) {
      if (error.response && error.response.status === 422) {
        const errors = error.response.data.errors as Record<string, string[]>;
        const rawError = (Object.values(errors)[0]?.[0]) || error.response.data.message;

        const errorMap: Record<string, string> = {
          'The nama odp has already been taken.': 'Nama ODP sudah digunakan.',
          'The nama odc has already been taken.': 'Nama ODC sudah digunakan.',
          'The nama client has already been taken.': 'Nama Client sudah digunakan.',
        };

        const translatedError = errorMap[rawError] || rawError || 'Terjadi kesalahan validasi.';
        setFormError(translatedError);
      } else {
        console.error(error);
        setFormError('Gagal menyimpan data.');
      }
    }
  };

  const clientIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    shadowSize: [41, 41],
  });

  const odpIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    shadowSize: [41, 41],
  });

  const odcIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    shadowSize: [41, 41],
  });

  return (
    <>
      {position && (
        <Marker
          position={position}
          draggable
          icon={
            mode === 'client'
              ? clientIcon
              : mode === 'odp'
                ? odpIcon
                : odcIcon
          }
          eventHandlers={{ dragend: onMarkerDragEnd }}
        />
      )}

      <div className="absolute top-10 right-4 bg-white p-4 shadow-md rounded z-[999] w-[320px] max-h-[80vh] overflow-auto">
        <h3 className="font-semibold mb-2">
          {editingId ? mode === 'client' ? 'Edit Client' : mode === 'odp' ? 'Edit ODP' : 'Edit ODC' : mode === 'client' ? 'Tambah Client' : mode === 'odp' ? 'Tambah ODP' : 'Tambah ODC'}</h3>
        <p className="mb-2 text-xs text-gray-600">Klik peta untuk memilih lokasi atau edit latitude dan longitude di bawah</p>
        <div className="max-h-[55vh] overflow-y-auto px-4">
          {formError && (
            <div className="bg-red-100 text-red-800 text-sm px-3 py-2 rounded mb-2">
              {formError}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-3 text-sm">
            <div>
              <label className="block mb-1">Nama Lokasi</label>
              <input
                type="text"
                className="w-full border p-1"
                placeholder="Nama Lokasi"
                value={form.nama_lokasi}
                onChange={(e) => setForm({ ...form, nama_lokasi: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block mb-1">Deskripsi Lokasi</label>
              <input
                type="text"
                className="w-full border p-1"
                placeholder="Deskripsi Lokasi"
                value={form.deskripsi}
                onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
              />
            </div>

            <div>
              <label className="block mb-1">
                {mode === 'client' ? 'Nama Client' : mode === 'odp' ? 'Nama ODP' : 'Nama ODC'}
              </label>
              <input
                type="text"
                className="w-full border p-1"
                placeholder="Nama"
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                required
              />
            </div>

            {mode === 'client' && (
              <>
                <div>
                  <label className="block mb-1">Alamat</label>
                  <input
                    type="text"
                    className="w-full border p-1"
                    placeholder="Alamat"
                    value={form.alamat}
                    onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block mb-1">ODP</label>
                  <select
                    className="w-full border p-1"
                    value={form.odp_id}
                    onChange={(e) => setForm({ ...form, odp_id: e.target.value })}
                    required
                  >
                    <option value="">Pilih ODP</option>
                    {odpList.map((odp) => (
                      <option key={odp.id} value={odp.id}>
                        {odp.nama_odp}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1">Client ID</label>
                  <select
                    className="w-full border p-1"
                    value={form.client_id}
                    onChange={(e) => setForm({ ...form, client_id: e.target.value })}
                  >
                    <option value="">Pilih Client ID</option>
                    {clientList.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name || client.nama_client || `Client #${client.id}`}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {mode === 'odp' && (
              <>
                <div>
                  <label className="block mb-1">Kabel</label>
                  <select
                    className="w-full border p-1"
                    value={form.kabel_odc_id}
                    onChange={(e) => setForm({ ...form, kabel_odc_id: e.target.value, kabel_tube_odc_id: '', kabel_core_odc_id: '' })}
                  >
                    <option value="">Pilih Kabel</option>
                    {kabelOdcList.map((kabel) => (
                      <option key={kabel.id} value={kabel.id}>
                        {kabel.nama_kabel}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1">Kabel Tube</label>
                  <select
                    className="w-full border p-1"
                    value={form.kabel_tube_odc_id}
                    onChange={(e) => setForm({ ...form, kabel_tube_odc_id: e.target.value, kabel_core_odc_id: '' })}
                    disabled={!form.kabel_odc_id}
                  >
                    <option value="">Pilih Kabel Tube</option>
                    {filteredTubesForOdp.map((tube: any) => (
                      <option key={tube.id} value={tube.id}>
                        {tube.warna_tube}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1">Deskripsi ODP</label>
                  <input
                    type="text"
                    className="w-full border p-1"
                    placeholder="Deskripsi ODP"
                    value={form.deskripsi_odp}
                    onChange={(e) => setForm({ ...form, deskripsi_odp: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block mb-1">Kabel Core</label>
                  <select
                    className="w-full border p-1"
                    value={form.kabel_core_odc_id}
                    onChange={(e) => setForm({ ...form, kabel_core_odc_id: e.target.value })}
                    required
                  >
                    <option value="">Pilih Kabel Core</option>
                    {filteredCoresForOdp.map((core: any) => (
                      <option key={core.id} value={core.id}>
                        {core.warna_core}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1">ODC ID (Opsional)</label>
                  <select
                    className="w-full border p-1"
                    value={form.odc_id}
                    onChange={(e) => setForm({ ...form, odc_id: e.target.value })}
                  >
                    <option value="">Pilih ODC</option>
                    {filteredOdcForOdp.map((odc) => (
                      <option key={odc.id} value={odc.id}>
                        {odc.nama_odc}
                      </option>
                    ))}
                  </select>
                  {selectedCore && (
                    <p className="text-xs text-gray-500 mt-1">
                      Menampilkan ODC yang terhubung dengan kabel {selectedCore.kabel_tube_odc?.kabel_odc?.nama_kabel} - tube {selectedCore.kabel_tube_odc?.warna_tube} - core {selectedCore.warna_core}
                    </p>
                  )}
                </div>

              </>
            )}

            {mode === 'odc' && (
              <>
                <div>
                  <label className="block mb-1">Deskripsi ODC</label>
                  <input
                    type="text"
                    className="w-full border p-1"
                    placeholder="Deskripsi ODC"
                    value={form.deskripsi_odc}
                    onChange={(e) => setForm({ ...form, deskripsi_odc: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block mb-1">Kabel</label>
                  <select
                    className="w-full border p-1"
                    value={form.kabel_odc_id}
                    onChange={(e) => setForm({ ...form, kabel_odc_id: e.target.value, kabel_tube_odc_id: '', kabel_core_odc_id: '' })}
                    required
                  >
                    <option value="">Pilih Kabel</option>
                    {kabelOdcList.map((kabel) => (
                      <option key={kabel.id} value={kabel.id}>
                        {kabel.nama_kabel}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1">Kabel Tube</label>
                  <select
                    className="w-full border p-1"
                    value={form.kabel_tube_odc_id}
                    onChange={(e) => setForm({ ...form, kabel_tube_odc_id: e.target.value, kabel_core_odc_id: '' })}
                    disabled={!form.kabel_odc_id}
                  >
                    <option value="">Pilih Kabel Tube</option>
                    {filteredTubesForOdc.map((tube: any) => (
                      <option key={tube.id} value={tube.id}>
                        {tube.warna_tube}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1">Kabel Core (opsional)</label>
                  <select
                    className="w-full border p-1"
                    value={form.kabel_core_odc_id}
                    onChange={(e) => setForm({ ...form, kabel_core_odc_id: e.target.value })}
                    disabled={!form.kabel_tube_odc_id}
                  >
                    <option value="">Pilih Kabel Core</option>
                    {filteredCoresForOdc.map((core: any) => (
                      <option key={core.id} value={core.id}>
                        {core.warna_core}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1">ODC ID (Opsional)</label>
                  <select
                    className="w-full border p-1"
                    value={form.odc_id}
                    onChange={(e) => setForm({ ...form, odc_id: e.target.value })}
                  >
                    <option value="">Pilih ODC</option>
                    {filteredOdcForOdc.map((odc) => (
                      <option key={odc.id} value={odc.id}>
                        {odc.nama_odc}
                      </option>
                    ))}
                  </select>
                  {form.kabel_odc_id && (
                    <p className="text-xs text-gray-500 mt-1">
                      Menampilkan ODC yang terhubung dengan kabel yang sama
                    </p>
                  )}
                </div>

                <div>
                  <label className="block mb-1">Tipe Splitter</label>
                  <select
                    className="w-full border p-1"
                    value={form.tipe_splitter}
                    onChange={(e) => setForm({ ...form, tipe_splitter: e.target.value })}
                  >
                    <option value="1:2">1:2</option>
                    <option value="1:4">1:4</option>
                    <option value="1:8">1:8</option>
                    <option value="1:16">1:16</option>
                    <option value="1:32">1:32</option>
                    <option value="1:64">1:64</option>
                    <option value="1:128">1:128</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block mb-1">Koordinat</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="any"
                  className="w-1/2 border p-1"
                  placeholder="Latitude"
                  value={form.latitude}
                  onChange={(e) => handleLatLongChange('latitude', e.target.value)}
                  required
                />
                <input
                  type="number"
                  step="any"
                  className="w-1/2 border p-1"
                  placeholder="Longitude"
                  value={form.longitude}
                  onChange={(e) => handleLatLongChange('longitude', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button type="button" className="bg-gray-300 px-2 py-1 rounded" onClick={onCancel}>
                Batal
              </button>
              <button type="submit" className="bg-blue-600 text-white px-2 py-1 rounded">
                Simpan
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddMarkerForm;


