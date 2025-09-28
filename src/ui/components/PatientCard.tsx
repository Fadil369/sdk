/**
 * Patient Card component with FHIR support
 */

import React from 'react';
import { BaseComponent, BaseComponentProps } from './Base';

export interface PatientData {
  id: string;
  name: {
    family?: string;
    given?: string[];
    text?: string;
  }[];
  gender?: 'male' | 'female' | 'other' | 'unknown';
  birthDate?: string;
  phone?: string;
  email?: string;
  address?: {
    line?: string[];
    city?: string;
    country?: string;
  }[];
  identifier?: {
    system?: string;
    value?: string;
    type?: {
      text?: string;
    };
  }[];
  photo?: {
    url?: string;
    contentType?: string;
  }[];
}

export interface PatientCardProps extends BaseComponentProps {
  patient: PatientData;
  showPhoto?: boolean;
  showIdentifiers?: boolean;
  showContact?: boolean;
  onPatientClick?: (patient: PatientData) => void;
  compact?: boolean;
}

export const PatientCard: React.FC<PatientCardProps> = ({
  patient,
  showPhoto = true,
  showIdentifiers = true,
  showContact = true,
  onPatientClick,
  compact = false,
  rtl = false,
  ...baseProps
}) => {
  const displayName =
    patient.name?.[0]?.text ||
    `${patient.name?.[0]?.given?.join(' ') || ''} ${patient.name?.[0]?.family || ''}`.trim() ||
    'Unknown Patient';

  const primaryIdentifier =
    patient.identifier?.find(id => id.type?.text === 'National ID') || patient.identifier?.[0];

  const photoUrl = patient.photo?.[0]?.url;
  const age = patient.birthDate ? calculateAge(patient.birthDate) : null;
  const primaryAddress = patient.address?.[0];

  const handleClick = () => {
    if (onPatientClick) {
      onPatientClick(patient);
    }
  };

  const cardStyle: React.CSSProperties = {
    padding: compact ? '12px' : '20px',
    cursor: onPatientClick ? 'pointer' : 'default',
    minHeight: compact ? '80px' : '120px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    position: 'relative',
    ...(onPatientClick && {
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 12px 40px 0 rgba(31, 38, 135, 0.5)',
      },
    }),
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: compact ? '4px' : '8px',
  };

  const nameStyle: React.CSSProperties = {
    fontSize: compact ? '16px' : '18px',
    fontWeight: '600',
    color: 'rgba(0, 0, 0, 0.9)',
    margin: 0,
  };

  const detailStyle: React.CSSProperties = {
    fontSize: '14px',
    color: 'rgba(0, 0, 0, 0.7)',
    margin: 0,
  };

  return (
    <BaseComponent
      {...baseProps}
      style={cardStyle}
      rtl={rtl}
      className={`patient-card ${baseProps.className || ''}`}
      onClick={handleClick}
    >
      {showPhoto && photoUrl && (
        <div
          style={{
            width: compact ? '40px' : '60px',
            height: compact ? '40px' : '60px',
            borderRadius: '50%',
            overflow: 'hidden',
            flexShrink: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
          }}
        >
          <img
            src={photoUrl}
            alt={displayName}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>
      )}

      <div style={contentStyle}>
        <h3 style={nameStyle}>{displayName}</h3>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {patient.gender && (
            <span style={detailStyle}>
              {rtl ? 'الجنس:' : 'Gender:'} {patient.gender}
            </span>
          )}

          {age && (
            <span style={detailStyle}>
              {rtl ? 'العمر:' : 'Age:'} {age} {rtl ? 'سنة' : 'years'}
            </span>
          )}
        </div>

        {showIdentifiers && primaryIdentifier && (
          <div style={detailStyle}>
            {primaryIdentifier.type?.text || (rtl ? 'المعرف' : 'ID')}: {primaryIdentifier.value}
          </div>
        )}

        {showContact && (patient.phone || patient.email) && !compact && (
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {patient.phone && (
              <span style={detailStyle}>
                {rtl ? 'الهاتف:' : 'Phone:'} {patient.phone}
              </span>
            )}
            {patient.email && (
              <span style={detailStyle}>
                {rtl ? 'البريد:' : 'Email:'} {patient.email}
              </span>
            )}
          </div>
        )}

        {primaryAddress && !compact && (
          <div style={detailStyle}>
            {rtl ? 'العنوان:' : 'Address:'} {formatAddress(primaryAddress, rtl)}
          </div>
        )}
      </div>

      {patient.gender && (
        <div
          style={{
            position: 'absolute',
            top: '8px',
            right: rtl ? 'auto' : '8px',
            left: rtl ? '8px' : 'auto',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: patient.gender === 'male' ? '#3B82F6' : '#EC4899',
          }}
        />
      )}
    </BaseComponent>
  );
};

// Helper functions
const calculateAge = (birthDate: string): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
};

const formatAddress = (address: NonNullable<PatientData['address']>[0], rtl: boolean): string => {
  const parts = [...(address.line || []), address.city, address.country].filter(Boolean);

  return parts.join(rtl ? '، ' : ', ');
};
