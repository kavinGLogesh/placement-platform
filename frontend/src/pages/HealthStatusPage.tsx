import React from 'react';
import { Typography, Box, Grid } from '@mui/material';
import SpeedIcon from '@mui/icons-material/Speed';
import HttpIcon from '@mui/icons-material/Http';
import DnsIcon from '@mui/icons-material/Dns';
import SecurityIcon from '@mui/icons-material/Security';
import { useHealthCheck } from '../hooks/useHealthCheck.js';
import { StatusCard } from '../components/StatusCard.js';
import { MetricCard } from '../components/MetricCard.js';
import { TechStackCard } from '../components/TechStackCard.js';
import { formatLatency } from '../utils/formatters.js';

export const HealthStatusPage: React.FC = () => {
  const health = useHealthCheck();

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="overline"
          sx={{
            color: 'primary.light',
            fontWeight: 700,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
          }}
        >
          Phase 1 System Verification
        </Typography>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 800,
            color: 'text.primary',
            letterSpacing: '-0.02em',
            mt: 0.5,
            mb: 1,
          }}
        >
          Architecture & Service Integration
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 700 }}>
          Verification console establishing the communication pipeline between the React/Vite frontend and the Node.js Express backend service with MySQL/Prisma persistence.
        </Typography>
      </Box>

      {/* Metrics Row */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="REST API STATUS"
            value={health.isLoading ? 'Checking...' : health.isError ? 'Disconnected' : 'Connected'}
            subtitle={health.data?.message || 'GET /api/health'}
            icon={<HttpIcon fontSize="small" />}
            color={health.isError ? '#ef4444' : health.isLoading ? '#f59e0b' : '#10b981'}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="ROUND-TRIP LATENCY"
            value={formatLatency(health.latencyMs)}
            subtitle="Client to REST API"
            icon={<SpeedIcon fontSize="small" />}
            color="#06b6d4"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="BACKEND PORT"
            value="Port 5000"
            subtitle="Node Express HTTP"
            icon={<DnsIcon fontSize="small" />}
            color="#818cf8"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="SECURITY PROTOCOLS"
            value="Helmet + CORS"
            subtitle="Strict HTTP Headers"
            icon={<SecurityIcon fontSize="small" />}
            color="#fbbf24"
          />
        </Grid>
      </Grid>

      {/* Primary Integration Health Card */}
      <StatusCard health={health} />

      {/* Architecture Stack Breakdown */}
      <TechStackCard />
    </Box>
  );
};
