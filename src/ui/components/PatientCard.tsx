/**
 * Patient Card component with FHIR support
 */

import React from 'react';
import type { CSSProperties, ReactElement, ReactNode } from 'react';
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

export const PatientCard = ({
  patient,
  showPhoto = true,
  showIdentifiers = true,
  showContact = true,
  onPatientClick,
  compact = false,
  rtl = false,
  ...baseProps
}: PatientCardProps): ReactElement => {
  const primaryName = patient.name?.[0];
  const givenName = primaryName?.given?.join(' ') ?? '';
  const familyName = primaryName?.family ?? '';
  const textName = primaryName?.text;
  const fallbackName = `${givenName} ${familyName}`.trim();
  const displayName =
    textName ?? (fallbackName.length > 0 ? fallbackName : undefined) ?? 'Unknown Patient';

  const primaryIdentifier =
    patient.identifier?.find(identifier => identifier.type?.text === 'National ID') ??
    patient.identifier?.[0];

  const photoUrl = patient.photo?.[0]?.url;
  const age = patient.birthDate ? calculateAge(patient.birthDate) : null;
  const primaryAddress = patient.address?.[0];

  const handleClick = () => {
    if (onPatientClick) {
      onPatientClick(patient);
    }
  };

  const cardStyle: CSSProperties = {
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

  const contentStyle: CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: compact ? '4px' : '8px',
  };

  const nameStyle: CSSProperties = {
    fontSize: compact ? '16px' : '18px',
    fontWeight: '600',
    color: 'rgba(0, 0, 0, 0.9)',
    margin: 0,
  };

  const detailStyle: CSSProperties = {
    fontSize: '14px',
    color: 'rgba(0, 0, 0, 0.7)',
    margin: 0,
  };
  const metadataContainerStyle: CSSProperties = {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
  };

  const contactContainerStyle: CSSProperties = {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
  };

  const { style: incomingStyle, className: incomingClassName, ...restBaseProps } = baseProps;
  const mergedStyle: CSSProperties = {
    ...cardStyle,
    ...(incomingStyle ?? {}),
  };

  const combinedClassName = ['patient-card', incomingClassName].filter(Boolean).join(' ');

  const children: ReactNode[] = [];

  if (showPhoto && photoUrl) {
    children.push(
      React.createElement(
        'div',
        {
          key: 'photo',
          style: {
            width: compact ? '40px' : '60px',
            height: compact ? '40px' : '60px',
            borderRadius: '50%',
            overflow: 'hidden',
            flexShrink: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
          },
        },
        React.createElement('img', {
          src: photoUrl,
          alt: displayName,
          style: {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          },
        })
      )
    );
  }

  const contentChildren: ReactNode[] = [
    React.createElement('h3', { key: 'name', style: nameStyle }, displayName),
  ];

  const metadataChildren: ReactNode[] = [];

  if (patient.gender) {
    metadataChildren.push(
      React.createElement(
        'span',
        { key: 'gender', style: detailStyle },
        rtl ? 'الجنس:' : 'Gender:',
        ' ',
        patient.gender
      )
    );
  }

  if (age) {
    metadataChildren.push(
      React.createElement(
        'span',
        { key: 'age', style: detailStyle },
        rtl ? 'العمر:' : 'Age:',
        ' ',
        age,
        ' ',
        rtl ? 'سنة' : 'years'
      )
    );
  }

  if (metadataChildren.length > 0) {
    contentChildren.push(
      React.createElement(
        'div',
        { key: 'metadata', style: metadataContainerStyle },
        ...metadataChildren
      )
    );
  }

  if (showIdentifiers && primaryIdentifier) {
    contentChildren.push(
      React.createElement(
        'div',
        { key: 'identifier', style: detailStyle },
        primaryIdentifier.type?.text ?? (rtl ? 'المعرف' : 'ID'),
        ': ',
        primaryIdentifier.value
      )
    );
  }

  const contactChildren: ReactNode[] = [];

  if (patient.phone) {
    contactChildren.push(
      React.createElement(
        'span',
        { key: 'phone', style: detailStyle },
        rtl ? 'الهاتف:' : 'Phone:',
        ' ',
        patient.phone
      )
    );
  }

  if (patient.email) {
    contactChildren.push(
      React.createElement(
        'span',
        { key: 'email', style: detailStyle },
        rtl ? 'البريد:' : 'Email:',
        ' ',
        patient.email
      )
    );
  }

  if (showContact && !compact && contactChildren.length > 0) {
    contentChildren.push(
      React.createElement(
        'div',
        { key: 'contact', style: contactContainerStyle },
        ...contactChildren
      )
    );
  }

  if (primaryAddress && !compact) {
    contentChildren.push(
      React.createElement(
        'div',
        { key: 'address', style: detailStyle },
        rtl ? 'العنوان:' : 'Address:',
        ' ',
        formatAddress(primaryAddress, rtl)
      )
    );
  }

  children.push(
    React.createElement('div', { key: 'content', style: contentStyle }, ...contentChildren)
  );

  if (patient.gender) {
    children.push(
      React.createElement('div', {
        key: 'indicator',
        style: {
          position: 'absolute',
          top: '8px',
          right: rtl ? 'auto' : '8px',
          left: rtl ? '8px' : 'auto',
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: patient.gender === 'male' ? '#3B82F6' : '#EC4899',
        },
      })
    );
  }

  return React.createElement(
    BaseComponent,
    {
      ...restBaseProps,
      style: mergedStyle,
      rtl,
      className: combinedClassName,
      onClick: onPatientClick ? handleClick : undefined,
    },
    ...children
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
  const parts = [...(address.line ?? []), address.city, address.country].filter(Boolean);

  return parts.join(rtl ? '، ' : ', ');
};
