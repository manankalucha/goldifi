'use client';
import { useState, useEffect } from 'react';
import { InventoryItem } from '@/types';
import { subscribeToCollection, orderBy } from '@/lib/firebase/firestore';
import MetricsCards from '@/components/admin/MetricsCards';
import InventoryTable from '@/components/admin/InventoryTable';
import FieldOpsTable from '@/components/admin/FieldOpsTable';
import DisbursementPanel from '@/components/admin/DisbursementPanel';
import RefineryDashboard from '@/components/admin/RefineryDashboard';
import styles from './page.module.css';

export default function AdminDashboard() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'inventory' | 'field' | 'payouts' | 'refinery'>('inventory');

  useEffect(() => {
    const unsub = subscribeToCollection<InventoryItem>(
      'inventory',
      (data) => {
        setInventory(data.sort((a, b) => new Date(b.acquisitionDate).getTime() - new Date(a.acquisitionDate).getTime()));
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Inventory Routing</h1>
          <p className={styles.subtitle}>Manage acquisitions, B2B scrap, and CPO pipeline</p>
        </div>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <span className="spinner" style={{ width: 32, height: 32, margin: '0 auto' }} />
          <p style={{ marginTop: 16, color: 'var(--text-muted)' }}>Loading inventory data...</p>
        </div>
      ) : (
        <>
          <MetricsCards inventory={inventory} />
          
          <div className={styles.tabsBox}>
            <button 
              className={`btn ${activeTab === 'inventory' ? 'btn-primary' : 'btn-ghost'}`} 
              onClick={() => setActiveTab('inventory')}
            >
              Central Inventory
            </button>
            <button 
              className={`btn ${activeTab === 'field' ? 'btn-primary' : 'btn-ghost'}`} 
              onClick={() => setActiveTab('field')}
            >
              Live Field Operations
            </button>
            <button 
              className={`btn ${activeTab === 'payouts' ? 'btn-primary' : 'btn-ghost'}`} 
              onClick={() => setActiveTab('payouts')}
            >
              Payouts
            </button>
            <button 
              className={`btn ${activeTab === 'refinery' ? 'btn-primary' : 'btn-ghost'}`} 
              onClick={() => setActiveTab('refinery')}
            >
              Refinery
            </button>
          </div>

          {activeTab === 'inventory' && (
            <>
              <div className={styles.sectionHeader}>
                <h2>Recent Acquisitions</h2>
              </div>
              <InventoryTable inventory={inventory} />
            </>
          )}

          {activeTab === 'field' && <FieldOpsTable />}
          {activeTab === 'payouts' && <DisbursementPanel />}
          {activeTab === 'refinery' && <RefineryDashboard />}
        </>
      )}
    </div>
  );
}
