import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, Button, Chip, CircularProgress, IconButton } from '@mui/material';
import { Inventory2, LocalShipping, Warning, Add as AddIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import Layout from '../../components/Layout';
import { toast } from 'react-toastify';
import api from '../../services/api';

const StatCard = ({ title, value, icon, color, gradient }) => (
  <Paper sx={{ 
    p: 3, 
    borderRadius: 3, 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    background: gradient || '#fff',
    color: gradient ? '#fff' : 'inherit',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    transition: 'transform 0.2s',
    '&:hover': { transform: 'translateY(-4px)' }
  }}>
    <Box>
      <Typography variant="body2" sx={{ opacity: 0.8, fontWeight: 600, mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {title}
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: 800 }}>
        {value}
      </Typography>
    </Box>
    <Box sx={{ 
      p: 1.5, 
      borderRadius: '12px', 
      bgcolor: gradient ? 'rgba(255,255,255,0.2)' : `${color}15`, 
      color: gradient ? '#fff' : color 
    }}>
      {icon}
    </Box>
  </Paper>
);

const InventoryDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [itemsRes, lowStockRes, transRes] = await Promise.all([
        api.get('/inventory/items'),
        api.get('/inventory/items/low-stock'),
        api.get('/inventory/transactions')
      ]);
      setItems(itemsRes.data);
      setLowStock(lowStockRes.data);
      setTransactions(transRes.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Layout title="Inventory Control">
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
            Inventory Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Monitor stock levels, track assets, and manage transactions.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <IconButton onClick={fetchData} sx={{ bgcolor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <RefreshIcon />
          </IconButton>
          <Button variant="contained" color="secondary" startIcon={<AddIcon />} sx={{ px: 3, py: 1, borderRadius: 2 }}>
            Add Item
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <StatCard 
                title="Total Unique Items" 
                value={items.length}
                icon={<Inventory2 fontSize="large" />} 
                gradient="linear-gradient(135deg, #ec4899 0%, #be185d 100%)"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <StatCard 
                title="Low Stock Alerts" 
                value={lowStock.length}
                icon={<Warning fontSize="large" />} 
                color="#f59e0b"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <StatCard 
                title="Recent Transactions" 
                value={transactions.slice(0, 30).length}
                icon={<LocalShipping fontSize="large" />} 
                color="#10b981"
              />
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} md={7}>
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>Recent Transactions</Typography>
                {transactions.slice(0, 5).map(trans => (
                  <Box key={trans.id} sx={{ display: 'flex', justifyContent: 'space-between', p: 2, borderBottom: '1px solid #f1f5f9' }}>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="600">
                        {trans.item?.name || 'Unknown Item'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(trans.transaction_date).toLocaleString()}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Chip 
                        label={trans.transaction_type} 
                        size="small" 
                        color={
                          trans.transaction_type === 'Purchase' || trans.transaction_type === 'Return' ? 'success' : 
                          trans.transaction_type === 'Issue' ? 'warning' : 'default'
                        }
                        sx={{ mb: 0.5 }}
                      />
                      <Typography variant="subtitle2" fontWeight="700">
                        {trans.transaction_type === 'Issue' ? '-' : '+'}{trans.quantity}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Paper>
            </Grid>
            <Grid item xs={12} md={5}>
              <Paper sx={{ p: 3, borderRadius: 3, bgcolor: '#fffbeb', border: '1px solid #fef3c7' }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: '#b45309' }}>Attention Needed</Typography>
                {lowStock.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">All stock levels are optimal!</Typography>
                ) : (
                  lowStock.slice(0, 5).map(item => (
                    <Box key={item.id} sx={{ mb: 2, p: 2, bgcolor: 'white', borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                      <Typography variant="subtitle2" fontWeight="600" noWrap>{item.name}</Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Min Level: {item.min_stock_level}
                        </Typography>
                        <Typography variant="caption" color="error" fontWeight="700">
                          Current: {item.quantity} {item.unit}
                        </Typography>
                      </Box>
                    </Box>
                  ))
                )}
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Layout>
  );
};

export default InventoryDashboard;
