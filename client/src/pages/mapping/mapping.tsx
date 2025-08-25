import { useEffect, useState } from 'react';
import { Page } from '$app/components/Breadcrumbs';
import { Default } from '$app/components/layouts/Default';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import Select from 'react-select';
import { useTranslation } from 'react-i18next';
import { MapCenterUpdater } from './utils/MapZoomer';
import { Polyline } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import ImportedAddMarkerForm from './components/AddMarkerForm';

type FormMode = 'client' | 'odp' | 'odc' | 'joint_box' | null;

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
  kabel_odc_id?: string;
  kabel_tube_odc_id?: string;
  nama_odc?: string;
  // joint box specific
  nama_joint_box?: string;
  odc_id?: string;
  odc_2_id?: string;
}






const MappingPage: React.FC = () => {
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [odps, setOdps] = useState<any[]>([]);
  const [odcs, setOdcs] = useState<any[]>([]);
  const [jointBoxes, setJointBoxes] = useState<any[]>([]);
  const [editData, setEditData] = useState<{ mode: 'client' | 'odp' | 'odc' | 'joint_box'; data: MarkerData; } | null>(null);
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
  const [legendPosition, setLegendPosition] = useState({ x: 12, y: 120 }); // <-- add this
  const [isDraggingLegend, setIsDraggingLegend] = useState(false); // <-- add this
  const [showLegend, setShowLegend] = useState(true); // <-- add this for legend visibility
  const [isLoading, setIsLoading] = useState(true); // <-- add loading state
  const [loadingProgress, setLoadingProgress] = useState({
    mainData: false,
    filterData: false,
    statistikData: false,
    mapCenter: false
  });
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


  const pages: Page[] = [{ name: t('Mapping'), href: '/mapping' }];

  // GET DATA CLIENT,ODP,ODC,JOINT_BOXES DARI API
  const fetchData = async () => {
    setLoadingProgress(prev => ({ ...prev, mainData: true }));
    try {
      const token = localStorage.getItem('X-API-TOKEN');
      const headers = { headers: { 'X-API-TOKEN': token || '' } };

      const [clientRes, odpRes, odcRes, jointBoxRes] = await Promise.all([
        axios.get(`${api}/api/v1/fo-client-ftths?status=active&per_page=250`, headers),
        axios.get(`${api}/api/v1/fo-odps?status=active&per_page=250`, headers),
        axios.get(`${api}/api/v1/fo-odcs?status=active&per_page=250`, headers),
        axios.get(`${api}/api/v1/fo-joint-boxes?status=active&per_page=250`, headers),
      ]);

      setClients(clientRes.data.data);
      setOdps(odpRes.data.data);
      setOdcs(odcRes.data.data);
      setJointBoxes(jointBoxRes.data.data);
    } catch (error) {
      console.error('Error fetching main data:', error);
    } finally {
      setLoadingProgress(prev => ({ ...prev, mainData: false }));
    }
  };


  // GET DATA FILTER DARI API
  const fetchFilterLokasi = async () => {
    setLoadingProgress(prev => ({ ...prev, filterData: true }));
    try {
      const token = localStorage.getItem('X-API-TOKEN');
      const headers = { headers: { 'X-API-TOKEN': token || '' } };

      const res = await axios.get(`${api}/api/v1/filter-lokasi`, headers);
      setFilterLokasi(res.data.data);
    } catch (err) {
      console.error('Gagal fetch filter lokasi:', err);
    } finally {
      setLoadingProgress(prev => ({ ...prev, filterData: false }));
    }
  };

  const fetchStatistikData = async () => {
    setLoadingProgress(prev => ({ ...prev, statistikData: true }));
    try {
      const token = localStorage.getItem('X-API-TOKEN');
      const headers = { headers: { 'X-API-TOKEN': token || '' } };

      const res = await axios.get(`${api}/api/v1/filter-lokasi/statistik`, headers);
      setStatistikData(res.data.data);
    } catch (err) {
      console.error('Gagal fetch statistik lokasi:', err);
    } finally {
      setLoadingProgress(prev => ({ ...prev, statistikData: false }));
    }
  };

  const fetchMapCenter = async () => {
    setLoadingProgress(prev => ({ ...prev, mapCenter: true }));
    try {
      const token = localStorage.getItem('X-API-TOKEN');
      const headers = { headers: { 'X-API-TOKEN': token || '' } };
      const res = await axios.get(`${api}/api/v1/map-center`, headers);
      const { latitude, longitude } = res.data;
      setSelectedCenter([parseFloat(latitude), parseFloat(longitude)]);
    } catch (err) {
      console.error('Gagal fetch Map Center:', err);
    } finally {
      setLoadingProgress(prev => ({ ...prev, mapCenter: false }));
    }
  };

  useEffect(() => {
    const loadAllData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchMapCenter(),
          fetchData(),
          fetchFilterLokasi(),
          fetchStatistikData()
        ]);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllData();
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

  // Use API-provided filterLokasi if present; otherwise derive from loaded resources
  const locationsSource = filterLokasi.length
    ? filterLokasi
    : (() => {
    const seen = new Map<string, any>();
    const allLocs: any[] = [
      ...clients.map((c: any) => c.lokasi).filter(Boolean),
      ...odps.map((o: any) => o.lokasi).filter(Boolean),
      ...odcs.map((o: any) => o.lokasi).filter(Boolean),
    ];
    allLocs.forEach((l: any) => {
      const prov = l.provinsi || l.province || '';
      const kota = l.kota || l.city || '';
      const key = `${prov}::${kota}`;
      if (!seen.has(key)) {
        seen.set(key, {
          provinsi: prov,
          kota: kota,
          latitude: l.latitude,
          longitude: l.longitude,
        });
      }
    });
    return Array.from(seen.values());
  })();

  const provinsiOptionsFormatted = Array.from(
    new Set(locationsSource.map((l: any) => l.provinsi).filter(Boolean))
  ).map((p: any) => ({ value: p, label: p }));

  const kotaOptionsFormatted = Array.from(
    new Set(
      locationsSource
        .filter((l: any) => !selectedProvinsi || l.provinsi === selectedProvinsi)
        .map((l: any) => l.kota)
        .filter(Boolean)
    )
  ).map((k: any) => ({ value: k, label: k }));

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

    const target = locationsSource.find((l: any) => l.provinsi === prov);
    if (target?.latitude && target?.longitude) {
      setSelectedCenter([parseFloat(target.latitude), parseFloat(target.longitude)]);
    } else {
      setSelectedCenter(mapDefaultCenter);
    }
  };

  const handleKotaChange = (kota: string) => {
    setSelectedKota(kota);
    updateJumlahByFilter(selectedProvinsi || '', kota);

    const target = locationsSource.find(
      (l: any) => l.kota === kota && (!selectedProvinsi || l.provinsi === selectedProvinsi)
    );
    if (target?.latitude && target?.longitude) {
      setSelectedCenter([parseFloat(target.latitude), parseFloat(target.longitude)]);
    } else {
      setSelectedCenter(mapDefaultCenter);
    }
  };

  const handleDelete = async (mode: 'client' | 'odp' | 'odc' | 'joint_box', id: number, lokasi_id: number) => {
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
      } else if (mode === 'joint_box') {
        await axios.delete(`${api}/api/v1/fo-joint-boxes/${id}`, headers);
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
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-white bg-opacity-90 z-[9999] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-lg font-semibold text-gray-700 mb-2">Loading Mapping Data...</div>
            <div className="text-sm text-gray-500 mb-4">Please wait while we fetch all the data</div>

            {/* Loading Progress Indicators */}
            <div className="space-y-2 text-sm">
              <div className={`flex items-center justify-between ${loadingProgress.mainData ? 'text-blue-600' : 'text-gray-400'}`}>
                <span>Main Data (Clients, ODPs, ODCs, Joint Boxes)</span>
                {loadingProgress.mainData && <span className="ml-2">⏳</span>}
              </div>
              <div className={`flex items-center justify-between ${loadingProgress.filterData ? 'text-blue-600' : 'text-gray-400'}`}>
                <span>Location Filters</span>
                {loadingProgress.filterData && <span className="ml-2">⏳</span>}
              </div>
              <div className={`flex items-center justify-between ${loadingProgress.statistikData ? 'text-blue-600' : 'text-gray-400'}`}>
                <span>Statistics Data</span>
                {loadingProgress.statistikData && <span className="ml-2">⏳</span>}
              </div>
              <div className={`flex items-center justify-between ${loadingProgress.mapCenter ? 'text-blue-600' : 'text-gray-400'}`}>
                <span>Map Center</span>
                {loadingProgress.mapCenter && <span className="ml-2">⏳</span>}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-x-2">
          <button
            className="bg-pink-600 text-white px-4 py-2 rounded mr-2"
            onClick={() => setShowKabelModal(true)}
          >
            Add Kabel
          </button>
          <button
            className="bg-purple-600 text-white px-4 py-2 rounded"
            onClick={() => setFormMode('odc' as FormMode)}
          >
            Add ODC
          </button>
          <button
            className="bg-green-500 text-white px-4 py-2 rounded"
            onClick={() => setFormMode('odp')}
          >
            Add ODP
          </button>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => setFormMode('client')}
          >
            Add Client
          </button>
          <button
            className="bg-amber-600 text-white px-4 py-2 rounded"
            onClick={() => setFormMode('joint_box' as FormMode)}
          >
            Add Joint Box
          </button>
          <button
            className="bg-gray-600 text-white px-4 py-2 rounded"
            onClick={() => setShowCenterModal(true)}
          >
            Set Center Map
          </button>
        </div>
        <div className="flex gap-4 w-full max-w-xl">
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

        {/* Legend Toggle Button */}
        <button
          onClick={() => setShowLegend(!showLegend)}
          className="absolute z-[1000] bg-white rounded shadow-md p-2 text-xs font-medium hover:bg-gray-50 transition-colors"
          style={{
            left: `${legendPosition.x}px`,
            top: `${legendPosition.y - 40}px`
          }}
        >
          {showLegend ? 'Hide Legend' : 'Show Legend'}
        </button>

        {/* Draggable Connection Legend */}
        <div
          className="absolute z-[999] bg-white rounded shadow-md p-4 w-56 cursor-move select-none"
          style={{
            left: `${legendPosition.x}px`,
            top: `${legendPosition.y}px`,
            display: showLegend ? 'block' : 'none'
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
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold">Markers & Koneksi</h3>
            <button
              onClick={() => setShowLegend(false)}
              className="text-gray-500 hover:text-gray-700 text-xs"
            >
              ✕
            </button>
          </div>
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
                <div className="w-6 h-2.5 bg-blue-500"></div>
                <span>ODC ➝ ODP</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-2.5 bg-red-500"></div>
                <span>ODP ➝ Client</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-2.5" style={{ backgroundImage: 'repeating-linear-gradient(to right, #a855f7 0px, #a855f7 2px, transparent 2px, transparent 4px)' }}></div>
                <span>ODC ➝ ODC</span>
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
                    <div className="text-base">
                      <strong>CLIENT</strong><br />
                      <b>Nama Client FTTH:</b> {client.nama_client || '-'}<br />
                      <b>Nama Client:</b> {client.client?.name || '-'}<br />
                      <b>Alamat:</b> {client.alamat || '-'}<br />
                      <b>ODC:</b> {client.odc?.nama_odc || '-'}<br />
                      <b>ODP:</b> {client.odp?.nama_odp || '-'}<br />
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
                              odp_id: client.odp_id?.toString(),
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
                    <div className="text-base">
                      <strong>Nama ODP:</strong> {odp.nama_odp}<br />
                      <strong>Deskripsi:</strong> {odp.deskripsi}<br />
                      <strong>Lokasi:</strong> {odp.lokasi.nama_lokasi}<br />
                      <strong>Kabel:</strong> {odp.kabel_core_odc?.kabel_odc?.nama_kabel || '-'}<br />
                      <strong>Kabel Core:</strong> {odp.kabel_core_odc?.warna_core}<br />
                      <strong>Kabel Tube:</strong> {odp.kabel_core_odc?.kabel_tube_odc?.warna_tube}<br />
                      <strong>Connected ODC:</strong> {odp.odc?.nama_odc}<br />
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
                              kabel_odc_id: odp.kabel_core_odc?.kabel_odc?.id?.toString(),
                              kabel_tube_odc_id: odp.kabel_core_odc?.kabel_tube_odc?.id?.toString(),
                              odc_id: odp.odc_id?.toString(),
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
                    <div className="text-base">
                      <strong>Nama ODC:</strong> {odc.nama_odc}<br />
                      <strong>Deskripsi:</strong> {odc.deskripsi}<br />
                      <strong>Lokasi:</strong> {odc.lokasi.nama_lokasi}<br />
                      <strong>Kabel:</strong> {odc.kabel_odc?.nama_kabel}<br />
                      <strong>Kabel Tube:</strong> {odc.kabel_core_odc?.kabel_tube_odc?.warna_tube || '-'}<br />
                      <strong>Kabel Core:</strong> {odc.kabel_core_odc?.warna_core || '-'}<br />
                      <strong>Connected ODC:</strong> {odc.connected_odc?.nama_odc || '-'}<br />
                      <strong>Tipe Splitter:</strong> {odc.tipe_splitter || '-'}<br />

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
                              kabel_odc_id: odc.kabel_odc_id?.toString(),
                              kabel_tube_odc_id: odc.kabel_core_odc?.kabel_tube_odc?.id?.toString(),
                              kabel_core_odc_id: odc.kabel_core_odc_id?.toString(),
                              tipe_splitter: odc.tipe_splitter,
                              odc_id: odc.odc_id?.toString(),
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
                    <div className="text-base">
                      <strong>Joint Box:</strong> {jointBox.nama_joint_box}<br />
                      <strong>Lokasi:</strong> {jointBox.lokasi?.nama_lokasi}<br />
                      <strong>Deskripsi:</strong> {jointBox.deskripsi || '-'}<br />
                      <strong>Kabel:</strong> {jointBox.kabel_odc?.nama_kabel || '-'}<br />
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
                          onClick={() => setEditData({
                            mode: 'joint_box',
                            data: {
                              id: jointBox.id,
                              lokasi_id: jointBox.lokasi.id,
                              nama_lokasi: jointBox.lokasi.nama_lokasi,
                              deskripsi: jointBox.lokasi.deskripsi,
                              latitude: String(jointBox.lokasi.latitude),
                              longitude: String(jointBox.lokasi.longitude),
                              nama_joint_box: jointBox.nama_joint_box,
                              kabel_odc_id: jointBox.kabel_odc?.id?.toString(),
                              odc_id: jointBox.odc_id?.toString(),
                              odc_2_id: jointBox.odc_2_id?.toString(),
                              odp_id: jointBox.odp_id?.toString(),
                              client_id: 0,
                            }
                          })}
                        >
                          Edit
                        </button>
                        <button
                          className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                          onClick={() => handleDelete('joint_box', jointBox.id, jointBox.lokasi.id)}
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
                  color: 'rgba(255, 0, 0, 0.7)',
                  weight: 2,
                }}
                eventHandlers={{
                  mouseover: (e) => {
                    e.target.setStyle({ weight: 6 });
                  },
                  mouseout: (e) => {
                    e.target.setStyle({ weight: 2 });
                  }
                }}
              >
                <Popup>
                  <div className="text-base">
                    <strong><i>ODP ➝ CLIENT</i></strong><br />
                    <b>ODP:</b> {client.odp?.nama_odp || '-'}<br />
                    <b>Client:</b> {client.nama_client || '-'}<br />
                    {client.odp?.kabel_core_odc?.kabel_tube_odc?.kabel_odc && (
                      <>
                        <b>Nama Kabel:</b> {client.odp.kabel_core_odc.kabel_tube_odc.kabel_odc.nama_kabel}<br />
                        <b>Jumlah Tube:</b> {client.odp.kabel_core_odc.kabel_tube_odc.kabel_odc.jumlah_tube}<br />
                        <b>Jumlah Core:</b> {client.odp.kabel_core_odc.kabel_tube_odc.kabel_odc.jumlah_total_core}<br />
                        <b>Core/Tube:</b> {client.odp.kabel_core_odc.kabel_tube_odc.kabel_odc.jumlah_core_in_tube}<br />
                        <b>Tipe Kabel:</b> {client.odp.kabel_core_odc.kabel_tube_odc.kabel_odc.tipe_kabel}<br />
                      </>
                    )}
                    <b>Jarak:</b> {distance.toFixed(2)} km
                  </div>
                </Popup>
              </Polyline>
            );
          })}





          {/* ODC to ODC Connections */}
          {showOdcConnections && (() => {
            type OdcConnection = { from: any; to: any; kabel_odc_id: number; kabel_odc: any; jointBox?: any; isDirect?: boolean; connectionType: string; bidirectional?: boolean };
            const connectionsMap = new Map<string, OdcConnection>();

            const makeKey = (a: number, b: number) => {
              const min = Math.min(a, b);
              const max = Math.max(a, b);
              return `${min}-${max}`;
            };

            const addOrMerge = (from: any, to: any, data: OdcConnection) => {
              const key = makeKey(from.id, to.id);
              const existing = connectionsMap.get(key);
              if (!existing) {
                connectionsMap.set(key, { ...data, from, to });
                return;
              }
              // Mark bidirectional if opposite direction observed
              connectionsMap.set(key, {
                ...existing,
                bidirectional: true,
                // Prefer stronger connection type: Joint Box > Direct > Legacy
                ...(existing.connectionType === 'Via Joint Box' ? {} :
                  data.connectionType === 'Via Joint Box' ? { ...data, from, to } :
                  existing.connectionType === 'Direct Connection' ? {} :
                  data.connectionType === 'Direct Connection' ? { ...data, from, to } : {})
              });
            };

            // 1) Explicit ODC→ODC via joint boxes
            jointBoxes.forEach(jointBox => {
              if (jointBox.odc_id && jointBox.odc_2_id) {
                const fromOdc = odcs.find(odc => odc.id === jointBox.odc_id);
                const toOdc = odcs.find(odc => odc.id === jointBox.odc_2_id);
                if (fromOdc && toOdc) {
                  addOrMerge(fromOdc, toOdc, {
                    from: fromOdc,
                    to: toOdc,
                    kabel_odc_id: jointBox.kabel_odc_id,
                    kabel_odc: fromOdc.kabel_odc,
                    jointBox: jointBox,
                    isDirect: false,
                    connectionType: 'Via Joint Box'
                  });
                }
              }
            });

            // 2) Direct ODC→ODC using odc_id
            odcs.forEach(odc => {
              if (odc.odc_id) {
                const connectedOdc = odcs.find(targetOdc => targetOdc.id === odc.odc_id);
                if (connectedOdc) {
                  const key = makeKey(odc.id, connectedOdc.id);
                  if (connectionsMap.has(key)) {
                    // Mark bidirectional
                    const prev = connectionsMap.get(key)!;
                    connectionsMap.set(key, { ...prev, bidirectional: true });
                  } else {
                    addOrMerge(odc, connectedOdc, {
                      from: odc,
                      to: connectedOdc,
                      kabel_odc_id: odc.kabel_odc_id || connectedOdc.kabel_odc_id,
                      kabel_odc: odc.kabel_odc || connectedOdc.kabel_odc,
                      jointBox: undefined,
                      isDirect: true,
                      connectionType: 'Direct Connection'
                    });
                  }
                }
              }
            });

            // 3) Legacy connections within same kabel_odc (fallback)
            const odcGroups = new Map<number, any[]>();
            odcs.forEach(odc => {
              if (odc.kabel_odc_id) {
                if (!odcGroups.has(odc.kabel_odc_id)) {
                  odcGroups.set(odc.kabel_odc_id, []);
                }
                odcGroups.get(odc.kabel_odc_id)!.push(odc);
              }
            });
            // Build a set of ODC ids that are already connected (via joint box or direct)
            const connectedIds = new Set<number>();
            connectionsMap.forEach((conn) => {
              connectedIds.add(conn.from.id);
              connectedIds.add(conn.to.id);
            });
            odcGroups.forEach((odcList, kabelOdcId) => {
              if (odcList.length > 1) {
                for (let i = 0; i < odcList.length; i++) {
                  for (let j = i + 1; j < odcList.length; j++) {
                    const key = makeKey(odcList[i].id, odcList[j].id);
                    // Only add legacy connection if there is no existing connection
                    // AND both ODCs currently have no other connections, to avoid unintended triangles
                    if (!connectionsMap.has(key)
                      && !connectedIds.has(odcList[i].id)
                      && !connectedIds.has(odcList[j].id)) {
                      addOrMerge(odcList[i], odcList[j], {
                        from: odcList[i],
                        to: odcList[j],
                        kabel_odc_id: kabelOdcId,
                        kabel_odc: odcList[i].kabel_odc,
                        jointBox: undefined,
                        isDirect: false,
                        connectionType: 'Legacy Connection'
                      });
                      // Update connectedIds to prevent creating multiple legacy links forming triangles
                      connectedIds.add(odcList[i].id);
                      connectedIds.add(odcList[j].id);
                    }
                  }
                }
              }
            });

            const odcConnections = Array.from(connectionsMap.values());

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
                  eventHandlers={{
                    mouseover: (e) => {
                      e.target.setStyle({ weight: 8 });
                    },
                    mouseout: (e) => {
                      e.target.setStyle({ weight: 3 });
                    }
                  }}
                >
                  <Popup>
                    <div className="text-base">
                      <strong><i>KABEL (ODC ➝ ODC)</i></strong><br />
                      <b>Connection Type:</b> {connection.bidirectional ? 'Bidirectional' : connection.connectionType || 'Direct'}<br />
                      <b>Nama Kabel:</b> {connection.kabel_odc?.nama_kabel || '-'}<br />
                      <b>From:</b> {connection.bidirectional ? `${connection.from.nama_odc} ↔ ${connection.to.nama_odc}` : connection.from.nama_odc}<br />
                      {!connection.bidirectional && <><b>To:</b> {connection.to.nama_odc}<br /></>}
                      {connection.jointBox && (
                        <>
                          <b>Via Joint Box:</b> {connection.jointBox.nama_joint_box}<br />
                        </>
                      )}
                      {connection.kabel_odc && (
                        <>
                          <b>Jumlah Tube:</b> {connection.kabel_odc.jumlah_tube}<br />
                          <b>Jumlah Core:</b> {connection.kabel_odc.jumlah_total_core}<br />
                          <b>Core/Tube:</b> {connection.kabel_odc.jumlah_core_in_tube}<br />
                          <b>Tipe Kabel:</b> {connection.kabel_odc.tipe_kabel}<br />
                          <b>Panjang Kabel:</b> {connection.kabel_odc.panjang_kabel} m<br />
                        </>
                      )}
                      <b>Jarak:</b> {distance.toFixed(2)} km
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
            // Look for joint boxes that explicitly connect this ODC to this ODP
            const jointBox = jointBoxes.find(jb =>
              jb.odc_id === odp.odc?.id && jb.odp_id === odp.id
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
              // Direct connection: ODC → ODP (only if no joint box exists)
              const arc = createSmoothArc(odcPos, odpPos);
              if (!arc) return null;

              positions = arc;
              distance = haversineDistance(odcPos, odpPos);
            }

            if (positions.some(p => isNaN(p[0]) || isNaN(p[1]))) return null;

            // Derive cable details with robust fallbacks:
            // 1) joint box kabel if present
            // 2) ODP's kabel via kabel_core_odc → kabel_tube_odc → kabel_odc
            // 3) ODC's kabel
            const derivedCable = jointBox?.kabel_odc
              || odp?.kabel_core_odc?.kabel_tube_odc?.kabel_odc
              || odp?.odc?.kabel_odc
              || null;

            return (
              <Polyline
                key={`line-odc-odp-${odp.id}`}
                positions={positions}
                pathOptions={{
                  color: 'rgba(0, 0, 230, 0.6)',
                  weight: 2,
                }}
                eventHandlers={{
                  mouseover: (e) => {
                    e.target.setStyle({ weight: 6 });
                  },
                  mouseout: (e) => {
                    e.target.setStyle({ weight: 2 });
                  }
                }}
              >
                <Popup>
                  <div className="text-base">
                    <strong><i>KABEL (ODC ➝ ODP)</i></strong><br />
                    <b>Nama Kabel:</b> {derivedCable?.nama_kabel || '-'}<br />
                    <b>ODC:</b> {odp.odc?.nama_odc || '-'}<br />
                    <b>ODP:</b> {odp.nama_odp || '-'}<br />
                    <b>Via Joint Box:</b> {jointBox?.nama_joint_box || '-'}<br />
                    <b>Jumlah Tube:</b> {derivedCable?.jumlah_tube ?? '-'}<br />
                    <b>Jumlah Core:</b> {derivedCable?.jumlah_total_core ?? '-'}<br />
                    <b>Core/Tube:</b> {derivedCable?.jumlah_core_in_tube ?? '-'}<br />
                    <b>Tipe Kabel:</b> {derivedCable?.tipe_kabel ?? '-'}<br />
                    <b>Panjang Kabel:</b> {derivedCable?.panjang_kabel ?? '-'} {derivedCable?.panjang_kabel ? 'm' : ''}<br />
                    <b>Jarak:</b> {distance.toFixed(2)} km
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
                  <div className="text-base">
                    <strong>Nama Joint Box:</strong> {jointBox.nama_joint_box}<br />
                    <b>Deskripsi:</b> {jointBox.deskripsi || '-'}<br />
                    <b>Lokasi:</b> {jointBox.lokasi?.nama_lokasi || '-'}<br />
                    <b>Kabel:</b> {jointBox.kabel_odc?.nama_kabel || '-'}<br />
                    {jointBox.odc && (
                      <>
                        <b>Connected ODC:</b> {jointBox.odc.nama_odc}<br />
                      </>
                    )}
                    {jointBox.odc2 && (
                      <>
                        <b>Connected ODC_2:</b> {jointBox.odc2.nama_odc}<br />
                      </>
                    )}
                    {jointBox.odp && (
                      <>
                        <b>Connected ODP:</b> {jointBox.odp.nama_odp}<br />
                      </>
                    )}
                    <div className="mt-2 flex gap-2">
                      <button
                        className="bg-yellow-400 px-2 py-1 rounded text-xs"
                        onClick={() => setEditData({
                          mode: 'joint_box',
                          data: {
                            id: jointBox.id,
                            lokasi_id: jointBox.lokasi.id,
                            nama_lokasi: jointBox.lokasi.nama_lokasi,
                            deskripsi: jointBox.lokasi.deskripsi,
                            latitude: String(jointBox.lokasi.latitude),
                            longitude: String(jointBox.lokasi.longitude),
                            nama_joint_box: jointBox.nama_joint_box,
                            kabel_odc_id: jointBox.kabel_odc?.id?.toString(),
                            odc_id: jointBox.odc_id?.toString(),
                            odc_2_id: jointBox.odc_2_id?.toString(),
                            odp_id: jointBox.odp_id?.toString(),
                            client_id: 0,
                          }
                        })}
                      >
                        Edit
                      </button>
                      <button
                        className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                        onClick={() => handleDelete('joint_box', jointBox.id, jointBox.lokasi.id)}
                      >
                        Delete
                      </button>
                    </div>
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
                <h2 className="text-lg font-semibold mb-4 text-center">Pilih Opsi Manajemen</h2>
                <div className="flex flex-col gap-2">
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                    onClick={() => {
                      navigate('/fo-kabel-odcs/create');
                      setShowKabelModal(false);
                    }}
                  >
                    Manajemen Kabel
                  </button>
                  <button
                    className="bg-purple-600 text-white px-4 py-2 rounded"
                    onClick={() => {
                      navigate('/fo-kabel-tube-odcs/create');
                      setShowKabelModal(false);
                    }}
                  >
                    Manajemen Tube Kabel
                  </button>
                  <button
                    className="bg-green-500 text-white px-4 py-2 rounded"
                    onClick={() => {
                      navigate('/fo-kabel-core-odcs/create');
                      setShowKabelModal(false);
                    }}
                  >
                    Manajemen Core Kabel
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
                {/* Info posisi sekarang */}
                {selectedCenter && (
                  <div className="mb-3 text-sm text-gray-800 bg-blue-50 border border-blue-200 rounded-md p-3">
                    <p>
                      Latitude saat ini:{" "}
                      <span className="font-semibold text-blue-700">{selectedCenter[0]}</span>
                    </p>
                    <p>
                      Longitude saat ini:{" "}
                      <span className="font-semibold text-blue-700">{selectedCenter[1]}</span>
                    </p>
                  </div>
                )}
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
            <ImportedAddMarkerForm
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
            <ImportedAddMarkerForm
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
