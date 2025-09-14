import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const Chart = ({ type }) => {
  // Sample data - in real app, this would come from API
  const transactionsData = [
    { name: 'يناير', value: 1200 },
    { name: 'فبراير', value: 1900 },
    { name: 'مارس', value: 3000 },
    { name: 'أبريل', value: 2800 },
    { name: 'مايو', value: 1890 },
    { name: 'يونيو', value: 2390 },
  ];

  const usersData = [
    { name: 'يناير', value: 100 },
    { name: 'فبراير', value: 150 },
    { name: 'مارس', value: 200 },
    { name: 'أبريل', value: 180 },
    { name: 'مايو', value: 250 },
    { name: 'يونيو', value: 300 },
  ];

  const data = type === 'transactions' ? transactionsData : usersData;

  return (
    <div style={{ height: '300px' }}>
      <ResponsiveContainer width="100%" height="100%">
        {type === 'transactions' ? (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#1976D2" 
              strokeWidth={2}
              dot={{ fill: '#1976D2', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        ) : (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#4CAF50" />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;