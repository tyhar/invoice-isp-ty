import { Card } from '$app/components/cards';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

interface FtthStat {
    summary: {
        tubes: number;
        cores: number;
    };
    status: {
        activeOdc: number;
        activeOdp: number;
        activeKabel: number;
        activeClients: number;
    };
}

export function FtthStatistics() {
    const [stats, setStats] = useState<FtthStat | null>(null);
    const API_BASE_URL = 'http://localhost:8000';
    const [t] = useTranslation();

    useEffect(() => {
        const token = localStorage.getItem('X-API-TOKEN') ?? '';

        axios
            .get(`${API_BASE_URL}/api/v1/ftth-statistics`, {
                headers: {
                    'X-API-TOKEN': token,
                },
            })
            .then((response) => {
                setStats(response.data.data);
            })
            .catch((error) => {
                console.error('Error fetching FTTH stats:', error);
            });
    }, []);

    return (
        <div className="h-[400px] relative p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-2">{t('Statistik FTTH')}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-3">
                <Card className="bg-white shadow rounded p-1" title="Jumlah Client">
                    <div className="text-center text-2xl font-bold">{stats?.status?.activeClients ?? 0}</div>
                </Card>
                <Card className="bg-white shadow rounded p-1" title="Jumlah ODC">
                    <div className="text-center text-2xl font-bold">{stats?.status?.activeOdc ?? 0}</div>
                </Card>
                <Card className="bg-white shadow rounded p-1" title="Jumlah ODP">
                    <div className="text-center text-2xl font-bold">{stats?.status?.activeOdp ?? 0}</div>
                </Card>
                <Card className="bg-white shadow rounded p-1" title="Jumlah Kabel ODC">
                    <div className="text-center text-2xl font-bold">{stats?.status?.activeKabel ?? 0}</div>
                </Card>
                <Card className="bg-white shadow rounded p-1" title="Jumlah Kabel Core ODC">
                    <div className="text-center text-2xl font-bold">{stats?.summary?.cores ?? 0}</div>
                </Card>
                <Card className="bg-white shadow rounded p-1" title="Jumlah Kabel Tube ODC">
                    <div className="text-center text-2xl font-bold">{stats?.summary?.tubes ?? 0}</div>
                </Card>
            </div>
        </div>
    );
}
