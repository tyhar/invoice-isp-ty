// import L from 'leaflet'; // Unused import removed

export const getLatLng = (item: any): [number, number] | null => {
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

export const safeParseLatLng = (lat: any, lng: any): [number, number] | null => {
  const parsedLat = typeof lat === 'number' ? lat : parseFloat(lat);
  const parsedLng = typeof lng === 'number' ? lng : parseFloat(lng);

  if (isNaN(parsedLat) || isNaN(parsedLng)) {
    console.warn('Invalid LatLng:', { lat, lng });
    return null;
  }

  return [parsedLat, parsedLng];
};

export const haversineDistance = (
  [lat1, lon1]: [number, number],
  [lat2, lon2]: [number, number]
): number => {
  const R = 6371; // km
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

export const createSmoothArc = (start: [number, number], end: [number, number], segments = 10): [number, number][] => {
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


