import React, { useState, useEffect } from 'react';
    import './styles.css';

    const DamageList = ({ records, onRemove }) => {
      const [processedRecords, setProcessedRecords] = useState([]);
      const [loading, setLoading] = useState(true);

      const processRecord = async (record) => {
        if (record.photo_url) {
          try {
            setLoading(true);
            const response = await fetch(record.photo_url);
            const blob = await response.blob();
            const base64 = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
            return { ...record, photo_url: base64 };
          } catch (error) {
            console.error('Error fetching or converting image:', error);
            return record;
          }
        }
        return record;
      };

      useEffect(() => {
        const processAllRecords = async () => {
          setLoading(true);
          try {
            const updatedRecords = await Promise.all(records.map(processRecord));
            setProcessedRecords(updatedRecords);
          } catch (error) {
            console.error('Error refreshing damage records:', error);
          } finally {
            setLoading(false);
          }
        };

        processAllRecords();
      }, [records]);

      if (loading) {
        return <div className="loading">Loading damage records...</div>;
      }

      if (!processedRecords.length) {
        return (
          <div className="no-damages">
            No damage records added yet
          </div>
        );
      }

      return (
        <div className="damage-list">
          {processedRecords.map((record, index) => (
            <div key={index} className={`damage-record ${record.risk_level.toLowerCase()}`}>
              <div className="damage-header">
                <h3>{record.damage_type}</h3>
                <span className={`risk-badge ${record.risk_level.toLowerCase()}`}>
                  {record.risk_level}
                </span>
              </div>
              
              <div className="damage-content">
                <div className="damage-details">
                  <p><strong>Location:</strong> {record.location_details}</p>
                  <p><strong>Recommendation:</strong> {record.recommendation}</p>
                  {record.notes && <p><strong>Notes:</strong> {record.notes}</p>}
                </div>

                {record.photo_url && (
                  <div className="damage-photo">
                    <div className="photo-container" style={{ display: 'flex', alignItems: 'center' }}>
                      <img src={record.photo_url} alt="Damage" style={{ width: '100%', height: 'auto' }} />
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => onRemove(index)}
                className="remove-record-btn"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      );
    };

    export default DamageList;
