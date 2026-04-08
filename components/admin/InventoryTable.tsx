'use client';
import Link from 'next/link';
import { InventoryItem } from '@/types';
import { ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import styles from './InventoryTable.module.css';

interface Props {
  inventory: InventoryItem[];
}

const fmt = (val: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

export default function InventoryTable({ inventory }: Props) {
  if (inventory.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No inventory items found.</p>
      </div>
    );
  }

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Item / Cust ID</th>
            <th>Acquisition</th>
            <th>Net Wt. / Purity</th>
            <th>Stream</th>
            <th>Final Value</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {inventory.map((item) => {
            const date = new Date(item.acquisitionDate).toLocaleDateString('en-IN', { 
              month: 'short', day: 'numeric', year: 'numeric' 
            });

            return (
              <tr key={item.id}>
                <td>
                  <div className={styles.primaryText}>{item.itemDescription}</div>
                  <div className={styles.subText}>{item.customerId}</div>
                  {item.diamondVerified && (
                    <span className={styles.diamondPill}>♦ Includes Diamond</span>
                  )}
                </td>
                <td className={styles.subText}>{date}</td>
                <td>
                  <div className={styles.primaryText}>{item.netWeightGrams}g</div>
                  <div className={styles.subText}>XRF: {(item.goldPurity * 100).toFixed(1)}%</div>
                </td>
                <td>
                  {item.stream === 'unassigned' && (
                    <span className="badge badge-pending">
                      <AlertCircle size={10} style={{ marginRight: 2 }} /> Needs Routing
                    </span>
                  )}
                  {item.stream === 'b2b_scrap' && <span className="badge badge-scrap">B2B Scrap</span>}
                  {item.stream === 'cpo' && <span className="badge badge-cpo">CPO Retail</span>}
                </td>
                <td className={styles.primaryText}>{fmt(item.finalOffer)}</td>
                <td>
                  <Link href={`/admin/inventory/${item.id}`} className="btn btn-secondary btn-sm">
                    {item.stream === 'unassigned' ? 'Assign Route' : 'View Details'}
                    <ArrowRight size={14} />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
