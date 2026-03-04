import { useParams, Link } from 'react-router-dom'
import { crops } from '../data/crops'
import { farmers } from '../data/farmers'
import styles from './BatchDetail.module.css'

export default function BatchDetail() {
  const { id } = useParams()
  const crop = crops.find(c => c.id === id)

  if (!crop) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '4rem' }}>🔍</p>
          <h2 style={{ color: 'var(--green-dark)', margin: '16px 0 8px' }}>Batch Not Found</h2>
          <p style={{ marginBottom: 24 }}>This batch ID doesn't exist in our system.</p>
          <Link to="/harvest" className="btn btn-primary">← Back to Harvest</Link>
        </div>
      </div>
    )
  }

  const farmer = farmers.find(f => f.id === crop.farmerId)
  const soldPct = Math.round(((crop.harvestedQty - crop.stockLeft) / crop.harvestedQty) * 100)

  return (
    <div className="page">
      {/* HEADER */}
      <div className={styles.pageHeader}>
        <Link to="/harvest" className={styles.backLink}>← Back to Harvest</Link>
        <span className="tag">Batch Transparency</span>
        <h1 className={styles.batchId}>{crop.id}</h1>
        <p>Full traceability report — from soil to your kitchen.</p>
      </div>

      <div className="section">
        <div className={styles.layout}>
          {/* ── LEFT: Crop Info ── */}
          <div>
            {/* Main Report Card */}
            <div className={styles.reportCard}>
              <div className={styles.reportEmoji}>{crop.emoji}</div>
              <div className={styles.reportHeader}>
                <div>
                  <h2 className={styles.cropName}>{crop.name}</h2>
                  <span className={styles.categoryBadge}>{crop.category}</span>
                  {crop.isOrganic && <span className={styles.organicBadge}>🌿 Organic</span>}
                </div>
                <div className={styles.priceTag}>
                  <span className={styles.price}>₹{crop.pricePerKg}</span>
                  <span className={styles.perKg}>/kg</span>
                </div>
              </div>

              <p className={styles.description}>{crop.description}</p>

              <div className={styles.dataGrid}>
                {[
                  { icon: '⏰', label: 'Harvest Time', value: crop.harvestTime },
                  { icon: '📍', label: 'Village', value: crop.village },
                  { icon: '🌱', label: 'Soil Type', value: crop.soilType },
                  { icon: '👨‍🌾', label: 'Farmer', value: crop.farmerName },
                ].map(row => (
                  <div key={row.label} className={styles.dataRow}>
                    <span className={styles.dataIcon}>{row.icon}</span>
                    <div>
                      <span className={styles.dataLabel}>{row.label}</span>
                      <span className={styles.dataValue}>{row.value}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Stock bar */}
              <div className={styles.stockSection}>
                <div className={styles.stockHeader}>
                  <span className={styles.stockLabel}>Batch Availability</span>
                  <span className={styles.stockNumbers}>{crop.stockLeft}kg remaining of {crop.harvestedQty}kg</span>
                </div>
                <div className={styles.stockTrack}>
                  <div className={styles.stockFill} style={{ width: `${soldPct}%` }}>
                    <span className={styles.soldLabel}>{soldPct}% sold</span>
                  </div>
                </div>
                <div className={styles.stockLegend}>
                  <span className={styles.soldDot} /> Sold
                  <span className={styles.availDot} /> Available
                </div>
              </div>

              <Link to="/harvest" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
                🛒 Add to Cart — ₹{crop.pricePerKg}/kg
              </Link>
            </div>

            {/* Timeline */}
            <div className={styles.timelineCard}>
              <h3 className={styles.timelineTitle}>Batch Journey Today</h3>
              {[
                { time: crop.harvestTime, label: 'Harvested', desc: `Cut fresh at ${crop.farmerName}'s farm in ${crop.village}` },
                { time: '11:45 AM', label: 'Quality Checked', desc: 'Inspected and graded by our quality team' },
                { time: '12:15 PM', label: 'Packed & Tagged', desc: `Batch ID ${crop.id} assigned and sealed` },
                { time: '12:45 PM', label: 'Out for Delivery', desc: 'Loaded onto refrigerated delivery vehicle' },
              ].map((event, i) => (
                <div key={i} className={styles.timelineRow}>
                  <div className={styles.timelineTime}>{event.time}</div>
                  <div className={styles.timelineDot} />
                  <div>
                    <p className={styles.timelineLabel}>{event.label}</p>
                    <p className={styles.timelineDesc}>{event.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Farmer Card ── */}
          {farmer && (
            <div>
              <div className={styles.farmerCard}>
                <div className={styles.farmerTop}>
                  <div className={styles.farmerAvatar}>{farmer.emoji}</div>
                  <div>
                    <div className={styles.farmerVerified}>✅ Verified Farmer</div>
                    <h3 className={styles.farmerName}>{farmer.name}</h3>
                    <p className={styles.farmerVillage}>📍 {farmer.village}</p>
                  </div>
                </div>
                <div className={styles.farmerStats}>
                  {[
                    { val: `${farmer.yearsOfFarming}y`, lbl: 'Experience' },
                    { val: `${farmer.landAcres}ac`, lbl: 'Land' },
                    { val: `⭐${farmer.avgRating}`, lbl: 'Rating' },
                    { val: farmer.totalOrders, lbl: 'Orders' },
                  ].map(s => (
                    <div key={s.lbl} className={styles.farmerStat}>
                      <span className={styles.fStatVal}>{s.val}</span>
                      <span className={styles.fStatLbl}>{s.lbl}</span>
                    </div>
                  ))}
                </div>
                <p className={styles.farmerStory}>{farmer.story}</p>
                <Link to="/farmers" className={styles.viewFarmer}>View Full Profile →</Link>
              </div>

              {/* Trust signals */}
              <div className={styles.trustCard}>
                <h4 className={styles.trustTitle}>Why Trust This Batch?</h4>
                {[
                  { icon: '🔍', title: 'Verified Farmer', desc: 'Onboarded and trained by ManaHarvest team.' },
                  { icon: '📋', title: 'Quality Checked', desc: 'Every batch inspected before dispatch.' },
                  { icon: '🚚', title: 'Zero Cold Storage', desc: 'Direct farm to door — never frozen.' },
                  { icon: '🌱', title: 'Sustainable Farming', desc: `${crop.isOrganic ? 'Organic certified. ' : ''}Low-water irrigation.` },
                ].map(item => (
                  <div key={item.title} className={styles.trustRow}>
                    <div className={styles.trustIcon}>{item.icon}</div>
                    <div>
                      <p className={styles.trustLabel}>{item.title}</p>
                      <p className={styles.trustDesc}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
