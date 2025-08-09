import { useEffect, useState } from 'react';
import { Page } from '$app/components/Breadcrumbs';
import { Default } from '$app/components/layouts/Default';
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  Popup,
} from 'react-leaflet';
import L, { LatLng } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import Select from 'react-select';
import { useTranslation } from 'react-i18next';
import { MapCenterUpdater } from './utils/MapZoomer';
import { Polyline } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';

type FormMode = 'client' | 'odp' | 'odc' | null;

interface MarkerData {
  id: number;
  lokasi_id: number;
  nama_lokasi: string;
  deskripsi: string;
  latitude: string;
  longitude: string;
  // client specific
  nama_client?: string;
  alamat?: string;
  odp_id?: string;
  client_id: number;
  // odp specific
  nama_odp?: string;
  tipe_splitter?: string;
  kabel_core_odc_id?: string;
  nama_odc?: string;
  kabel_odc_id?: string;
  // joint box specific
  nama_joint_box?: string;
  odc_id?: string;
}

interface AddMarkerFormProps {

  mode: 'client' | 'odp' | 'odc';
  onSave: () => void;
  onCancel: () => void;
  initialData?: Partial<MarkerData>;
  editingId?: number;
}

const AddMarkerForm: React.FC<AddMarkerFormProps> = ({ mode, onSave, onCancel, initialData, editingId }) => {
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
    nama: initialData?.nama_client || initialData?.nama_odp || initialData?.nama_odc || '',
    alamat: initialData?.alamat || '',
    odp_id: initialData?.odp_id || '',
    kabel_core_odc_id: initialData?.kabel_core_odc_id || '',
    tipe_splitter: initialData?.tipe_splitter || '1:8',
    latitude: initialData?.latitude || '',
    longitude: initialData?.longitude || '',
    client_id: initialData?.client_id || '',
    kabel_odc_id: initialData?.kabel_odc_id || '',
  });

  const allowMapClick = !position && form.nama_lokasi.trim() === '' && form.nama.trim() === '';

  const [odpList, setOdpList] = useState<any[]>([]);
  const [odcCoreList, setOdcCoreList] = useState<any[]>([]);
  const [clientList, setClientList] = useState<any[]>([]);
  const [kabelOdcList, setKabelOdcList] = useState<any[]>([]);
  const [formError, setFormError] = useState<string | null>(null);


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
          const res = await axios.get(`${api}/api/v1/fo-kabel-core-odcs/no-odp`, headers);
          setOdcCoreList(res.data.data);
        } else if (mode === 'odc') {
          const [res] = await Promise.all([
            axios.get(`${api}/api/v1/fo-kabel-odcs`, headers),
          ]);
          setKabelOdcList(res.data.data);
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
      const newForm = { ...f, [field]: value };
      const lat = parseFloat(newForm.latitude);
      const lng = parseFloat(newForm.longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        const newPos = new L.LatLng(lat, lng);
        setPosition(newPos);
      }
      return newForm;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!position) return alert('Klik lokasi di peta terlebih dahulu.');

    try {
      const token = localStorage.getItem('X-API-TOKEN');
      const headers = { headers: { 'X-API-TOKEN': token || '' } };

      if (editingId) {
        await axios.put(
          `${api}/api/v1/fo-lokasis/${initialData?.lokasi_id}`,
          {
            nama_lokasi: form.nama_lokasi,
            deskripsi: form.deskripsi,
            latitude: position.lat,
            longitude: position.lng,
          },
          headers
        );

        if (mode === 'client') {
          await axios.put(
            `${api}/api/v1/fo-client-ftths/${editingId}`,
            {
              lokasi_id: initialData?.lokasi_id,
              odp_id: form.odp_id,
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
              kabel_core_odc_id: form.kabel_core_odc_id,
              nama_odp: form.nama,
            },
            headers
          );
        } else if (mode === 'odc') {
          await axios.put(
            `${api}/api/v1/fo-odcs/${editingId}`,
            {
              lokasi_id: initialData?.lokasi_id,
              kabel_odc_id: form.kabel_odc_id,
              nama_odc: form.nama,
              tipe_splitter: form.tipe_splitter,
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
            latitude: position.lat,
            longitude: position.lng,
          },
          headers
        );

        const lokasi_id = lokasiRes.data.data.id;

        if (mode === 'client') {
          await axios.post(
            `${api}/api/v1/fo-client-ftths`,
            {
              lokasi_id,
              odp_id: form.odp_id || null,
              nama_client: form.nama,
              alamat: form.alamat,
              client_id: form.client_id || null,
            },
            headers
          );
        } else if (mode === 'odp') {
          await axios.post(
            `${api}/api/v1/fo-odps`,
            {
              lokasi_id,
              kabel_core_odc_id: form.kabel_core_odc_id,
              nama_odp: form.nama,
            },
            headers
          );
        } else if (mode === 'odc') {
          await axios.post(
            `${api}/api/v1/fo-odcs`,
            {
              lokasi_id,
              kabel_odc_id: form.kabel_odc_id,
              nama_odc: form.nama,
              tipe_splitter: form.tipe_splitter,
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
                  <label className="block mb-1">Kabel Core ODC</label>
                  <select
                    className="w-full border p-1"
                    value={form.kabel_core_odc_id}
                    onChange={(e) => setForm({ ...form, kabel_core_odc_id: e.target.value })}
                    required
                  >
                    <option value="">Pilih Kabel Core ODC</option>
                    {odcCoreList.map((core) => (
                      <option key={core.id} value={core.id}>
                        {core.warna_core}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {mode === 'odc' && (
              <>
                <div>
                  <label className="block mb-1">Kabel ODC</label>
                  <select
                    className="w-full border p-1"
                    value={form.kabel_odc_id}
                    onChange={(e) => setForm({ ...form, kabel_odc_id: e.target.value })}
                    required
                  >
                    <option value="">Pilih Kabel ODC</option>
                    {kabelOdcList.map((kabel) => (
                      <option key={kabel.id} value={kabel.id}>
                        {kabel.nama_kabel}
                      </option>
                    ))}
                  </select>
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

const MappingPage: React.FC = () => {
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [odps, setOdps] = useState<any[]>([]);
  const [odcs, setOdcs] = useState<any[]>([]);
  const [jointBoxes, setJointBoxes] = useState<any[]>([]);
  const [editData, setEditData] = useState<{ mode: 'client' | 'odp' | 'odc'; data: MarkerData; } | null>(null);
  const [t] = useTranslation();
  const [selectedProvinsi, setSelectedProvinsi] = useState('');
  const [selectedKota, setSelectedKota] = useState('');
  const [selectedCenter, setSelectedCenter] = useState<[number, number] | null>(null);
  const [showKabelModal, setShowKabelModal] = useState(false);
  const navigate = useNavigate();
  const [filterLokasi, setFilterLokasi] = useState<any[]>([]);
  const [statistikData, setStatistikData] = useState<any[]>([]);
  const [jumlahData, setJumlahData] = useState<{ client: number; odp: number; odc: number } | null>(null);
  const [coordinateWarning, setCoordinateWarning] = useState(false);
  const [validClients, setValidClients] = useState<any[]>([]);
  const [validOdps, setValidOdps] = useState<any[]>([]);
  const [showOdcConnections, setShowOdcConnections] = useState(true); // <-- add this
  const [legendPosition, setLegendPosition] = useState({ x: 16, y: 16 }); // <-- add this
  const [isDraggingLegend, setIsDraggingLegend] = useState(false); // <-- add this
  const api = "http://localhost:8000";

  // Add global mouse event listeners for dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingLegend) {
        setLegendPosition(prev => ({
          x: prev.x + e.movementX,
          y: prev.y + e.movementY
        }));
      }
    };

    const handleMouseUp = () => {
      setIsDraggingLegend(false);
    };

    if (isDraggingLegend) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingLegend]);

  const mapDefaultCenter: [number, number] = [-7.56526, 110.81653];
  const [latInput, setLatInput] = useState('');
  const [lngInput, setLngInput] = useState('');
  const [showCenterModal, setShowCenterModal] = useState(false);


  const pages: Page[] = [{ name: t('Mapping'), href: '/map' }];

  // GET DATA CLIENT,ODP,ODC,JOINT_BOXES DARI API
  const fetchData = async () => {
    const token = localStorage.getItem('X-API-TOKEN');
    const headers = { headers: { 'X-API-TOKEN': token || '' } };

    const [clientRes, odpRes, odcRes, jointBoxRes] = await Promise.all([
      axios.get(`${api}/api/v1/fo-client-ftths`, headers),
      axios.get(`${api}/api/v1/fo-odps`, headers),
      axios.get(`${api}/api/v1/fo-odcs`, headers),
      axios.get(`${api}/api/v1/fo-joint-boxes`, headers),
    ]);

    setClients(clientRes.data.data);
    setOdps(odpRes.data.data);
    setOdcs(odcRes.data.data);
    setJointBoxes(jointBoxRes.data.data);
  };


  // GET DATA FILTER DARI API
  const fetchFilterLokasi = async () => {
    try {
      const token = localStorage.getItem('X-API-TOKEN');
      const headers = { headers: { 'X-API-TOKEN': token || '' } };

      const res = await axios.get(`${api}/api/v1/filter-lokasi`, headers);
      setFilterLokasi(res.data.data);
    } catch (err) {
      console.error('Gagal fetch filter lokasi:', err);
    }
  };

  const fetchStatistikData = async () => {
    try {
      const token = localStorage.getItem('X-API-TOKEN');
      const headers = { headers: { 'X-API-TOKEN': token || '' } };

      const res = await axios.get(`${api}/api/v1/filter-lokasi/statistik`, headers);
      setStatistikData(res.data.data);
    } catch (err) {
      console.error('Gagal fetch statistik lokasi:', err);
    }
  };

  const fetchMapCenter = async () => {
    try {
      const token = localStorage.getItem('X-API-TOKEN');
      const headers = { headers: { 'X-API-TOKEN': token || '' } };
      const res = await axios.get(`${api}/api/v1/map-center`, headers);
      const { latitude, longitude } = res.data;
      setSelectedCenter([parseFloat(latitude), parseFloat(longitude)]);
    } catch (err) {
      console.error('Gagal fetch Map Center:', err);
    }
  };

  useEffect(() => {
    fetchMapCenter();
    fetchData();
    fetchFilterLokasi();
    fetchStatistikData();
  }, []);

  useEffect(() => {
    let hasInvalid = false;

    const filteredClients = clients.filter((client) => {
      const clientPos = getLatLng(client);
      const odpPos = getLatLng(client.odp);
      const odcPos = getLatLng(client.odc);

      const isValid = clientPos && odpPos && odcPos;

      if (!isValid) hasInvalid = true;

      return isValid;
    });

    const filteredOdps = odps.filter((odp) => {
      const odpPos = getLatLng(odp);
      const odcPos = getLatLng(odp.odc);

      const isValid = odpPos && odcPos;

      if (!isValid) hasInvalid = true;

      return isValid;
    });

    setValidClients(filteredClients);
    setValidOdps(filteredOdps);
    setCoordinateWarning(hasInvalid);
  }, [clients, odps]);

  const provinsiOptionsFormatted = Array.from(
    new Set(filterLokasi.map(l => l.provinsi).filter(Boolean))
  ).map(p => ({ value: p, label: p }));

  const kotaOptionsFormatted = Array.from(
    new Set(filterLokasi
      .filter(l => !selectedProvinsi || l.provinsi === selectedProvinsi)
      .map(l => l.kota)
      .filter(Boolean))
  ).map(k => ({ value: k, label: k }));

  const updateJumlahByFilter = (prov: string, kota?: string) => {
    const match = statistikData.find(s =>
      s.provinsi === prov && (!kota || s.kota === kota)
    );

    if (match) {
      setJumlahData({
        client: match.total_client || 0,
        odp: match.total_odp || 0,
        odc: match.total_odc || 0,
      });
    } else {
      setJumlahData(null);
    }
  };

  const getTotalByProvinsi = (provinsi: string) => {
    const filtered = statistikData.filter(s => s.provinsi === provinsi);

    return {
      client: filtered.reduce((sum, item) => sum + (item.total_client || 0), 0),
      odp: filtered.reduce((sum, item) => sum + (item.total_odp || 0), 0),
      odc: filtered.reduce((sum, item) => sum + (item.total_odc || 0), 0),
    };
  };

  const handleProvinsiChange = (prov: string) => {
    setSelectedProvinsi(prov);
    setSelectedKota('');

    const total = getTotalByProvinsi(prov);
    setJumlahData(total);

    const target = filterLokasi.find(l => l.provinsi === prov);
    if (target?.latitude && target?.longitude) {
      setSelectedCenter([parseFloat(target.latitude), parseFloat(target.longitude)]);
    } else {
      setSelectedCenter(mapDefaultCenter);
    }
  };

  const handleKotaChange = (kota: string) => {
    setSelectedKota(kota);
    updateJumlahByFilter(selectedProvinsi || '', kota);

    const target = filterLokasi.find(
      l => l.kota === kota && (!selectedProvinsi || l.provinsi === selectedProvinsi)
    );
    if (target?.latitude && target?.longitude) {
      setSelectedCenter([parseFloat(target.latitude), parseFloat(target.longitude)]);
    } else {
      setSelectedCenter(mapDefaultCenter);
    }
  };

  const handleDelete = async (mode: 'client' | 'odp' | 'odc', id: number, lokasi_id: number) => {
    if (!window.confirm('Yakin ingin menghapus data ini?')) return;

    try {
      const token = localStorage.getItem('X-API-TOKEN');
      const headers = { headers: { 'X-API-TOKEN': token || '' } };

      // Hapus data client/odp
      if (mode === 'client') {
        await axios.delete(`${api}/api/v1/fo-client-ftths/${id}`, headers);
      } else if (mode === 'odp') {
        await axios.delete(`${api}/api/v1/fo-odps/${id}`, headers);
      } else if (mode === 'odc') {
        await axios.delete(`${api}/api/v1/fo-odcs/${id}`, headers);
      }

      // Hapus lokasi terkait
      await axios.delete(`${api}/api/v1/fo-lokasis/${lokasi_id}`, headers);

      alert('Data berhasil dihapus.');
      fetchData();
    } catch (error) {
      console.error(error);
      alert('Gagal menghapus data.');
    }
  };

  const handleSaveMapCenter = async () => {
    if (!latInput || !lngInput) return alert('Isi koordinat lengkap');

    try {
      const token = localStorage.getItem('X-API-TOKEN');
      const headers = { headers: { 'X-API-TOKEN': token || '' } };

      await axios.post(`${api}/api/v1/map-center`, {
        latitude: parseFloat(latInput),
        longitude: parseFloat(lngInput),
      }, headers);

      setSelectedCenter([parseFloat(latInput), parseFloat(lngInput)]);
      alert('Pusat peta diperbarui!');
      setShowCenterModal(false);
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan center map.');
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

  const jointBoxIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    shadowSize: [41, 41],
  });

  const getLatLng = (item: any): [number, number] | null => {
    const lokasi = item?.lokasi ?? item;

    const latRaw = lokasi?.latitude;
    const lngRaw = lokasi?.longitude;

    if (
      latRaw === null || lngRaw === null ||
      latRaw === undefined || lngRaw === undefined ||
      latRaw === '' || lngRaw === ''
    ) {
      console.warn('Koordinat kosong atau tidak valid:', lokasi);
      return null;
    }

    const lat = typeof latRaw === 'number' ? latRaw : parseFloat(latRaw);
    const lng = typeof lngRaw === 'number' ? lngRaw : parseFloat(lngRaw);

    if (isNaN(lat) || isNaN(lng)) {
      console.warn('Koordinat tidak bisa diubah ke angka:', lokasi);
      return null;
    }

    return [lat, lng];
  };

  const safeParseLatLng = (lat: any, lng: any): [number, number] | null => {
    const parsedLat = typeof lat === 'number' ? lat : parseFloat(lat);
    const parsedLng = typeof lng === 'number' ? lng : parseFloat(lng);

    if (isNaN(parsedLat) || isNaN(parsedLng)) {
      console.warn('Invalid LatLng:', { lat, lng });
      return null;
    }

    return [parsedLat, parsedLng];
  };

  // Menghitung Jarak
  const haversineDistance = (
    [lat1, lon1]: [number, number],
    [lat2, lon2]: [number, number]
  ): number => {
    const R = 6371; // Radius bumi dalam kilometer
    const toRad = (deg: number) => deg * (Math.PI / 180);

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Membuat Garis Melengkung
  const createSmoothArc = (start: [number, number], end: [number, number], segments = 10): [number, number][] => {
    const [lat1, lng1] = start;
    const [lat2, lng2] = end;

    if ([lat1, lng1, lat2, lng2].some(coord => isNaN(coord))) {
      console.warn('createSmoothArc menerima nilai NaN:', { start, end });
      return [];
    }

    const midLat = (lat1 + lat2) / 2;
    const midLng = (lng1 + lng2) / 2;

    const dx = lng2 - lng1;
    const dy = lat2 - lat1;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // untuk membuat lengkungan ke atas
    const offsetFactor = 0.4;
    const normX = -dy / distance;
    const normY = dx / distance;

    const controlLat = midLat + normY * distance * offsetFactor;
    const controlLng = midLng + normX * distance * offsetFactor;

    const curvePoints: [number, number][] = [];
    for (let t = 0; t <= 1; t += 1 / segments) {
      const x = (1 - t) * (1 - t) * lng1 + 2 * (1 - t) * t * controlLng + t * t * lng2;
      const y = (1 - t) * (1 - t) * lat1 + 2 * (1 - t) * t * controlLat + t * t * lat2;
      curvePoints.push([y, x]);
    }

    return curvePoints;
  };

  return (
    <Default title={t('Mapping')} breadcrumbs={pages}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-x-2">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => setFormMode('client')}
          >
            Add Client
          </button>
          <button
            className="bg-green-500 text-white px-4 py-2 rounded"
            onClick={() => setFormMode('odp')}
          >
            Add ODP
          </button>
          <button
            className="bg-purple-600 text-white px-4 py-2 rounded"
            onClick={() => setFormMode('odc' as FormMode)}
          >
            Add ODC
          </button>
          <button
            className="bg-pink-600 text-white px-4 py-2 rounded"
            onClick={() => setShowKabelModal(true)}
          >
            Add Kabel
          </button>
          <button
            className="bg-gray-600 text-white px-4 py-2 rounded"
            onClick={() => setShowCenterModal(true)}
          >
            Set Center Map
          </button>
        </div>
        <div className="flex gap-4 w-full max-w-2xl">
          <div className="w-1/2">
            <Select
              placeholder="Pilih Provinsi"
              options={provinsiOptionsFormatted}
              value={provinsiOptionsFormatted.find(opt => opt.value === selectedProvinsi) || null}
              onChange={(e) => handleProvinsiChange(e?.value || '')}
              isClearable
            />
          </div>

          <div className="w-1/2">
            <Select
              placeholder="Pilih Kota/Kab"
              options={kotaOptionsFormatted}
              value={kotaOptionsFormatted.find(opt => opt.value === selectedKota) || null}
              onChange={(e) => handleKotaChange(e?.value || '')}
              isClearable
            />
          </div>
        </div>
      </div>

      <div className="h-[80vh] relative z-0">
        {(selectedProvinsi || selectedKota) && jumlahData && (
          <div className="absolute top-4 right-4 z-[999] bg-white rounded shadow-md p-4 w-64">
            <h3 className="text-lg font-semibold mb-2">Statistik Daerah</h3>
            <p><b>Jumlah Client:</b> {jumlahData.client}</p>
            <p><b>Jumlah ODP:</b> {jumlahData.odp}</p>
            <p><b>Jumlah ODC:</b> {jumlahData.odc}</p>
          </div>
        )}

        {/* Draggable Connection Legend */}
        <div
          className="absolute z-[999] bg-white rounded shadow-md p-4 w-56 cursor-move select-none"
          style={{
            left: `${legendPosition.x}px`,
            top: `${legendPosition.y}px`
          }}
          onMouseDown={(e) => {
            // Don't start dragging if clicking on interactive elements
            if ((e.target as HTMLElement).tagName === 'INPUT' ||
                (e.target as HTMLElement).tagName === 'BUTTON' ||
                (e.target as HTMLElement).closest('button') ||
                (e.target as HTMLElement).closest('input')) {
              return;
            }
            setIsDraggingLegend(true);
            e.preventDefault();
          }}
        >
          <h3 className="text-sm font-semibold mb-2">Markers & Koneksi</h3>
          <div className="space-y-2 text-xs">
            {/* Marker Legend */}
            <div className="mb-2">
              <div className="text-xs font-medium mb-1">Markers:</div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Client</span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>ODP</span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span>ODC</span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span>Joint Box</span>
              </div>
            </div>

            {/* Connection Legend */}
            <div className="border-t pt-2">
              <div className="text-xs font-medium mb-1">Connection Types:</div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-blue-500"></div>
                <span>ODC ➝ ODP</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-blue-500"></div>
                <span>ODP ➝ Client</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-fuchsia-500 border-t border-dashed border-fuchsia-500"></div>
                <span>ODC ➝ ODC</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>Joint Boxes act as intermediate connection points</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                checked={showOdcConnections}
                onChange={(e) => setShowOdcConnections(e.target.checked)}
                className="w-3 h-3"
              />
              <span>Tampilkan ODC Connections</span>
            </div>
            {showOdcConnections && (() => {
              const odcGroups = new Map<number, any[]>();
              odcs.forEach(odc => {
                if (odc.kabel_odc_id) {
                  if (!odcGroups.has(odc.kabel_odc_id)) {
                    odcGroups.set(odc.kabel_odc_id, []);
                  }
                  odcGroups.get(odc.kabel_odc_id)!.push(odc);
                }
              });
              const connectedGroups = Array.from(odcGroups.values()).filter(group => group.length > 1);
              const totalConnections = connectedGroups.reduce((sum, group) => sum + (group.length * (group.length - 1)) / 2, 0);

              return (
                <div className="text-xs text-gray-600 mt-1">
                  <div>ODC Groups: {connectedGroups.length}</div>
                  <div>Total Connections: {totalConnections}</div>
                </div>
              );
            })()}

            {/* Joint Box Statistics */}
            <div className="border-t pt-2 text-xs text-gray-600">
              <div>Joint Boxes: {jointBoxes.length}</div>
              <div>Connected ODCs: {jointBoxes.filter(jb => jb.odc).length}</div>
              <div>Connected ODPs: {jointBoxes.filter(jb => jb.odp).length}</div>
              <div className="text-xs text-gray-500 mt-1">
                Note: Joint boxes break up connections and route them through intermediate points
              </div>
            </div>
          </div>
        </div>

        <MapContainer center={selectedCenter || mapDefaultCenter} zoom={13} className="h-full w-full">
          <MapCenterUpdater center={selectedCenter || mapDefaultCenter} />
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {clients
            .map((client) => {
              const pos = safeParseLatLng(client?.lokasi?.latitude, client?.lokasi?.longitude);
              if (!pos) return null;
              return (
                <Marker key={`client-${client.id}`} position={pos} icon={clientIcon}
                >
                  <Popup>
                    <div>
                      <b>Client:</b> {client.nama_client}<br />
                      <b>Alamat:</b> {client.alamat}<br />
                      <b>ODC:</b> {client.odc?.nama_odc}<br />
                      <b>ODP:</b> {client.odp?.nama_odp}<br />
                      <b>Total Tagihan:</b>{' '}
                      {client.client?.invoices
                        ? client.client.invoices.reduce((total: number, inv: { amount: string; }) => total + parseFloat(inv.amount), 0).toLocaleString('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                        })
                        : 'Rp0'}
                      <br />
                      <b>Nama Paket:</b>{' '}
                      {client.client?.invoices?.length > 0 && client.client.invoices[0].line_items?.length > 0
                        ? client.client.invoices[0].line_items[0].product_key
                        : '-'}
                      <br />
                      <b>Status Invoice:</b>{' '}
                      {client.client?.invoices?.length > 0
                        ? client.client.invoices[0].status_id === 4
                          ? 'Lunas'
                          : 'Belum Lunas'
                        : '-'}
                      <br />
                      <div className="mt-2 flex gap-2">
                        <button
                          className="bg-yellow-400 px-2 py-1 rounded text-xs"
                          onClick={() => setEditData({
                            mode: 'client',
                            data: {
                              id: client.id,
                              lokasi_id: client.lokasi.id,
                              nama_lokasi: client.lokasi.nama_lokasi,
                              deskripsi: client.lokasi.deskripsi,
                              latitude: client.lokasi.latitude,
                              longitude: client.lokasi.longitude,
                              nama_client: client.nama_client,
                              alamat: client.alamat,
                              odp_id: client.odp_id,
                              client_id: client.client_id
                            }
                          })}
                        >
                          Edit
                        </button>
                        <button
                          className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                          onClick={() => handleDelete('client', client.id, client.lokasi.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

          {odps
            .map((odp) => {
              const pos = safeParseLatLng(odp?.lokasi?.latitude, odp?.lokasi?.longitude);
              if (!pos) return null;
              return (
                <Marker key={`odp-${odp.id}`} position={pos} icon={odpIcon}>
                  <Popup>
                    <div className="text-sm">
                      <strong>ODP:</strong> {odp.nama_odp}<br />
                      <strong>Lokasi:</strong> {odp.lokasi.nama_lokasi}<br />
                      <strong>Deskripsi:</strong> {odp.lokasi.deskripsi}<br />
                      <strong>Terhubung ke ODC:</strong> {odp.odc?.nama_odc}<br />
                      <div className="mt-2 flex gap-2">
                        <button
                          className="bg-yellow-400 px-2 py-1 rounded text-xs"
                          onClick={() => setEditData({
                            mode: 'odp', data: {
                              id: odp.id,
                              lokasi_id: odp.lokasi.id,
                              nama_lokasi: odp.lokasi.nama_lokasi,
                              deskripsi: odp.lokasi.deskripsi,
                              latitude: odp.lokasi.latitude,
                              longitude: odp.lokasi.longitude,
                              nama_odp: odp.nama_odp,
                              tipe_splitter: odp.tipe_splitter,
                              kabel_core_odc_id: odp.kabel_core_odc_id,
                              client_id: 0
                            }
                          })}
                        >
                          Edit
                        </button>
                        <button
                          className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                          onClick={() => handleDelete('odp', odp.id, odp.lokasi.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

          {odcs
            .map((odc) => {
              const pos = safeParseLatLng(odc?.lokasi?.latitude, odc?.lokasi?.longitude);
              if (!pos) return null;
              return (
                <Marker key={`odc-${odc.id}`} position={pos} icon={odcIcon}>
                  <Popup>
                    <div className="text-sm">
                      <strong>ODC:</strong> {odc.nama_odc}<br />
                      <strong>Lokasi:</strong> {odc.lokasi.nama_lokasi}<br />
                      <strong>Deskripsi:</strong> {odc.lokasi.deskripsi}<br />
                      <div className="mt-2 flex gap-2">
                        <button
                          className="bg-yellow-400 px-2 py-1 rounded text-xs"
                          onClick={() => setEditData({
                            mode: 'odc',
                            data: {
                              id: odc.id,
                              lokasi_id: odc.lokasi.id,
                              nama_lokasi: odc.lokasi.nama_lokasi,
                              deskripsi: odc.lokasi.deskripsi,
                              latitude: odc.lokasi.latitude,
                              longitude: odc.lokasi.longitude,
                              nama_odc: odc.nama_odc,
                              client_id: 0
                            }
                          })}
                        >
                          Edit
                        </button>
                        <button
                          className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                          onClick={() => handleDelete('odc' as any, odc.id, odc.lokasi.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

          {jointBoxes
            .map((jointBox) => {
              const pos = safeParseLatLng(jointBox?.lokasi?.latitude, jointBox?.lokasi?.longitude);
              if (!pos) return null;
              return (
                <Marker key={`jointbox-${jointBox.id}`} position={pos} icon={jointBoxIcon}>
                  <Popup>
                    <div className="text-sm">
                      <strong>Joint Box:</strong> {jointBox.nama_joint_box}<br />
                      <strong>Lokasi:</strong> {jointBox.lokasi?.nama_lokasi}<br />
                      <strong>Deskripsi:</strong> {jointBox.deskripsi || '-'}<br />
                      <strong>Kabel ODC:</strong> {jointBox.kabel_odc?.nama_kabel || '-'}<br />
                      {jointBox.odc && (
                        <>
                          <strong>Connected FROM ODC:</strong> {jointBox.odc.nama_odc}<br />
                          <strong>ODC Location:</strong> {jointBox.odc.lokasi?.nama_lokasi || '-'}<br />
                        </>
                      )}
                      {jointBox.odp && (
                        <>
                          <strong>Connected TO ODP:</strong> {jointBox.odp.nama_odp}<br />
                          <strong>ODP Location:</strong> {jointBox.odp.lokasi?.nama_lokasi || '-'}<br />
                        </>
                      )}
                      <div className="mt-2 flex gap-2">
                        <button
                          className="bg-yellow-400 px-2 py-1 rounded text-xs"
                          onClick={() => navigate(`/fo-joint-boxes/${jointBox.id}/edit`)}
                        >
                          Edit
                        </button>
                        <button
                          className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                          onClick={() => handleDelete('jointbox' as any, jointBox.id, jointBox.lokasi.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

          {validClients.map((client) => {
            const clientPos = getLatLng(client);
            const odpPos = getLatLng(client.odp);

            if (!clientPos || !odpPos) return null;

            if (isNaN(clientPos[0]) || isNaN(clientPos[1]) || isNaN(odpPos[0]) || isNaN(odpPos[1])) return null;

            const distance = haversineDistance(clientPos, odpPos);
            const arc = createSmoothArc(odpPos, clientPos);

            if (!arc || arc.some(p => isNaN(p[0]) || isNaN(p[1]))) return null;

            return (
              <Polyline
                key={`line-odp-client-${client.id}`}
                positions={createSmoothArc(odpPos, clientPos)}
                pathOptions={{
                  color: 'rgba(0, 0, 230, 0.6)',
                  weight: 2,
                }}
              >
                <Popup>
                  <div>
                    <strong>ODP ➝ Client</strong><br />
                    Dari: {client.odp?.nama_odp}<br />
                    Ke: {client.nama_client}<br />
                    <span>Jarak: {distance.toFixed(2)} km</span>
                  </div>
                </Popup>
              </Polyline>
            );
          })}



          {validOdps.map((odp) => {
            const odpPos = getLatLng(odp);
            const odcPos = getLatLng(odp.odc);

            if (!odpPos || !odcPos) return null;

            if (isNaN(odpPos[0]) || isNaN(odpPos[1]) || isNaN(odcPos[0]) || isNaN(odcPos[1])) return null;

            const distance = haversineDistance(odpPos, odcPos);
            const arc = createSmoothArc(odcPos, odpPos);

            if (!arc || arc.some(p => isNaN(p[0]) || isNaN(p[1]))) return null;

            return (
              <Polyline
                key={`line-odc-odp-${odp.id}`}
                positions={createSmoothArc(odcPos, odpPos)}
                pathOptions={{
                  color: 'rgba(0, 0, 230, 0.6)',
                  weight: 2,
                }}
              >
                <Popup>
                  <div>
                    <strong>ODC ➝ ODP</strong><br />
                    Dari: {odp.odc?.nama_odc || 'ODC'}<br />
                    Ke: {odp.nama_odp}<br />
                    <span>Jarak: {distance.toFixed(2)} km</span>
                  </div>
                </Popup>
              </Polyline>
            );
          })}

          {/* ODC to ODC Connections */}
          {showOdcConnections && (() => {
            const odcConnections: { from: any; to: any; kabel_odc_id: number; kabel_odc: any; jointBox?: any }[] = [];

            // Group ODCs by kabel_odc_id
            const odcGroups = new Map<number, any[]>();
            odcs.forEach(odc => {
              if (odc.kabel_odc_id) {
                if (!odcGroups.has(odc.kabel_odc_id)) {
                  odcGroups.set(odc.kabel_odc_id, []);
                }
                odcGroups.get(odc.kabel_odc_id)!.push(odc);
              }
            });

            // Create connections between ODCs in the same group
            odcGroups.forEach((odcList, kabelOdcId) => {
              if (odcList.length > 1) {
                // Create connections between all ODCs in the group
                for (let i = 0; i < odcList.length; i++) {
                  for (let j = i + 1; j < odcList.length; j++) {
                    // Check if there's a joint box that connects these ODCs
                    const jointBox = jointBoxes.find(jb =>
                      (jb.odc_id === odcList[i].id && jb.kabel_odc_id === kabelOdcId) ||
                      (jb.odc_id === odcList[j].id && jb.kabel_odc_id === kabelOdcId)
                    );

                    odcConnections.push({
                      from: odcList[i],
                      to: odcList[j],
                      kabel_odc_id: kabelOdcId,
                      kabel_odc: odcList[i].kabel_odc, // Use the kabel_odc object from the first ODC
                      jointBox: jointBox || undefined
                    });
                  }
                }
              }
            });

            return odcConnections.map((connection) => {
              const fromPos = getLatLng(connection.from);
              const toPos = getLatLng(connection.to);

              if (!fromPos || !toPos) return null;

              if (isNaN(fromPos[0]) || isNaN(fromPos[1]) || isNaN(toPos[0]) || isNaN(toPos[1])) return null;

              let positions: [number, number][];
              let distance: number;

              if (connection.jointBox) {
                // Route through joint box: ODC → Joint Box → ODC
                const jointBoxPos = getLatLng(connection.jointBox);
                if (!jointBoxPos) return null;

                const arc1 = createSmoothArc(fromPos, jointBoxPos);
                const arc2 = createSmoothArc(jointBoxPos, toPos);

                if (!arc1 || !arc2) return null;

                // Combine the two arcs
                positions = [...arc1, ...arc2];
                distance = haversineDistance(fromPos, jointBoxPos) + haversineDistance(jointBoxPos, toPos);
              } else {
                // Direct connection: ODC → ODC
                const arc = createSmoothArc(fromPos, toPos);
                if (!arc) return null;

                positions = arc;
                distance = haversineDistance(fromPos, toPos);
              }

              if (positions.some(p => isNaN(p[0]) || isNaN(p[1]))) return null;

              return (
                <Polyline
                  key={`line-odc-odc-${connection.from.id}-${connection.to.id}`}
                  positions={positions}
                  pathOptions={{
                    color: 'rgba(255, 0, 255, 0.7)', // Magenta color for ODC-ODC connections
                    weight: 3,
                    dashArray: '5, 5', // Dashed line to distinguish from other connections
                  }}
                >
                  <Popup>
                    <div>
                      <strong>ODC ➝ ODC</strong><br />
                      Dari: {connection.from.nama_odc}<br />
                      Ke: {connection.to.nama_odc}<br />
                      {connection.jointBox && (
                        <>
                          <span>Via Joint Box: {connection.jointBox.nama_joint_box}</span><br />
                        </>
                      )}
                      <span>Kabel ODC ID: {connection.kabel_odc_id}</span><br />
                      {connection.kabel_odc && (
                        <>
                          <span>Nama Kabel: {connection.kabel_odc.nama_kabel}</span><br />
                          <span>Tipe Kabel: {connection.kabel_odc.tipe_kabel}</span><br />
                          <span>Panjang: {connection.kabel_odc.panjang_kabel} m</span><br />
                        </>
                      )}
                      <span>Jarak: {distance.toFixed(2)} km</span>
                    </div>
                  </Popup>
                </Polyline>
              );
            });
          })()}

          {/* ODC to ODP Connections - Modified to route through joint boxes */}
          {validOdps.map((odp) => {
            const odpPos = getLatLng(odp);
            const odcPos = getLatLng(odp.odc);

            if (!odpPos || !odcPos) return null;

            if (isNaN(odpPos[0]) || isNaN(odpPos[1]) || isNaN(odcPos[0]) || isNaN(odcPos[1])) return null;

            // Check if there's a joint box between this ODC and ODP
            // Look for joint boxes that connect this ODC to this ODP, or are part of the same cable system
            const jointBox = jointBoxes.find(jb =>
              (jb.odc_id === odp.odc?.id && jb.odp_id === odp.id) ||
              (jb.kabel_odc_id === odp.odc?.kabel_odc_id && jb.odc_id === odp.odc?.id)
            );

            let positions: [number, number][];
            let distance: number;

            if (jointBox) {
              // Route through joint box: ODC → Joint Box → ODP
              const jointBoxPos = getLatLng(jointBox);
              if (!jointBoxPos) return null;

              const arc1 = createSmoothArc(odcPos, jointBoxPos);
              const arc2 = createSmoothArc(jointBoxPos, odpPos);

              if (!arc1 || !arc2) return null;

              // Combine the two arcs
              positions = [...arc1, ...arc2];
              distance = haversineDistance(odcPos, jointBoxPos) + haversineDistance(jointBoxPos, odpPos);
            } else {
              // Direct connection: ODC → ODP
              const arc = createSmoothArc(odcPos, odpPos);
              if (!arc) return null;

              positions = arc;
              distance = haversineDistance(odcPos, odpPos);
            }

            if (positions.some(p => isNaN(p[0]) || isNaN(p[1]))) return null;

            return (
              <Polyline
                key={`line-odc-odp-${odp.id}`}
                positions={positions}
                pathOptions={{
                  color: 'rgba(0, 0, 230, 0.6)',
                  weight: 2,
                }}
              >
                <Popup>
                  <div>
                    <strong>ODC ➝ ODP</strong><br />
                    Dari: {odp.odc?.nama_odc || 'ODC'}<br />
                    Ke: {odp.nama_odp}<br />
                    {jointBox && (
                      <>
                        <span>Via Joint Box: {jointBox.nama_joint_box}</span><br />
                      </>
                    )}
                    <span>Jarak: {distance.toFixed(2)} km</span>
                  </div>
                </Popup>
              </Polyline>
            );
          })}

          {/* Joint Box Markers - Only markers, no separate connections */}
          {jointBoxes.map((jointBox) => {
            const pos = getLatLng(jointBox);
            if (!pos) return null;

            return (
              <Marker key={`jointbox-${jointBox.id}`} position={pos} icon={jointBoxIcon}>
                <Popup>
                  <div>
                    <strong>Joint Box:</strong> {jointBox.nama_joint_box}<br />
                    <b>Lokasi:</b> {jointBox.lokasi?.nama_lokasi}<br />
                    <b>Deskripsi:</b> {jointBox.deskripsi || '-'}<br />
                    {jointBox.odc && (
                      <>
                        <b>Connected ODC:</b> {jointBox.odc.nama_odc}<br />
                        <b>ODC Location:</b> {jointBox.odc.lokasi?.nama_lokasi}<br />
                      </>
                    )}
                    {jointBox.odp && (
                      <>
                        <b>Connected ODP:</b> {jointBox.odp.nama_odp}<br />
                        <b>ODP Location:</b> {jointBox.odp.lokasi?.nama_lokasi}<br />
                      </>
                    )}
                    {jointBox.kabel_odc && (
                      <>
                        <b>Kabel:</b> {jointBox.kabel_odc.nama_kabel}<br />
                        <b>Tipe:</b> {jointBox.kabel_odc.tipe_kabel}<br />
                        <b>Panjang:</b> {jointBox.kabel_odc.panjang_kabel} m<br />
                      </>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {coordinateWarning && (
            <div style={{ color: 'red', marginTop: '10px' }}>
              ⚠️ Ada koordinat yang tidak terdeteksi. Beberapa garis mungkin tidak ditampilkan.
            </div>
          )}


          {/* Modal Kabel */}
          {showKabelModal && (
            <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white rounded-lg p-6 w-80 shadow-lg z-[1001]">
                <h2 className="text-lg font-semibold mb-4 text-center">Pilih Jenis Kabel</h2>
                <div className="flex flex-col gap-2">
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                    onClick={() => {
                      navigate('/fo-kabel-odcs/create');
                      setShowKabelModal(false);
                    }}
                  >
                    Kabel ODC
                  </button>
                  <button
                    className="bg-purple-600 text-white px-4 py-2 rounded"
                    onClick={() => {
                      navigate('/fo-kabel-tube-odcs/create');
                      setShowKabelModal(false);
                    }}
                  >
                    Kabel Tube ODC
                  </button>
                  <button
                    className="bg-green-500 text-white px-4 py-2 rounded"
                    onClick={() => {
                      navigate('/fo-kabel-core-odcs/create');
                      setShowKabelModal(false);
                    }}
                  >
                    Kabel Core ODC
                  </button>
                  <button
                    className="mt-2 text-gray-600 hover:underline"
                    onClick={() => setShowKabelModal(false)}
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>
          )}

          {showCenterModal && (
            <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white rounded-lg shadow-md p-6 w-[300px]">
                <h2 className="text-lg font-semibold mb-4">Set Map Center</h2>
                <div className="flex flex-col gap-2">
                  <input
                    type="number"
                    placeholder="Latitude"
                    value={latInput}
                    onChange={(e) => setLatInput(e.target.value)}
                    className="border px-2 py-1 rounded"
                  />
                  <input
                    type="number"
                    placeholder="Longitude"
                    value={lngInput}
                    onChange={(e) => setLngInput(e.target.value)}
                    className="border px-2 py-1 rounded"
                  />
                </div>
                <div className="flex justify-end mt-4 gap-2">
                  <button
                    className="px-4 py-1 bg-gray-300 rounded hover:bg-gray-400"
                    onClick={() => setShowCenterModal(false)}
                  >
                    Batal
                  </button>
                  <button
                    className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={handleSaveMapCenter}
                  >
                    Simpan
                  </button>
                </div>
              </div>
            </div>
          )}


          {/* Form Add */}
          {formMode && !editData && (
            <AddMarkerForm
              mode={formMode}
              onCancel={() => setFormMode(null)}
              onSave={() => {
                setFormMode(null);
                fetchData();
              }}
            />
          )}

          {/* Form Edit */}
          {editData && (
            <AddMarkerForm
              mode={editData.mode}
              initialData={editData.data}
              editingId={editData.data.id}
              onCancel={() => setEditData(null)}
              onSave={() => {
                setEditData(null);
                fetchData();
              }}
            />
          )}
        </MapContainer>
      </div>
    </Default>
  );
};

export default MappingPage;
