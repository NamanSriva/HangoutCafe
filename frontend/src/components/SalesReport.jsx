import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from 'recharts';

const SalesReport = ({ monthlyData, yearlyData }) => {
  return (
    <div className="sales-report-container animate-fade-in">
      <div className="report-header mt-4">
        <h2>Sales <span className="highlight">Analysis</span></h2>
        <p>Detailed revenue metrics and growth trends.</p>
      </div>

      <div className="charts-grid mt-4">
        {/* Monthly Revenue Bar Chart */}
        <div className="chart-card glass">
          <h3>Monthly Revenue (Current Year)</h3>
          <div className="chart-container-wrapper" style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="name" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                />
                <Bar dataKey="revenue" fill="var(--accent-color)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Yearly Revenue Bar Chart */}
        <div className="chart-card glass">
          <h3>Yearly Revenue Comparison</h3>
          <div className="chart-container-wrapper" style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={yearlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="name" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                />
                <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Yearly Revenue Trend Line Chart */}
        <div className="chart-card glass" style={{ gridColumn: 'span 1' }}>
          <h3>Revenue Growth Trend (Yearly)</h3>
          <div className="chart-container-wrapper" style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={yearlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="name" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="var(--accent-color)" 
                  strokeWidth={3} 
                  dot={{ r: 6, fill: 'var(--accent-color)' }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesReport;
