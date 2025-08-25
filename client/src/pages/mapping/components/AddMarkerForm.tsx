import { useEffect, useMemo, useRef, useState } from 'react';
import L, { LatLng } from 'leaflet';
import { Marker, useMap, useMapEvents } from 'react-leaflet';
import axios from 'axios';
import Select from 'react-select';

export type FormMode = 'client' | 'odp' | 'odc' | 'joint_box';

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
  odc_2_id?: string;
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
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const map = useMap();
  const [isOptionsLoading, setIsOptionsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectCommonProps: any = useMemo(() => ({
    menuPortalTarget: document.body,
    menuPosition: 'fixed',
    closeMenuOnScroll: false,
    menuShouldScrollIntoView: false,
    captureMenuScroll: true,
    onMenuOpen: () => {
      try {
        map.dragging.disable();
        map.scrollWheelZoom.disable();
        // Prevent map shortcuts interfering with input
        (map as any).keyboard?.disable?.();
        // Prevent double click zoom while menu is open
        map.doubleClickZoom?.disable?.();
      } catch {
        /* ignore errors disabling map handlers */
      }
    },
    onMenuClose: () => {
      try {
        map.dragging.enable();
        map.scrollWheelZoom.enable();
        (map as any).keyboard?.enable?.();
        map.doubleClickZoom?.enable?.();
      } catch {
        /* ignore errors enabling map handlers */
      }
    },
    styles: {
      menuPortal: (base: any) => ({ ...base, zIndex: 999999, pointerEvents: 'auto' }),
      menu: (base: any) => ({ ...base, zIndex: 999999, pointerEvents: 'auto' }),
      control: (base: any) => ({ ...base, cursor: 'text' }),
      valueContainer: (base: any) => ({ ...base, cursor: 'text' }),
    },
  }), [map]);
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
    deskripsi_odc: mode === 'odc' ? ((initialData as any)?.deskripsi_odc || initialData?.deskripsi || '') : '',
    deskripsi_odp: mode === 'odp' ? initialData?.deskripsi || '' : '',
    nama: initialData?.nama_client || initialData?.nama_odp || initialData?.nama_odc || initialData?.nama_joint_box || '',
    alamat: initialData?.alamat || '',
    deskripsi_client: (initialData as any)?.deskripsi_client || '',
    odp_id: initialData?.odp_id || '',
    kabel_core_odc_id: initialData?.kabel_core_odc_id || '',
    tipe_splitter: initialData?.tipe_splitter || '1:8',
    latitude: initialData?.latitude || '',
    longitude: initialData?.longitude || '',
    client_id: initialData?.client_id || '',
    kabel_odc_id: initialData?.kabel_odc_id || '',
    kabel_tube_odc_id: initialData?.kabel_tube_odc_id || '',
    odc_id: initialData?.odc_id || '',
    odc_2_id: (initialData as any)?.odc_2_id || '',
    deskripsi_joint_box: (initialData as any)?.deskripsi_joint_box || '',
  });

  const allowMapClick = !position && form.nama_lokasi.trim() === '' && form.nama.trim() === '';

  const [odpList, setOdpList] = useState<any[]>([]);
  const [odcCoreList, setOdcCoreList] = useState<any[]>([]);
  const [clientList, setClientList] = useState<any[]>([]);
  const [kabelOdcList, setKabelOdcList] = useState<any[]>([]);
  const [kabelTubeList, setKabelTubeList] = useState<any[]>([]);
  const [odcList, setOdcList] = useState<ODC[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [jbConnectionType, setJbConnectionType] = useState<'odc-odc' | 'odc-odp' | ''>('');

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
        deskripsi_odc: mode === 'odc' ? ((initialData as any).deskripsi_odc || initialData.deskripsi || '') : '',
        deskripsi_odp: mode === 'odp' ? (initialData as any).deskripsi_odp || initialData.deskripsi || '' : '',
        nama: initialData.nama_client || initialData.nama_odp || initialData.nama_odc || (initialData as any).nama_joint_box || '',
        alamat: initialData.alamat || '',
        deskripsi_client: (initialData as any).deskripsi_client || '',
        odp_id: initialData.odp_id || '',
        kabel_core_odc_id: (initialData as any).kabel_core_odc_id?.toString?.() || initialData.kabel_core_odc_id || '',
        tipe_splitter: initialData.tipe_splitter || '1:8',
        latitude: initialData.latitude || '',
        longitude: initialData.longitude || '',
        client_id: initialData.client_id || '',
        kabel_odc_id: initialData.kabel_odc_id || '',
        kabel_tube_odc_id: initialData.kabel_tube_odc_id || '',
        odc_id: initialData.odc_id || '',
        odc_2_id: (initialData as any).odc_2_id || '',
        deskripsi_joint_box: (initialData as any).deskripsi_joint_box || '',
      });
      if (mode === 'joint_box') {
        const hasOdcOdc = Boolean(initialData.odc_id) && Boolean((initialData as any).odc_2_id);
        const hasOdcOdp = Boolean(initialData.odc_id) && Boolean((initialData as any).odp_id);
        setJbConnectionType(hasOdcOdc ? 'odc-odc' : hasOdcOdp ? 'odc-odp' : '');
      }
    }
  }, [initialData, mode]);

  useEffect(() => {
    // Keep scroll events local to the form area, but do not block click events needed by React
    if (scrollAreaRef.current) {
      try {
        L.DomEvent.disableScrollPropagation(scrollAreaRef.current);
        // Stop key events from bubbling to the map while typing/searching
        scrollAreaRef.current.addEventListener('keydown', (e) => {
          e.stopPropagation();
        });
      } catch {
        /* ignore DOM event setup failures */
      }
    }

    if (containerRef.current) {
      try {
        L.DomEvent.disableScrollPropagation(containerRef.current);
        // Do NOT stop click propagation at the native layer; this breaks React onClick
      } catch {
        /* ignore DOM event setup failures */
      }
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsOptionsLoading(true);
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
        } else if (mode === 'joint_box') {
          const [lokOdcRes, odcRes, odpRes] = await Promise.all([
            axios.get(`${api}/api/v1/fo-kabel-odcs`, headers),
            axios.get(`${api}/api/v1/fo-odcs`, headers),
            axios.get(`${api}/api/v1/fo-odps`, headers),
          ]);
          setKabelOdcList(lokOdcRes.data.data);
          setOdcList(odcRes.data.data as any);
          setOdpList(odpRes.data.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsOptionsLoading(false);
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
    } else if (mode === 'joint_box') {
      if (!form.kabel_odc_id) return 'Kabel harus dipilih untuk Joint Box.';
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
      setIsSubmitting(true);
      const token = localStorage.getItem('X-API-TOKEN');
      const headers = { headers: { 'X-API-TOKEN': token || '' } };

      // Normalize IDs to numbers or null to match form behavior elsewhere
      const parsedIds = {
        odp_id: form.odp_id ? parseInt(String(form.odp_id), 10) : null,
        client_id: form.client_id && String(form.client_id).trim() !== '' ? form.client_id : null,
        kabel_core_odc_id: form.kabel_core_odc_id ? parseInt(String(form.kabel_core_odc_id), 10) : null,
        kabel_odc_id: form.kabel_odc_id ? parseInt(String(form.kabel_odc_id), 10) : null,
        odc_id: form.odc_id ? parseInt(String(form.odc_id), 10) : null,
        odc_2_id: form.odc_2_id ? parseInt(String(form.odc_2_id), 10) : null,
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
              deskripsi: (form as any).deskripsi_client || undefined,
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
        } else if (mode === 'joint_box') {
          await axios.put(
            `${api}/api/v1/fo-joint-boxes/${editingId}`,
            {
              lokasi_id: initialData?.lokasi_id,
              kabel_odc_id: parsedIds.kabel_odc_id,
              odc_id: parsedIds.odc_id,
              odc_2_id: parsedIds.odc_2_id,
              odp_id: parsedIds.odp_id,
              nama_joint_box: form.nama,
              deskripsi: (form as any).deskripsi_joint_box || undefined,
              status: 'active',
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
              deskripsi: (form as any).deskripsi_client || undefined,
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
        } else if (mode === 'joint_box') {
          await axios.post(
            `${api}/api/v1/fo-joint-boxes`,
            {
              lokasi_id,
              kabel_odc_id: parsedIds.kabel_odc_id,
              odc_id: parsedIds.odc_id,
              odc_2_id: parsedIds.odc_2_id,
              odp_id: parsedIds.odp_id,
              nama_joint_box: form.nama,
              deskripsi: (form as any).deskripsi_joint_box || undefined,
              status: 'active',
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
    } finally {
      setIsSubmitting(false);
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
                : mode === 'odc'
                  ? odcIcon
                  : jointBoxIcon
          }
          eventHandlers={{ dragend: onMarkerDragEnd }}
        />
      )}

      <div
        ref={containerRef}
        className="absolute top-10 right-4 bg-white p-4 shadow-md rounded z-[99999] w-[320px] max-h-[80vh] overflow-auto pointer-events-auto"
        // Let React handle clicks; we only want to block map interactions while menus are open
      >
        <h3 className="font-semibold mb-2">
          {editingId
            ? (mode === 'client' ? 'Edit Client' : mode === 'odp' ? 'Edit ODP' : mode === 'odc' ? 'Edit ODC' : 'Edit Joint Box')
            : (mode === 'client' ? 'Tambah Client' : mode === 'odp' ? 'Tambah ODP' : mode === 'odc' ? 'Tambah ODC' : 'Tambah Joint Box')}
        </h3>
        {isOptionsLoading && (
          <div className="mb-2 text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded px-3 py-2">
            Memuat data pilihan... Mohon tunggu.
          </div>
        )}
        {isSubmitting && (
          <div className="mb-2 text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded px-3 py-2">
            Menyimpan data... Mohon tunggu.
          </div>
        )}
        <p className="mb-2 text-xs text-gray-600">Klik peta untuk memilih lokasi atau edit latitude dan longitude di bawah</p>
        <div
          ref={scrollAreaRef}
          className="max-h-[55vh] overflow-y-auto px-4"
        >
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
                {mode === 'client' ? 'Nama Client FTTH' : mode === 'odp' ? 'Nama ODP' : mode === 'odc' ? 'Nama ODC' : 'Nama Joint Box'}
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
                  <Select
                    className="w-full"
                    classNamePrefix="select"
                    options={odpList.map((o:any)=>({ value: o.id.toString(), label: o.nama_odp }))}
                    value={odpList.find((o:any)=> o.id.toString()===form.odp_id) ? { value: form.odp_id, label: odpList.find((o:any)=> o.id.toString()===form.odp_id)?.nama_odp } : null}
                    onChange={(opt:any)=> setForm({ ...form, odp_id: opt?.value || '' })}
                    placeholder="Pilih ODP"
                    isClearable
                    isSearchable
                    {...selectCommonProps}
                  />
                </div>

                <div>
                  <label className="block mb-1">Client ID</label>
                  <Select
                    className="w-full"
                    classNamePrefix="select"
                    options={clientList.map((c:any)=>({ value: c.id.toString(), label: c.name || c.nama_client || `Client #${c.id}` }))}
                    value={clientList.find((c:any)=> c.id.toString()===String(form.client_id)) ? { value: String(form.client_id), label: clientList.find((c:any)=> c.id.toString()===String(form.client_id))?.name || clientList.find((c:any)=> c.id.toString()===String(form.client_id))?.nama_client || `Client #${form.client_id}` } : null}
                    onChange={(opt:any)=> setForm({ ...form, client_id: opt?.value || '' })}
                    placeholder="Pilih Client ID"
                    isClearable
                    isSearchable
                    {...selectCommonProps}
                  />
                </div>
              </>
            )}

            {mode === 'odp' && (
              <>
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
                  <label className="block mb-1">Kabel</label>
                  <Select
                    className="w-full"
                    classNamePrefix="select"
                    options={kabelOdcList.map((k:any)=>({ value: k.id.toString(), label: k.nama_kabel }))}
                    value={kabelOdcList.find((k:any)=> k.id.toString()===form.kabel_odc_id) ? { value: form.kabel_odc_id, label: kabelOdcList.find((k:any)=> k.id.toString()===form.kabel_odc_id)?.nama_kabel } : null}
                    onChange={(opt:any)=> setForm({ ...form, kabel_odc_id: opt?.value || '', kabel_tube_odc_id: '', kabel_core_odc_id: '' })}
                    placeholder="Pilih Kabel"
                    isClearable
                    isSearchable
                    {...selectCommonProps}
                  />
                </div>

                <div>
                  <label className="block mb-1">Kabel Tube</label>
                  <Select
                    className="w-full"
                    classNamePrefix="select"
                    options={filteredTubesForOdp.map((t:any)=>({ value: t.id.toString(), label: t.warna_tube }))}
                    value={filteredTubesForOdp.find((t:any)=> t.id.toString()===form.kabel_tube_odc_id) ? { value: form.kabel_tube_odc_id, label: filteredTubesForOdp.find((t:any)=> t.id.toString()===form.kabel_tube_odc_id)?.warna_tube } : null}
                    onChange={(opt:any)=> setForm({ ...form, kabel_tube_odc_id: opt?.value || '', kabel_core_odc_id: '' })}
                    placeholder="Pilih Kabel Tube"
                    isClearable
                    isSearchable
                    isDisabled={!form.kabel_odc_id}
                    {...selectCommonProps}
                  />
                </div>

                <div>
                  <label className="block mb-1">Kabel Core</label>
                  <Select
                    className="w-full"
                    classNamePrefix="select"
                    options={filteredCoresForOdp.map((c:any)=>({ value: c.id.toString(), label: c.warna_core }))}
                    value={filteredCoresForOdp.find((c:any)=> c.id.toString()===form.kabel_core_odc_id) ? { value: form.kabel_core_odc_id, label: filteredCoresForOdp.find((c:any)=> c.id.toString()===form.kabel_core_odc_id)?.warna_core } : null}
                    onChange={(opt:any)=> setForm({ ...form, kabel_core_odc_id: opt?.value || '' })}
                    placeholder="Pilih Kabel Core"
                    isClearable
                    isSearchable
                    {...selectCommonProps}
                  />
                </div>

                <div>
                  <label className="block mb-1">ODC ID (Opsional)</label>
                  <Select
                    className="w-full"
                    classNamePrefix="select"
                    options={filteredOdcForOdp.map((o:any)=>({ value: o.id.toString(), label: o.nama_odc }))}
                    value={filteredOdcForOdp.find((o:any)=> o.id.toString()===form.odc_id) ? { value: form.odc_id, label: filteredOdcForOdp.find((o:any)=> o.id.toString()===form.odc_id)?.nama_odc } : null}
                    onChange={(opt:any)=> setForm({ ...form, odc_id: opt?.value || '' })}
                    placeholder="Pilih ODC"
                    isClearable
                    isSearchable
                    {...selectCommonProps}
                  />
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
                  <Select
                    className="w-full"
                    classNamePrefix="select"
                    options={kabelOdcList.map((k:any)=>({ value: k.id.toString(), label: k.nama_kabel }))}
                    value={kabelOdcList.find((k:any)=> k.id.toString()===form.kabel_odc_id) ? { value: form.kabel_odc_id, label: kabelOdcList.find((k:any)=> k.id.toString()===form.kabel_odc_id)?.nama_kabel } : null}
                    onChange={(opt:any)=> setForm({ ...form, kabel_odc_id: opt?.value || '', kabel_tube_odc_id: '', kabel_core_odc_id: '' })}
                    placeholder="Pilih Kabel"
                    isClearable
                    isSearchable
                    {...selectCommonProps}
                  />
                </div>

                <div>
                  <label className="block mb-1">Kabel Tube</label>
                  <Select
                    className="w-full"
                    classNamePrefix="select"
                    options={filteredTubesForOdc.map((t:any)=>({ value: t.id.toString(), label: t.warna_tube }))}
                    value={filteredTubesForOdc.find((t:any)=> t.id.toString()===form.kabel_tube_odc_id) ? { value: form.kabel_tube_odc_id, label: filteredTubesForOdc.find((t:any)=> t.id.toString()===form.kabel_tube_odc_id)?.warna_tube } : null}
                    onChange={(opt:any)=> setForm({ ...form, kabel_tube_odc_id: opt?.value || '', kabel_core_odc_id: '' })}
                    placeholder="Pilih Kabel Tube"
                    isClearable
                    isSearchable
                    isDisabled={!form.kabel_odc_id}
                    {...selectCommonProps}
                  />
                </div>

                <div>
                  <label className="block mb-1">Kabel Core (opsional)</label>
                  <Select
                    className="w-full"
                    classNamePrefix="select"
                    options={filteredCoresForOdc.map((c:any)=>({ value: c.id.toString(), label: c.warna_core }))}
                    value={filteredCoresForOdc.find((c:any)=> c.id.toString()===form.kabel_core_odc_id) ? { value: form.kabel_core_odc_id, label: filteredCoresForOdc.find((c:any)=> c.id.toString()===form.kabel_core_odc_id)?.warna_core } : null}
                    onChange={(opt:any)=> setForm({ ...form, kabel_core_odc_id: opt?.value || '' })}
                    placeholder="Pilih Kabel Core"
                    isClearable
                    isSearchable
                    isDisabled={!form.kabel_tube_odc_id}
                    {...selectCommonProps}
                  />
                </div>

                <div>
                  <label className="block mb-1">ODC ID (Opsional)</label>
                  <Select
                    className="w-full"
                    classNamePrefix="select"
                    options={filteredOdcForOdc.map((o:any)=>({ value: o.id.toString(), label: o.nama_odc }))}
                    value={filteredOdcForOdc.find((o:any)=> o.id.toString()===form.odc_id) ? { value: form.odc_id, label: filteredOdcForOdc.find((o:any)=> o.id.toString()===form.odc_id)?.nama_odc } : null}
                    onChange={(opt:any)=> setForm({ ...form, odc_id: opt?.value || '' })}
                    placeholder="Pilih ODC"
                    isClearable
                    isSearchable
                    {...selectCommonProps}
                  />
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

            {mode === 'joint_box' && (
              <>
                <div>
                  <label className="block mb-1">Deskripsi Joint Box</label>
                  <input
                    type="text"
                    className="w-full border p-1"
                    placeholder="Deskripsi Joint Box"
                    value={(form as any).deskripsi_joint_box || ''}
                    onChange={(e) => setForm({ ...form, deskripsi_joint_box: e.target.value } as any)}
                  />
                </div>

                <div>
                  <label className="block mb-1">Kabel</label>
                  <Select
                    className="w-full"
                    classNamePrefix="select"
                    options={kabelOdcList.map((k:any)=>({ value: k.id.toString(), label: k.nama_kabel }))}
                    value={kabelOdcList.find((k:any)=> k.id.toString()===form.kabel_odc_id) ? { value: form.kabel_odc_id, label: kabelOdcList.find((k:any)=> k.id.toString()===form.kabel_odc_id)?.nama_kabel } : null}
                    onChange={(opt:any)=> setForm({ ...form, kabel_odc_id: opt?.value || '', odc_id: '', odc_2_id: '', odp_id: '' })}
                    placeholder="Pilih Kabel"
                    isClearable
                    isSearchable
                    {...selectCommonProps}
                  />
                </div>

                <div>
                  <label className="block mb-1">Aktifkan Koneksi</label>
                  <select
                    className="w-full border p-1"
                    value={jbConnectionType}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      setJbConnectionType(val);
                      setForm({ ...form, odc_id: '', odc_2_id: '', odp_id: '' });
                    }}
                  >
                    <option value="">Tidak Ada</option>
                    <option value="odc-odc">ODC → ODC</option>
                    <option value="odc-odp">ODC → ODP</option>
                  </select>
                </div>

                {jbConnectionType === 'odc-odc' && (
                  <>
                    <div>
                      <label className="block mb-1">Source ODC</label>
                      <Select
                        className="w-full"
                        classNamePrefix="select"
                        options={odcList.filter((o:any)=> !form.kabel_odc_id || String(o.kabel_odc_id)===String(form.kabel_odc_id)).map((o:any)=>({ value: o.id.toString(), label: o.nama_odc }))}
                        value={odcList.find((o:any)=> o.id.toString()===form.odc_id) ? { value: form.odc_id, label: odcList.find((o:any)=> o.id.toString()===form.odc_id)?.nama_odc } : null}
                        onChange={(opt:any)=> setForm({ ...form, odc_id: opt?.value || '', odc_2_id: '' })}
                        placeholder="Pilih ODC"
                        isClearable
                        isSearchable
                        isDisabled={!form.kabel_odc_id}
                        {...selectCommonProps}
                      />
                    </div>

                    <div>
                      <label className="block mb-1">Target ODC</label>
                      <Select
                        className="w-full"
                        classNamePrefix="select"
                        options={odcList.filter((o:any)=> String(o.id)!==String(form.odc_id)).filter((o:any)=> !form.kabel_odc_id || String(o.kabel_odc_id)===String(form.kabel_odc_id)).map((o:any)=>({ value: o.id.toString(), label: o.nama_odc }))}
                        value={odcList.find((o:any)=> o.id.toString()===form.odc_2_id) ? { value: form.odc_2_id, label: odcList.find((o:any)=> o.id.toString()===form.odc_2_id)?.nama_odc } : null}
                        onChange={(opt:any)=> setForm({ ...form, odc_2_id: opt?.value || '' })}
                        placeholder="Pilih ODC"
                        isClearable
                        isSearchable
                        isDisabled={!form.odc_id}
                        {...selectCommonProps}
                      />
                    </div>
                  </>
                )}

                {jbConnectionType === 'odc-odp' && (
                  <>
                    <div>
                      <label className="block mb-1">Source ODC</label>
                      <Select
                        className="w-full"
                        classNamePrefix="select"
                        options={odcList.filter((o:any)=> !form.kabel_odc_id || String(o.kabel_odc_id)===String(form.kabel_odc_id)).map((o:any)=>({ value: o.id.toString(), label: o.nama_odc }))}
                        value={odcList.find((o:any)=> o.id.toString()===form.odc_id) ? { value: form.odc_id, label: odcList.find((o:any)=> o.id.toString()===form.odc_id)?.nama_odc } : null}
                        onChange={(opt:any)=> setForm({ ...form, odc_id: opt?.value || '', odp_id: '' })}
                        placeholder="Pilih ODC"
                        isClearable
                        isSearchable
                        isDisabled={!form.kabel_odc_id}
                        {...selectCommonProps}
                      />
                    </div>

                    <div>
                      <label className="block mb-1">Target ODP</label>
                      <Select
                        className="w-full"
                        classNamePrefix="select"
                        options={odpList.filter((p:any)=> !form.odc_id || String(p.odc_id ?? p.odc?.id)===String(form.odc_id)).map((p:any)=>({ value: p.id.toString(), label: p.nama_odp }))}
                        value={odpList.find((p:any)=> p.id.toString()===form.odp_id) ? { value: form.odp_id, label: odpList.find((p:any)=> p.id.toString()===form.odp_id)?.nama_odp } : null}
                        onChange={(opt:any)=> setForm({ ...form, odp_id: opt?.value || '' })}
                        placeholder="Pilih ODP"
                        isClearable
                        isSearchable
                        isDisabled={!form.odc_id}
                        {...selectCommonProps}
                      />
                    </div>
                  </>
                )}

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
              <button type="button" className="bg-gray-300 px-2 py-1 rounded" onClick={onCancel} disabled={isSubmitting}>
                Batal
              </button>
              <button type="submit" className="bg-blue-600 text-white px-2 py-1 rounded disabled:opacity-50" disabled={isSubmitting}>
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


