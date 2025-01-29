import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import localforage from 'localforage';
import './styles.css';

const DAMAGE_TYPES = [
  'Beam Safety Clips Missing',
  'Upright Damaged',
  'Upright/Footplate Twisted',
  'Footplate Damaged/Missing',
  'Floor Fixing Damaged/Missing',
  'Horizontal Brace Damaged',
  'Diagonal Brace Damaged',
  'Beam Damaged',
  'Beam Dislodged',
  'Row Spacer Damaged/Missing',
  'Mesh Deck missing/damaged',
  'Barrier/Guard Damaged/Missing',
  'Load Sign Incorrect/Missing',
  'Splice Incorrect/Poor Quality',
  'Frames not compatible with Beam',
  'Other'
];

const RECOMMENDATIONS = {
  'Beam Safety Clips Missing': 'Replace Safety Beam Clip',
  'Upright Damaged': 'Replace Upright',
  'Upright/Footplate Twisted': 'Straighten Upright/Footplate',
  'Footplate Damaged/Missing': 'Replace Footplate',
  'Floor Fixing Damaged/Missing': 'Replace Floor Fixing',
  'Horizontal Brace Damaged': 'Replace Horizontal Brace',
  'Diagonal Brace Damaged': 'Replace Diagonal Brace',
  'Beam Damaged': 'Replace Beam',
  'Beam Dislodged': 'Re-Engage Dislodged Beam',
  'Row Spacer Damaged/Missing': 'Replace Row Spacer',
  'Mesh Deck missing/damaged': 'Replace Mesh Deck',
  'Barrier/Guard Damaged/Missing': 'Replace Barrier/Guard',
  'Load Sign Incorrect/Missing': 'Replace Load Sign',
  'Splice Incorrect/Poor Quality': 'Replace Splice',
  'Frames not compatible with Beam': 'Unload and replace Frames and or beams'
};

const DamageRecordForm = ({ onSubmit, onCancel, auditId }) => {
  const [formData, setFormData] = useState({
    damage_type: '',
    risk_level: '',
    location_details: '',
    photo_url: null,
    notes: '',
    recommendation: ''
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [customDamageType, setCustomDamageType] = useState('');
  const [customRecommendation, setCustomRecommendation] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'damage_type' && value !== 'Other' ? { recommendation: RECOMMENDATIONS[value] } : {})
    }));
    if (name === 'damage_type' && value === 'Other') {
      setCustomDamageType('');
      setCustomRecommendation('');
    }
  };

  const handleCustomChange = (e) => {
    const { name, value } = e.target;
    if (name === 'customDamageType') {
      setCustomDamageType(value);
    } else if (name === 'customRecommendation') {
      setCustomRecommendation(value);
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      setUploadError(null);

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      const fileExt = file.name.split('.').pop();
      const allowedTypes = ['jpg', 'jpeg', 'png'];
      if (!allowedTypes.includes(fileExt.toLowerCase())) {
        throw new Error('Only JPG and PNG files are allowed');
      }

      // Convert file to base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Store photo in localforage
      const photoId = `photo-${Date.now()}`;
      await localforage.setItem(photoId, {
        base64,
        contentType: file.type,
        name: file.name
      });

      setFormData(prev => ({
        ...prev,
        photo_url: photoId // Store the ID instead of the URL
      }));
    } catch (error) {
      console.error('Error handling photo:', error);
      setUploadError(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalDamageType = formData.damage_type === 'Other' ? customDamageType : formData.damage_type;
    const finalRecommendation = formData.damage_type === 'Other' ? customRecommendation : formData.recommendation;
  
    // Ensure auditId is available
    if (!auditId) {
      console.error('Error: auditId is not available in handleSubmit');
      alert('Error: auditId is missing. Cannot add damage record.');
      return;
    }
  
    // Add to upload queue
    const record = {
      ...formData,
      audit_id: auditId, // Use the passed auditId
      damage_type: finalDamageType,
      recommendation: finalRecommendation,
      status: 'pending' // Add a status to indicate pending upload
    };
  
    try {
      await localforage.setItem(`audit-${Date.now()}`, record);
      onSubmit(record);
      setFormData({
        damage_type: '',
        risk_level: '',
        location_details: '',
        photo_url: null,
        notes: '',
        recommendation: ''
      });
      setCustomDamageType('');
      setCustomRecommendation('');
    } catch (error) {
      console.error('Error adding record to localforage:', error);
      alert('Failed to add damage record: ' + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="damage-record-form">
      <div className="form-grid">
        <div className="form-field">
          <label>Damage Type</label>
          <select
            name="damage_type"
            value={formData.damage_type}
            onChange={handleChange}
            required
          >
            <option value="">Select Damage Type</option>
            {DAMAGE_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {formData.damage_type === 'Other' && (
          <>
            <div className="form-field">
              <label>Custom Damage Type</label>
              <input
                type="text"
                name="customDamageType"
                value={customDamageType}
                onChange={handleCustomChange}
                required
              />
            </div>
            <div className="form-field">
              <label>Custom Recommendation</label>
              <input
                type="text"
                name="customRecommendation"
                value={customRecommendation}
                onChange={handleCustomChange}
                required
              />
            </div>
          </>
        )}

        <div className="form-field">
          <label>Risk Level</label>
          <select
            name="risk_level"
            value={formData.risk_level}
            onChange={handleChange}
            required
          >
            <option value="">Select Risk Level</option>
            <option value="RED">Red Risk</option>
            <option value="AMBER">Amber Risk</option>
            <option value="GREEN">Green Risk</option>
          </select>
        </div>

        <div className="form-field">
          <label>Location Details</label>
          <input
            type="text"
            name="location_details"
            value={formData.location_details}
            onChange={handleChange}
            placeholder="Aisle-Bay-Level-Side"
            required
          />
        </div>

        <div className="form-field">
          <label>Photo</label>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoChange}
            disabled={uploading}
          />
          {uploading && <span className="upload-status">Uploading...</span>}
          {uploadError && <span className="upload-error">{uploadError}</span>}
          {formData.photo_url && <span className="upload-success">Photo uploaded successfully</span>}
        </div>

        <div className="form-field full-width">
          <label>Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
          />
        </div>

        {formData.damage_type !== 'Other' && (
          <div className="form-field full-width">
            <label>Recommendation</label>
            <input
              type="text"
              name="recommendation"
              value={formData.recommendation}
              onChange={handleChange}
              required
            />
          </div>
        )}
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="cancel-btn">
          Cancel
        </button>
        <button type="submit" className="submit-btn" disabled={uploading}>
          Add Record
        </button>
      </div>
    </form>
  );
};

export default DamageRecordForm;
