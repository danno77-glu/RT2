import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import AuditBasicInfo from './AuditBasicInfo';
import DamageRecordForm from './DamageRecordForm';
import DamageList from './DamageList';
import { useAuditForm } from './useAuditForm';
import './styles.css';
import { useSettings } from '../../contexts/SettingsContext';
import { supabase } from '../../supabase';
import { useSyncQueue } from '../../utils/useSyncQueue';

const AuditForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { settings } = useSettings();
  const { syncData } = useSyncQueue();
  const {
    auditData,
    damageRecords,
    handleAuditChange,
    handleAddDamage,
    handleRemoveDamage,
    handleSubmit,
    isSubmitting
  } = useAuditForm();

  const [showDamageForm, setShowDamageForm] = useState(false);
  const [auditors, setAuditors] = useState([]);

  useEffect(() => {
    const fetchAuditors = async () => {
      try {
        const { data, error } = await supabase
          .from('auditors')
          .select('id, name')
          .order('name');

        if (error) throw error;
        setAuditors(data || []);
      } catch (error) {
        console.error('Error fetching auditors:', error);
      }
    };

    fetchAuditors();
  }, []);

  const handleAddDamageRecord = (record) => {
    handleAddDamage(record);
    setShowDamageForm(false);
    syncData();
  };

  return (
    <div className="audit-form">
      <h1>Pallet Rack Audit</h1>
      
      <AuditBasicInfo 
        data={auditData}
        onChange={handleAuditChange}
        damageRecords={damageRecords}
        auditors={auditors}
      />

      <div className="damage-records-section">
        <div className="section-header">
          <h2>Damage Records</h2>
          <button 
            type="button"
            onClick={() => setShowDamageForm(true)}
            className="add-damage-btn"
          >
            Add Damage Record
          </button>
        </div>

        <DamageList
          records={damageRecords}
          onRemove={handleRemoveDamage}
        />

        {showDamageForm && (
          <DamageRecordForm
            onSubmit={handleAddDamageRecord}
            onCancel={() => setShowDamageForm(false)}
            auditId={auditData.id}
          />
        )}
      </div>

      <div className="form-actions">
        <button
          type="button"
          onClick={() => navigate('/audits')}
          className="cancel-btn"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="submit-btn"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Audit'}
        </button>
      </div>
    </div>
  );
};

export default AuditForm;
