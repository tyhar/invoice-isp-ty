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
            <h2 className="mb-2 text-lg font-semibold">
                {t('Statistik FTTH')}
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3">
                <Card
                    className="p-1 bg-white rounded shadow"
                    title="Jumlah Client"
                >
                    <div className="text-2xl font-bold text-center">
                        {stats?.status?.activeClients ?? 0}
                    </div>
                </Card>
                <Card
                    className="p-1 bg-white rounded shadow"
                    title="Jumlah ODC"
                >
                    <div className="text-2xl font-bold text-center">
                        {stats?.status?.activeOdc ?? 0}
                    </div>
                </Card>
                <Card
                    className="p-1 bg-white rounded shadow"
                    title="Jumlah ODP"
                >
                    <div className="text-2xl font-bold text-center">
                        {stats?.status?.activeOdp ?? 0}
                    </div>
                </Card>
                <Card
                    className="p-1 bg-white rounded shadow"
                    title="Jumlah Kabel ODC"
                >
                    <div className="text-2xl font-bold text-center">
                        {stats?.status?.activeKabel ?? 0}
                    </div>
                </Card>
                <Card
                    className="p-1 bg-white rounded shadow"
                    title="Jumlah Kabel Core ODC"
                >
                    <div className="text-2xl font-bold text-center">
                        {stats?.summary?.cores ?? 0}
                    </div>
                </Card>
                <Card
                    className="p-1 bg-white rounded shadow"
                    title="Jumlah Kabel Tube ODC"
                >
                    <div className="text-2xl font-bold text-center">
                        {stats?.summary?.tubes ?? 0}
                    </div>
                </Card>
            </div>
        </div>
    );
}
