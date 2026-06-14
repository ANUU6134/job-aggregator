import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { date: 'Week 1', applications: 4, interviews: 1 },
  { date: 'Week 2', applications: 7, interviews: 2 },
  { date: 'Week 3', applications: 5, interviews: 3 },
  { date: 'Week 4', applications: 8, interviews: 4 },
];

export const ActivityChart: React.FC = () => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="applications" stroke="#3b82f6" strokeWidth={2} />
        <Line type="monotone" dataKey="interviews" stroke="#10b981" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
};