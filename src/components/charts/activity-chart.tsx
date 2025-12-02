"use client";

import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
} from "recharts";

const data = [
  { name: "Jour -6", received: 400, sent: 240 },
  { name: "Jour -5", received: 300, sent: 139 },
  { name: "Jour -4", received: 200, sent: 980 },
  { name: "Jour -3", received: 278, sent: 390 },
  { name: "Jour -2", received: 189, sent: 480 },
  { name: "Hier", received: 239, sent: 380 },
  { name: "Aujourd'hui", received: 349, sent: 430 },
];

export function ActivityChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 10,
          left: 10,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
        <YAxis stroke="hsl(var(--muted-foreground))" />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            borderColor: "hsl(var(--border))",
            borderRadius: "0.5rem",
          }}
          labelStyle={{ color: "hsl(var(--foreground))" }}
          itemStyle={{ color: "hsl(var(--foreground))" }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="received"
          stroke="hsl(var(--synapse-primary))"
          activeDot={{ r: 8 }}
          name="Messages Reçus"
        />
        <Line
          type="monotone"
          dataKey="sent"
          stroke="hsl(var(--synapse-secondary))"
          name="Messages Envoyés"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}