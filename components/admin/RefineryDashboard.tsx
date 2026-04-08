'use client';
import { useState, useEffect } from 'react';
import { subscribeToCollection, updateDocument, setDocument } from '@/lib/firebase/firestore';
import { InventoryItem, RefineryBatch } from '@/types';
import { Factory, Truck, CheckSquare, Plus, ArrowRight, TrendingDown } from 'lucide-react';
import styles from './RefineryDashboard.module.css';

export default function RefineryDashboard() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [batches, setBatches] = useState<RefineryBatch[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [refineryName, setRefineryName] = useState('');

  const [settlingBatchId, setSettlingBatchId] = useState<string | null>(null);
  const [settledWeight, setSettledWeight] = useState('');

  useEffect(() => {
    const unsubItems = subscribeToCollection<InventoryItem>('inventory', (data) => {
      const b2b = data.filter(i => i.stream === 'b2b_scrap' && !i.refineryRef);
      setItems(b2b);
    });

    const unsubBatches = subscribeToCollection<RefineryBatch>('refinery_batches', (data) => {
      setBatches(data.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setLoading(false);
    });

    return () => {
      unsubItems();
      unsubBatches();
    };
  }, []);

  const handleCreateBatch = async () => {
    if (!refineryName || selectedIds.length === 0) return;
    
    const batchId = `BATCH-${Date.now().toString(36).toUpperCase()}`;
    const selectedItems = items.filter(i => selectedIds.includes(i.id));
    const totalWeight = selectedItems.reduce((acc, i) => acc + i.netWeightGrams, 0);

    try {
      const batch: RefineryBatch = {
        id: batchId,
        itemIds: selectedIds,
        status: 'preparing',
        totalIntakeWeight: totalWeight,
        refineryName,
        createdAt: new Date().toISOString()
      };

      await setDocument('refinery_batches', batchId, batch);
      
      // Update individual inventory items
      for (const itemId of selectedIds) {
        await updateDocument('inventory', itemId, { refineryRef: batchId });
      }

      setCreating(false);
      setSelectedIds([]);
      setRefineryName('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleShipBatch = async (id: string, carrierRef: string) => {
    await updateDocument('refinery_batches', id, { 
      status: 'in_transit',
      carrierRef,
      shippedAt: new Date().toISOString()
    });
  };

  const handleSettleBatch = async (id: string) => {
    const batch = batches.find(b => b.id === id);
    if (!batch || !settledWeight) return;

    const sWt = parseFloat(settledWeight);
    const loss = batch.totalIntakeWeight - sWt;

    await updateDocument('refinery_batches', id, {
      status: 'settled',
      settledWeight: sWt,
      meltLossGrams: loss,
      settledAt: new Date().toISOString()
    });
    setSettlingBatchId(null);
    setSettledWeight('');
  };

  if (loading) return <div className="spinner" />;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>B2B refinery Logistics</h3>
      </div>

      <div className={styles.grid}>
        {/* Available for Batching */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h4>Available Scrap Inventory</h4>
            <span>{items.length} Items</span>
          </div>
          <div className={styles.itemList}>
            {items.map(item => (
              <label key={item.id} className={styles.itemCard}>
                <input 
                  type="checkbox" 
                  checked={selectedIds.includes(item.id)}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedIds([...selectedIds, item.id]);
                    else setSelectedIds(selectedIds.filter(id => id !== item.id));
                  }}
                />
                <div className={styles.itemInfo}>
                  <strong>{item.itemDescription}</strong>
                  <p>{item.netWeightGrams}g @ {(item.goldPurity * 100).toFixed(1)}%</p>
                </div>
              </label>
            ))}
          </div>
          {selectedIds.length > 0 && (
            <div className={styles.batchAction}>
              <input 
                className="form-input" 
                placeholder="Refinery Name (e.g. MMTC-PAMP)" 
                value={refineryName}
                onChange={e => setRefineryName(e.target.value)}
              />
              <button className="btn btn-primary" onClick={handleCreateBatch}>
                <Plus size={16} /> Create Batch ({selectedIds.length})
              </button>
            </div>
          )}
        </div>

        {/* Active Batches */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h4>Refinery Shipments</h4>
          </div>
          <div className={styles.batchList}>
            {batches.map(batch => (
              <div key={batch.id} className={styles.batchCard}>
                <div className={styles.batchTop}>
                  <div className={styles.batchMeta}>
                    <strong>{batch.id}</strong>
                    <p>{batch.refineryName}</p>
                  </div>
                  <span className={`badge badge-${batch.status}`}>{batch.status}</span>
                </div>

                <div className={styles.batchStats}>
                  <div className={styles.batchStat}>
                    <span>Intake Weight</span>
                    <strong>{batch.totalIntakeWeight.toFixed(2)}g</strong>
                  </div>
                  {batch.status === 'settled' && (
                    <>
                      <div className={styles.batchStat}>
                        <span>Settled Weight</span>
                        <strong>{batch.settledWeight?.toFixed(2)}g</strong>
                      </div>
                      <div className={styles.batchStat}>
                        <span style={{color: 'var(--error)'}}>Melt Loss</span>
                        <strong style={{color: 'var(--error)'}}>{batch.meltLossGrams?.toFixed(2)}g</strong>
                      </div>
                    </>
                  )}
                </div>

                <div className={styles.batchActions}>
                  {batch.status === 'preparing' && (
                    <button className="btn btn-ghost" onClick={() => handleShipBatch(batch.id, 'SHP-' + Date.now().toString(36))}>
                      <Truck size={16} /> Mark as Shipped
                    </button>
                  )}
                  {batch.status === 'in_transit' && (
                    <>
                      {settlingBatchId === batch.id ? (
                        <div className={styles.settleForm}>
                          <input 
                            type="number" 
                            className="form-input" 
                            placeholder="Settled Weight (g)" 
                            value={settledWeight}
                            onChange={e => setSettledWeight(e.target.value)}
                          />
                          <button className="btn btn-primary" onClick={() => handleSettleBatch(batch.id)}>Settle</button>
                          <button className="btn btn-ghost" onClick={() => setSettlingBatchId(null)}>Cancel</button>
                        </div>
                      ) : (
                        <button className="btn btn-primary" onClick={() => setSettlingBatchId(batch.id)}>
                          <TrendingDown size={16} /> Settle & Log Loss
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
