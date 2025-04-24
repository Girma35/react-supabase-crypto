import { useEffect, useState } from 'react';
import supabase from './supabaseClient';
import './Dashbaord.module.css';

import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import MyForm from './Form';

// Register the required elements for Chart.js
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

interface CryptoData {
  coin_name: string;
  volume_24h: number;
}

function Dashboard() {
  const [chartData, setChartData] = useState<any>(null);
  const [metrics, setMetrics] = useState<CryptoData[]>([]);

  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        const { data, error } = await supabase
          .from('crypto__ranking')
          .select(`
          *
          `)
          .order('volume_24h', { ascending: false });
          console.log('Fetched data:', data);
        if (error) throw error;
        if (data) {
          setMetrics(data);

          const formatted = {
            labels: data.map((item) => item.coin_name),
            datasets: [
              {
                label: 'Volume (24h)',
                data: data.map((item) => item.volume_24h),
                backgroundColor: [
                  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
                ],
                hoverBackgroundColor: [
                  '#FF4D6D', '#2A91D4', '#FFBB33', '#3BA8A8', '#8855EE', '#FF8C1A',
                ],
                borderColor: '#fff',
                borderWidth: 1,
              },
            ],
          };

          setChartData(formatted);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchCryptoData();
  
    const channel = supabase
      .channel('crypto_updates')  
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'crypto__ranking' }, (payload) => {
          console.log('Change received!', payload);
          fetchCryptoData(); // Re-fetch data on change
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel); 
    }


  }, []);

  return (
    <div className="dashboard-wrapper">
      <div className="chart-container">
        <h2>Total Value of Portfolio</h2>
      </div>
      <div className="crypto-details">
        <h3>Crypto Prices</h3>
        <p>Historic data...</p>
      </div>

      {chartData ? (
        <Bar
          data={chartData}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'right',
              },
              title: {
                display: true,
                text: 'Top 6 Coins by 24h Volume',
              },
            },
            scales: {
              x: {
                title: {
                  display: true,
                  text: 'Coin Name',
                },
                grid: {
                  display: false,
                },
              },
              y: {
                title: {
                  display: true,
                  text: 'Volume (24h)',
                },
                beginAtZero: true,
              },
            },
          }}
        />
      ) : (
        <p>Loading chart...</p>
      )}
      <MyForm metrics={metrics} />
    </div>
  );
}

export default Dashboard;