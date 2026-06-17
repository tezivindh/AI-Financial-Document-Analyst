"use client";

import React from "react";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
} from "recharts";

interface ChartData {
  name: string;
  Revenue: number;
  EBITDA: number;
}

interface MarginData {
  name: string;
  Gross: number;
  Operating: number;
  Net: number;
}

interface CapitalData {
  name: string;
  Cash: number;
  Debt: number;
  Capex: number;
}

export function RevenueEbitdaChart({ data }: { data: ChartData[] }) {
  return (
    <div className="w-full h-[300px] bg-slate-900/40 p-4 rounded-xl border border-slate-800">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="name" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip
            contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px" }}
            labelStyle={{ color: "#f8fafc" }}
          />
          <Legend />
          <Bar dataKey="Revenue" fill="#3b82f6" name="Revenue ($M)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="EBITDA" fill="#10b981" name="EBITDA ($M)" radius={[4, 4, 0, 0]} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MarginLineChart({ data }: { data: MarginData[] }) {
  return (
    <div className="w-full h-[300px] bg-slate-900/40 p-4 rounded-xl border border-slate-800">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart
          data={data}
          margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="name" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" unit="%" />
          <Tooltip
            contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px" }}
            labelStyle={{ color: "#f8fafc" }}
          />
          <Legend />
          <Line type="monotone" dataKey="Gross" stroke="#10b981" strokeWidth={2} name="Gross Margin %" activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="Operating" stroke="#f59e0b" strokeWidth={2} name="Operating Margin %" />
          <Line type="monotone" dataKey="Net" stroke="#3b82f6" strokeWidth={2} name="Net Margin %" />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CapexCashChart({ data }: { data: CapitalData[] }) {
  return (
    <div className="w-full h-[300px] bg-slate-900/40 p-4 rounded-xl border border-slate-800">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="name" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip
            contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px" }}
            labelStyle={{ color: "#f8fafc" }}
          />
          <Legend />
          <Bar dataKey="Cash" fill="#10b981" name="Cash ($M)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Debt" fill="#ef4444" name="Total Debt ($M)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Capex" fill="#ec4899" name="Capex ($M)" radius={[4, 4, 0, 0]} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
