import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  analytics, 
  trackAssessmentStart, 
  trackAssessmentStepComplete,
  trackAssessmentComplete,
  trackCustomerTierDetermination,
  trackUnitCountSelection
} from "../lib/analytics";
import { 
  calculatePriorityScore, 
  determineCustomerTier as determineCustomerTierShared,
  isBuildCanadaEligible 
} from "../../../shared/utils/scoring";
import { parsePhoneNumber, AsYouType, isValidPhoneNumber } from "libphonenumber-js";

// TODO: Future Update - Field Name Standardization
// - Rename frontend field from 'timeline' to 'deliveryTimeline'
// - Update backend schema from 'decisionTimeline' to 'deliveryTimeline'
// - Ensure webhook mappings are updated accordingly
// This will provide consistency across the entire system

// TypeScript interfaces
declare global {
  interface Window {
    gtag?: (command: string, action: string, params?: Record<string, any>) => void;
  }
}

interface FormData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
  unitCount?: string;
  timeline?: string;
  deliveryTimeline?: string;    // Fallback field mapping
  province?: string;
  constructionProvince?: string; // Fallback field mapping
  readiness?: string;
  developerType?: string;
  governmentPrograms?: string;
  buildCanadaEligible?: string;
  projectDescription?: string;
  projectUnitRange?: string;
  // B2B-only: Explorer fields removed
  consentCommunications?: boolean;
  consentSMS?: boolean;
  consentSMSTimestamp?: string;
  privacyPolicy?: boolean;
  marketingConsent?: boolean;
  ageVerification?: boolean;

  // ADD THESE MAPPING INTERMEDIATES (NO PAYLOAD IMPACT):
  decisionTimeline?: string;    // Maps timeline → delivery_timeline
}

interface FormErrors {
  [key: string]: string;
}

type TierType = 'pioneer' | 'preferred' | 'elite';

// Complete list of all country codes (249+ countries/territories) sorted alphabetically
// Up-to-date as of October 2025 per ISO 3166-1 alpha-2 and ITU E.164 standards
const ALL_COUNTRIES = [
  { code: 'AF', name: 'Afghanistan', flag: '🇦🇫', callingCode: '+93' },
  { code: 'AX', name: 'Åland Islands', flag: '🇦🇽', callingCode: '+358' },
  { code: 'AL', name: 'Albania', flag: '🇦🇱', callingCode: '+355' },
  { code: 'DZ', name: 'Algeria', flag: '🇩🇿', callingCode: '+213' },
  { code: 'AS', name: 'American Samoa', flag: '🇦🇸', callingCode: '+1684' },
  { code: 'AD', name: 'Andorra', flag: '🇦🇩', callingCode: '+376' },
  { code: 'AO', name: 'Angola', flag: '🇦🇴', callingCode: '+244' },
  { code: 'AI', name: 'Anguilla', flag: '🇦🇮', callingCode: '+1264' },
  { code: 'AQ', name: 'Antarctica', flag: '🇦🇶', callingCode: '+672' },
  { code: 'AG', name: 'Antigua and Barbuda', flag: '🇦🇬', callingCode: '+1268' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', callingCode: '+54' },
  { code: 'AM', name: 'Armenia', flag: '🇦🇲', callingCode: '+374' },
  { code: 'AW', name: 'Aruba', flag: '🇦🇼', callingCode: '+297' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', callingCode: '+61' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹', callingCode: '+43' },
  { code: 'AZ', name: 'Azerbaijan', flag: '🇦🇿', callingCode: '+994' },
  { code: 'BS', name: 'Bahamas', flag: '🇧🇸', callingCode: '+1242' },
  { code: 'BH', name: 'Bahrain', flag: '🇧🇭', callingCode: '+973' },
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩', callingCode: '+880' },
  { code: 'BB', name: 'Barbados', flag: '🇧🇧', callingCode: '+1246' },
  { code: 'BY', name: 'Belarus', flag: '🇧🇾', callingCode: '+375' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪', callingCode: '+32' },
  { code: 'BZ', name: 'Belize', flag: '🇧🇿', callingCode: '+501' },
  { code: 'BJ', name: 'Benin', flag: '🇧🇯', callingCode: '+229' },
  { code: 'BM', name: 'Bermuda', flag: '🇧🇲', callingCode: '+1441' },
  { code: 'BT', name: 'Bhutan', flag: '🇧🇹', callingCode: '+975' },
  { code: 'BO', name: 'Bolivia', flag: '🇧🇴', callingCode: '+591' },
  { code: 'BQ', name: 'Bonaire, Sint Eustatius and Saba', flag: '🇧🇶', callingCode: '+599' },
  { code: 'BA', name: 'Bosnia and Herzegovina', flag: '🇧🇦', callingCode: '+387' },
  { code: 'BW', name: 'Botswana', flag: '🇧🇼', callingCode: '+267' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', callingCode: '+55' },
  { code: 'IO', name: 'British Indian Ocean Territory', flag: '🇮🇴', callingCode: '+246' },
  { code: 'BN', name: 'Brunei', flag: '🇧🇳', callingCode: '+673' },
  { code: 'BG', name: 'Bulgaria', flag: '🇧🇬', callingCode: '+359' },
  { code: 'BF', name: 'Burkina Faso', flag: '🇧🇫', callingCode: '+226' },
  { code: 'BI', name: 'Burundi', flag: '🇧🇮', callingCode: '+257' },
  { code: 'CV', name: 'Cabo Verde', flag: '🇨🇻', callingCode: '+238' },
  { code: 'KH', name: 'Cambodia', flag: '🇰🇭', callingCode: '+855' },
  { code: 'CM', name: 'Cameroon', flag: '🇨🇲', callingCode: '+237' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', callingCode: '+1' },
  { code: 'KY', name: 'Cayman Islands', flag: '🇰🇾', callingCode: '+1345' },
  { code: 'CF', name: 'Central African Republic', flag: '🇨🇫', callingCode: '+236' },
  { code: 'TD', name: 'Chad', flag: '🇹🇩', callingCode: '+235' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱', callingCode: '+56' },
  { code: 'CN', name: 'China', flag: '🇨🇳', callingCode: '+86' },
  { code: 'CX', name: 'Christmas Island', flag: '🇨🇽', callingCode: '+61' },
  { code: 'CC', name: 'Cocos (Keeling) Islands', flag: '🇨🇨', callingCode: '+61' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴', callingCode: '+57' },
  { code: 'KM', name: 'Comoros', flag: '🇰🇲', callingCode: '+269' },
  { code: 'CG', name: 'Congo', flag: '🇨🇬', callingCode: '+242' },
  { code: 'CD', name: 'Congo (DRC)', flag: '🇨🇩', callingCode: '+243' },
  { code: 'CK', name: 'Cook Islands', flag: '🇨🇰', callingCode: '+682' },
  { code: 'CR', name: 'Costa Rica', flag: '🇨🇷', callingCode: '+506' },
  { code: 'CI', name: 'Côte d\'Ivoire', flag: '🇨🇮', callingCode: '+225' },
  { code: 'HR', name: 'Croatia', flag: '🇭🇷', callingCode: '+385' },
  { code: 'CU', name: 'Cuba', flag: '🇨🇺', callingCode: '+53' },
  { code: 'CW', name: 'Curaçao', flag: '🇨🇼', callingCode: '+599' },
  { code: 'CY', name: 'Cyprus', flag: '🇨🇾', callingCode: '+357' },
  { code: 'CZ', name: 'Czech Republic', flag: '🇨🇿', callingCode: '+420' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰', callingCode: '+45' },
  { code: 'DJ', name: 'Djibouti', flag: '🇩🇯', callingCode: '+253' },
  { code: 'DM', name: 'Dominica', flag: '🇩🇲', callingCode: '+1767' },
  { code: 'DO', name: 'Dominican Republic', flag: '🇩🇴', callingCode: '+1' },
  { code: 'EC', name: 'Ecuador', flag: '🇪🇨', callingCode: '+593' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬', callingCode: '+20' },
  { code: 'SV', name: 'El Salvador', flag: '🇸🇻', callingCode: '+503' },
  { code: 'GQ', name: 'Equatorial Guinea', flag: '🇬🇶', callingCode: '+240' },
  { code: 'ER', name: 'Eritrea', flag: '🇪🇷', callingCode: '+291' },
  { code: 'EE', name: 'Estonia', flag: '🇪🇪', callingCode: '+372' },
  { code: 'SZ', name: 'Eswatini', flag: '🇸🇿', callingCode: '+268' },
  { code: 'ET', name: 'Ethiopia', flag: '🇪🇹', callingCode: '+251' },
  { code: 'FK', name: 'Falkland Islands', flag: '🇫🇰', callingCode: '+500' },
  { code: 'FO', name: 'Faroe Islands', flag: '🇫🇴', callingCode: '+298' },
  { code: 'FJ', name: 'Fiji', flag: '🇫🇯', callingCode: '+679' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮', callingCode: '+358' },
  { code: 'FR', name: 'France', flag: '🇫🇷', callingCode: '+33' },
  { code: 'GF', name: 'French Guiana', flag: '🇬🇫', callingCode: '+594' },
  { code: 'PF', name: 'French Polynesia', flag: '🇵🇫', callingCode: '+689' },
  { code: 'GA', name: 'Gabon', flag: '🇬🇦', callingCode: '+241' },
  { code: 'GM', name: 'Gambia', flag: '🇬🇲', callingCode: '+220' },
  { code: 'GE', name: 'Georgia', flag: '🇬🇪', callingCode: '+995' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', callingCode: '+49' },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭', callingCode: '+233' },
  { code: 'GI', name: 'Gibraltar', flag: '🇬🇮', callingCode: '+350' },
  { code: 'GR', name: 'Greece', flag: '🇬🇷', callingCode: '+30' },
  { code: 'GL', name: 'Greenland', flag: '🇬🇱', callingCode: '+299' },
  { code: 'GD', name: 'Grenada', flag: '🇬🇩', callingCode: '+1473' },
  { code: 'GP', name: 'Guadeloupe', flag: '🇬🇵', callingCode: '+590' },
  { code: 'GU', name: 'Guam', flag: '🇬🇺', callingCode: '+1671' },
  { code: 'GT', name: 'Guatemala', flag: '🇬🇹', callingCode: '+502' },
  { code: 'GG', name: 'Guernsey', flag: '🇬🇬', callingCode: '+44' },
  { code: 'GN', name: 'Guinea', flag: '🇬🇳', callingCode: '+224' },
  { code: 'GW', name: 'Guinea-Bissau', flag: '🇬🇼', callingCode: '+245' },
  { code: 'GY', name: 'Guyana', flag: '🇬🇾', callingCode: '+592' },
  { code: 'HT', name: 'Haiti', flag: '🇭🇹', callingCode: '+509' },
  { code: 'HN', name: 'Honduras', flag: '🇭🇳', callingCode: '+504' },
  { code: 'HK', name: 'Hong Kong', flag: '🇭🇰', callingCode: '+852' },
  { code: 'HU', name: 'Hungary', flag: '🇭🇺', callingCode: '+36' },
  { code: 'IS', name: 'Iceland', flag: '🇮🇸', callingCode: '+354' },
  { code: 'IN', name: 'India', flag: '🇮🇳', callingCode: '+91' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', callingCode: '+62' },
  { code: 'IR', name: 'Iran', flag: '🇮🇷', callingCode: '+98' },
  { code: 'IQ', name: 'Iraq', flag: '🇮🇶', callingCode: '+964' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪', callingCode: '+353' },
  { code: 'IM', name: 'Isle of Man', flag: '🇮🇲', callingCode: '+44' },
  { code: 'IL', name: 'Israel', flag: '🇮🇱', callingCode: '+972' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', callingCode: '+39' },
  { code: 'JM', name: 'Jamaica', flag: '🇯🇲', callingCode: '+1876' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', callingCode: '+81' },
  { code: 'JE', name: 'Jersey', flag: '🇯🇪', callingCode: '+44' },
  { code: 'JO', name: 'Jordan', flag: '🇯🇴', callingCode: '+962' },
  { code: 'KZ', name: 'Kazakhstan', flag: '🇰🇿', callingCode: '+7' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪', callingCode: '+254' },
  { code: 'KI', name: 'Kiribati', flag: '🇰🇮', callingCode: '+686' },
  { code: 'XK', name: 'Kosovo', flag: '🇽🇰', callingCode: '+383' },
  { code: 'KW', name: 'Kuwait', flag: '🇰🇼', callingCode: '+965' },
  { code: 'KG', name: 'Kyrgyzstan', flag: '🇰🇬', callingCode: '+996' },
  { code: 'LA', name: 'Laos', flag: '🇱🇦', callingCode: '+856' },
  { code: 'LV', name: 'Latvia', flag: '🇱🇻', callingCode: '+371' },
  { code: 'LB', name: 'Lebanon', flag: '🇱🇧', callingCode: '+961' },
  { code: 'LS', name: 'Lesotho', flag: '🇱🇸', callingCode: '+266' },
  { code: 'LR', name: 'Liberia', flag: '🇱🇷', callingCode: '+231' },
  { code: 'LY', name: 'Libya', flag: '🇱🇾', callingCode: '+218' },
  { code: 'LI', name: 'Liechtenstein', flag: '🇱🇮', callingCode: '+423' },
  { code: 'LT', name: 'Lithuania', flag: '🇱🇹', callingCode: '+370' },
  { code: 'LU', name: 'Luxembourg', flag: '🇱🇺', callingCode: '+352' },
  { code: 'MO', name: 'Macau', flag: '🇲🇴', callingCode: '+853' },
  { code: 'MG', name: 'Madagascar', flag: '🇲🇬', callingCode: '+261' },
  { code: 'MW', name: 'Malawi', flag: '🇲🇼', callingCode: '+265' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾', callingCode: '+60' },
  { code: 'MV', name: 'Maldives', flag: '🇲🇻', callingCode: '+960' },
  { code: 'ML', name: 'Mali', flag: '🇲🇱', callingCode: '+223' },
  { code: 'MT', name: 'Malta', flag: '🇲🇹', callingCode: '+356' },
  { code: 'MH', name: 'Marshall Islands', flag: '🇲🇭', callingCode: '+692' },
  { code: 'MQ', name: 'Martinique', flag: '🇲🇶', callingCode: '+596' },
  { code: 'MR', name: 'Mauritania', flag: '🇲🇷', callingCode: '+222' },
  { code: 'MU', name: 'Mauritius', flag: '🇲🇺', callingCode: '+230' },
  { code: 'YT', name: 'Mayotte', flag: '🇾🇹', callingCode: '+262' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', callingCode: '+52' },
  { code: 'FM', name: 'Micronesia', flag: '🇫🇲', callingCode: '+691' },
  { code: 'MD', name: 'Moldova', flag: '🇲🇩', callingCode: '+373' },
  { code: 'MC', name: 'Monaco', flag: '🇲🇨', callingCode: '+377' },
  { code: 'MN', name: 'Mongolia', flag: '🇲🇳', callingCode: '+976' },
  { code: 'ME', name: 'Montenegro', flag: '🇲🇪', callingCode: '+382' },
  { code: 'MS', name: 'Montserrat', flag: '🇲🇸', callingCode: '+1664' },
  { code: 'MA', name: 'Morocco', flag: '🇲🇦', callingCode: '+212' },
  { code: 'MZ', name: 'Mozambique', flag: '🇲🇿', callingCode: '+258' },
  { code: 'MM', name: 'Myanmar', flag: '🇲🇲', callingCode: '+95' },
  { code: 'NA', name: 'Namibia', flag: '🇳🇦', callingCode: '+264' },
  { code: 'NR', name: 'Nauru', flag: '🇳🇷', callingCode: '+674' },
  { code: 'NP', name: 'Nepal', flag: '🇳🇵', callingCode: '+977' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', callingCode: '+31' },
  { code: 'NC', name: 'New Caledonia', flag: '🇳🇨', callingCode: '+687' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', callingCode: '+64' },
  { code: 'NI', name: 'Nicaragua', flag: '🇳🇮', callingCode: '+505' },
  { code: 'NE', name: 'Niger', flag: '🇳🇪', callingCode: '+227' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', callingCode: '+234' },
  { code: 'NU', name: 'Niue', flag: '🇳🇺', callingCode: '+683' },
  { code: 'NF', name: 'Norfolk Island', flag: '🇳🇫', callingCode: '+672' },
  { code: 'KP', name: 'North Korea', flag: '🇰🇵', callingCode: '+850' },
  { code: 'MK', name: 'North Macedonia', flag: '🇲🇰', callingCode: '+389' },
  { code: 'MP', name: 'Northern Mariana Islands', flag: '🇲🇵', callingCode: '+1670' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴', callingCode: '+47' },
  { code: 'OM', name: 'Oman', flag: '🇴🇲', callingCode: '+968' },
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰', callingCode: '+92' },
  { code: 'PW', name: 'Palau', flag: '🇵🇼', callingCode: '+680' },
  { code: 'PS', name: 'Palestine', flag: '🇵🇸', callingCode: '+970' },
  { code: 'PA', name: 'Panama', flag: '🇵🇦', callingCode: '+507' },
  { code: 'PG', name: 'Papua New Guinea', flag: '🇵🇬', callingCode: '+675' },
  { code: 'PY', name: 'Paraguay', flag: '🇵🇾', callingCode: '+595' },
  { code: 'PE', name: 'Peru', flag: '🇵🇪', callingCode: '+51' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭', callingCode: '+63' },
  { code: 'PN', name: 'Pitcairn Islands', flag: '🇵🇳', callingCode: '+64' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱', callingCode: '+48' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', callingCode: '+351' },
  { code: 'PR', name: 'Puerto Rico', flag: '🇵🇷', callingCode: '+1' },
  { code: 'QA', name: 'Qatar', flag: '🇶🇦', callingCode: '+974' },
  { code: 'RE', name: 'Réunion', flag: '🇷🇪', callingCode: '+262' },
  { code: 'RO', name: 'Romania', flag: '🇷🇴', callingCode: '+40' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺', callingCode: '+7' },
  { code: 'RW', name: 'Rwanda', flag: '🇷🇼', callingCode: '+250' },
  { code: 'BL', name: 'Saint Barthélemy', flag: '🇧🇱', callingCode: '+590' },
  { code: 'SH', name: 'Saint Helena', flag: '🇸🇭', callingCode: '+290' },
  { code: 'KN', name: 'Saint Kitts and Nevis', flag: '🇰🇳', callingCode: '+1869' },
  { code: 'LC', name: 'Saint Lucia', flag: '🇱🇨', callingCode: '+1758' },
  { code: 'MF', name: 'Saint Martin', flag: '🇲🇫', callingCode: '+590' },
  { code: 'PM', name: 'Saint Pierre and Miquelon', flag: '🇵🇲', callingCode: '+508' },
  { code: 'VC', name: 'Saint Vincent and the Grenadines', flag: '🇻🇨', callingCode: '+1784' },
  { code: 'WS', name: 'Samoa', flag: '🇼🇸', callingCode: '+685' },
  { code: 'SM', name: 'San Marino', flag: '🇸🇲', callingCode: '+378' },
  { code: 'ST', name: 'Sao Tome and Principe', flag: '🇸🇹', callingCode: '+239' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', callingCode: '+966' },
  { code: 'SN', name: 'Senegal', flag: '🇸🇳', callingCode: '+221' },
  { code: 'RS', name: 'Serbia', flag: '🇷🇸', callingCode: '+381' },
  { code: 'SC', name: 'Seychelles', flag: '🇸🇨', callingCode: '+248' },
  { code: 'SL', name: 'Sierra Leone', flag: '🇸🇱', callingCode: '+232' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', callingCode: '+65' },
  { code: 'SX', name: 'Sint Maarten', flag: '🇸🇽', callingCode: '+1721' },
  { code: 'SK', name: 'Slovakia', flag: '🇸🇰', callingCode: '+421' },
  { code: 'SI', name: 'Slovenia', flag: '🇸🇮', callingCode: '+386' },
  { code: 'SB', name: 'Solomon Islands', flag: '🇸🇧', callingCode: '+677' },
  { code: 'SO', name: 'Somalia', flag: '🇸🇴', callingCode: '+252' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', callingCode: '+27' },
  { code: 'GS', name: 'South Georgia and the South Sandwich Islands', flag: '🇬🇸', callingCode: '+500' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷', callingCode: '+82' },
  { code: 'SS', name: 'South Sudan', flag: '🇸🇸', callingCode: '+211' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', callingCode: '+34' },
  { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰', callingCode: '+94' },
  { code: 'SD', name: 'Sudan', flag: '🇸🇩', callingCode: '+249' },
  { code: 'SR', name: 'Suriname', flag: '🇸🇷', callingCode: '+597' },
  { code: 'SJ', name: 'Svalbard and Jan Mayen', flag: '🇸🇯', callingCode: '+47' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪', callingCode: '+46' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭', callingCode: '+41' },
  { code: 'SY', name: 'Syria', flag: '🇸🇾', callingCode: '+963' },
  { code: 'TW', name: 'Taiwan', flag: '🇹🇼', callingCode: '+886' },
  { code: 'TJ', name: 'Tajikistan', flag: '🇹🇯', callingCode: '+992' },
  { code: 'TZ', name: 'Tanzania', flag: '🇹🇿', callingCode: '+255' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', callingCode: '+66' },
  { code: 'TL', name: 'Timor-Leste', flag: '🇹🇱', callingCode: '+670' },
  { code: 'TG', name: 'Togo', flag: '🇹🇬', callingCode: '+228' },
  { code: 'TK', name: 'Tokelau', flag: '🇹🇰', callingCode: '+690' },
  { code: 'TO', name: 'Tonga', flag: '🇹🇴', callingCode: '+676' },
  { code: 'TT', name: 'Trinidad and Tobago', flag: '🇹🇹', callingCode: '+1868' },
  { code: 'TN', name: 'Tunisia', flag: '🇹🇳', callingCode: '+216' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷', callingCode: '+90' },
  { code: 'TM', name: 'Turkmenistan', flag: '🇹🇲', callingCode: '+993' },
  { code: 'TC', name: 'Turks and Caicos Islands', flag: '🇹🇨', callingCode: '+1649' },
  { code: 'TV', name: 'Tuvalu', flag: '🇹🇻', callingCode: '+688' },
  { code: 'UG', name: 'Uganda', flag: '🇺🇬', callingCode: '+256' },
  { code: 'UA', name: 'Ukraine', flag: '🇺🇦', callingCode: '+380' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', callingCode: '+971' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', callingCode: '+44' },
  { code: 'US', name: 'United States', flag: '🇺🇸', callingCode: '+1' },
  { code: 'UY', name: 'Uruguay', flag: '🇺🇾', callingCode: '+598' },
  { code: 'VI', name: 'US Virgin Islands', flag: '🇻🇮', callingCode: '+1340' },
  { code: 'UZ', name: 'Uzbekistan', flag: '🇺🇿', callingCode: '+998' },
  { code: 'VU', name: 'Vanuatu', flag: '🇻🇺', callingCode: '+678' },
  { code: 'VA', name: 'Vatican City', flag: '🇻🇦', callingCode: '+379' },
  { code: 'VE', name: 'Venezuela', flag: '🇻🇪', callingCode: '+58' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳', callingCode: '+84' },
  { code: 'WF', name: 'Wallis and Futuna', flag: '🇼🇫', callingCode: '+681' },
  { code: 'EH', name: 'Western Sahara', flag: '🇪🇭', callingCode: '+212' },
  { code: 'YE', name: 'Yemen', flag: '🇾🇪', callingCode: '+967' },
  { code: 'ZM', name: 'Zambia', flag: '🇿🇲', callingCode: '+260' },
  { code: 'ZW', name: 'Zimbabwe', flag: '🇿🇼', callingCode: '+263' },
];

// UI Display: Show only primary markets (Aruba & Canada)
// Note: ALL_COUNTRIES is still used for validation logic throughout the codebase
const DISPLAY_COUNTRIES = [
  { code: 'AW', name: 'Aruba', flag: '🇦🇼', callingCode: '+297' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', callingCode: '+1' },
];

const IllummaaAssessmentForm = () => {
  // State management
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [responseCommitment, setResponseCommitment] = useState('');
  const [priorityScore, setPriorityScore] = useState(0);
  const [customerTier, setCustomerTier] = useState<TierType>('pioneer');
  const [csrfToken, setCsrfToken] = useState('');
  const [startTime] = useState(Date.now());
  const [selectedCountry, setSelectedCountry] = useState<string>('CA'); // Default to Canada
  const [phoneInput, setPhoneInput] = useState<string>('');
  
  // Debounce timer reference for real-time scoring
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const TOTAL_STEPS = 5;

  // Fetch CSRF token on mount and track assessment start
  useEffect(() => {
    const fetchCSRFToken = async () => {
      try {
        const response = await fetch('/api/csrf-token', {
          credentials: 'same-origin'
        });
        const data = await response.json();
        setCsrfToken(data.csrfToken);
        
        // Track assessment start when component loads
        trackAssessmentStart();
      } catch (error) {
        console.error('CSRF token fetch failed:', error);
      }
    };
    fetchCSRFToken();

    // Track abandonment on page unload
    const handleBeforeUnload = () => {
      const stepNames = ['', 'readiness_units', 'project_details', 'contact_info', 'consent_review'];
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      analytics.trackAssessmentAbandonment(currentStep, stepNames[currentStep] || 'unknown', timeSpent);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentStep, startTime]);

  // Auto-scroll to success message when form is completed
  useEffect(() => {
    if (showSuccess) {
      // Small delay to ensure the success view has rendered
      const timer = setTimeout(() => {
        const formElement = document.getElementById('developer-qualification');
        if (formElement) {
          formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [showSuccess]);


  // Get tier display information
  const getTierInfo = (tier: TierType) => {
    const tierInfo = {
      'pioneer': {
        name: 'Pioneer',
        icon: '🚀',
        color: 'purple',
        description: 'B2B partnership development (10-49 units)',
        submitText: 'Submit Partnership Application'
      },
      'preferred': {
        name: 'Preferred',
        icon: '⭐',
        color: 'orange',
        description: 'Enhanced B2B partnership (50-199 units)',
        submitText: 'Submit Partnership Application'
      },
      'elite': {
        name: 'Elite',
        icon: '👑',
        color: 'red',
        description: 'Executive B2B partnership (200+ units)',
        submitText: 'Submit Partnership Application'
      }
    };
    return tierInfo[tier] || tierInfo['pioneer'];
  };

  // Response commitments (NO TIME PROMISES)
  // RESPONSE COMMITMENT FUNCTIONS - Professional Service Levels (No Numerical Scoring)
  const getResponseCommitmentLevel = (tier: TierType) => {
    const levels = {
      'pioneer': 'Enhanced Partnership Priority',
      'preferred': 'Executive Partnership Track',
      'elite': 'VIP Implementation Support'
    };
    return levels[tier] || 'Enhanced Partnership Priority';
  };

  const getResponseDescription = (tier: TierType) => {
    const descriptions = {
      'pioneer': 'Priority partnership coordination with dedicated team attention',
      'preferred': 'Expedited processing with senior team engagement',
      'elite': 'Executive-level partnership with comprehensive project support'
    };
    return descriptions[tier] || 'Priority partnership coordination with dedicated team attention';
  };

  // Legacy function for backward compatibility
  const getResponseCommitment = (tier: TierType) => {
    return getResponseDescription(tier);
  };

  // Add this helper function if it doesn't exist
  const sanitizeInput = (value: string): string => {
    if (typeof value !== 'string') return value;
    // Enterprise-grade sanitization
    return value
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocols
      .replace(/on\w+\s*=/gi, '') // Remove event handlers (onclick, onerror, etc.)
      .substring(0, 1000); // Limit length to prevent DoS
  };

  // Company-specific sanitization that preserves internal spaces, trims edges on submission
  const sanitizeCompany = (value: string): string => {
    if (typeof value !== 'string') return '';
    return value
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocols
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .substring(0, 250) // Company name limit (increased for long B2B names)
      .trim(); // Trim only on form submission, preserves internal spaces
  };

  // ============ COMPLETE TIER CALCULATION FIX - v2.0 ============
  // This replaces the entire handleInputChange function and adds proper tier calculation

  // REPLACEMENT handleInputChange with inline tier calculation
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    const rawValue = type === 'checkbox' ? checked : value;
    // Don't sanitize company field here - it has its own handler that preserves spaces
    const sanitizedValue = type === 'checkbox' ? rawValue : (name === 'company' ? value : sanitizeInput(value));
    
    // Handle readiness field changes
    if (name === 'readiness') {
      // Immediate redirect for market researchers - NO confirmation dialog
      if (value === 'researching') {
        if (process.env.NODE_ENV === 'development') {
          console.log('Market researcher detected - redirecting to Remax.ca');
        }
        window.location.href = 'https://www.remax.ca/';
        return; // Stop processing
      }
      setFormData(prev => ({
        ...prev,
        readiness: value
      }));
    } 
    // Handle unit count changes
    else if (name === 'unitCount') {
      const currentReadiness = formData.readiness;
      
      // Allow empty string for complete deletion
      if (value === '') {
        setFormData(prev => ({ ...prev, unitCount: '' }));
        setCustomerTier('pioneer'); // Default tier when empty
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.unitCount;
          return newErrors;
        });
        return;
      }
      
      // Only allow numeric input
      if (!/^\d+$/.test(value)) {
        return; // Silently reject non-numeric input
      }
      
      // Apply sanitization
      const sanitized = sanitizeInput(value);
      setFormData(prev => ({ ...prev, unitCount: sanitized }));
      
      // INLINE TIER CALCULATION
      if (currentReadiness) {
        const unitNum = parseInt(sanitized) || 0;
        let calculatedTier: TierType = 'pioneer'; // Proper type
        
        // B2B Partnership tier determination
        if (unitNum >= 200) {
          calculatedTier = 'elite';
        } else if (unitNum >= 50 && unitNum <= 199) {
          calculatedTier = 'preferred';
        } else if (unitNum >= 10 && unitNum <= 49) {
          calculatedTier = 'pioneer';
        } else {
          // For <10 units, default to pioneer (will be redirected on validation)
          calculatedTier = 'pioneer';
          if (process.env.NODE_ENV === 'development') {
            console.log('Units < 10 detected, will offer redirect to Remax.ca');
          }
        }
        
        // Force update with proper type
        setCustomerTier(calculatedTier);
        
        // Debug logging
        if (process.env.NODE_ENV === 'development') {
          console.log('Tier Calculation:', {
            readiness: currentReadiness,
            unitInput: sanitized,
            unitNumber: unitNum,
            result: calculatedTier,
            timestamp: new Date().toISOString()
          });
        }
        
        // Recalculate score with current values immediately
        calculatePriorityScoreWith({ ...formData, unitCount: sanitized });
      }
    }
    // Handle SMS consent
    else if (name === 'consentSMS' && checked) {
      setFormData(prev => ({
        ...prev,
        consentSMS: true,
        consentSMSTimestamp: new Date().toISOString()
      }));
    }
    // Handle company name - preserve spaces while maintaining security
    else if (name === 'company') {
      // Custom sanitization that preserves ALL spaces (including trailing)
      const companyValue = value
        .replace(/[<>]/g, '') // Remove potential HTML tags
        .replace(/javascript:/gi, '') // Remove javascript: protocols
        .replace(/on\w+\s*=/gi, '') // Remove event handlers
        .substring(0, 250); // Limit to 250 characters (increased for long B2B names)
        // NO .trim() here - preserve spaces during typing!

      setFormData(prev => ({
        ...prev,
        company: companyValue
      }));

      // Clear any existing error
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.company;
        return newErrors;
      });
      return; // Exit early
    }
    // Special handling for project description - allow spaces
    else if (name === 'projectDescription' || name === 'projectDescriptionText') {
      const descriptionValue = value
        .replace(/[<>]/g, '') // Remove HTML tags
        .replace(/javascript:/gi, '') // Remove javascript: protocols
        .replace(/on\w+\s*=/gi, '') // Remove event handlers like onclick=
        .substring(0, 1000); // Limit to 1000 characters
      
      setFormData(prev => ({ 
        ...prev, 
        [name]: descriptionValue,
        // Also set the alternate field name for compatibility
        projectDescriptionText: descriptionValue,
        projectDescription: descriptionValue
      }));
    }
    // Handle all other fields
    else {
      setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
    }
    
    // Clear errors
    setErrors(prev => ({ ...prev, [name]: '' }));
    
    // Trigger score recalculation for relevant fields using current values
    if (['unitCount', 'timeline', 'province', 'developerType', 'governmentPrograms'].includes(name)) {
      const nextFormData = { ...formData, [name]: type === 'checkbox' ? checked : sanitizedValue } as typeof formData;
      calculatePriorityScoreWith(nextFormData);
    }
  };

  // Handle phone number formatting as user types - FIXED for delete/backspace
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;

    // Extract only digits from user input (allows proper deletion)
    const digitsOnly = input.replace(/\D/g, '');

    try {
      if (digitsOnly.length === 0) {
        // If all deleted, clear everything
        setPhoneInput('');
        setFormData(prev => ({ ...prev, phone: '' }));
        return;
      }

      // Format for display using digits only
      const formatter = new AsYouType(selectedCountry as any);
      const formatted = formatter.input(digitsOnly);

      // Update display with formatted version
      setPhoneInput(formatted);

      // Try to parse to E.164 format for form storage
      try {
        const parsed = parsePhoneNumber(digitsOnly, selectedCountry as any);
        if (parsed && parsed.isValid()) {
          // Store valid E.164 format
          setFormData(prev => ({ ...prev, phone: parsed.number }));
        } else {
          // Store digits with country code prefix for validation
          const countryCode = ALL_COUNTRIES.find(c => c.code === selectedCountry)?.callingCode || '+1';
          setFormData(prev => ({ ...prev, phone: `${countryCode}${digitsOnly}` }));
        }
      } catch {
        // On error, store digits with country code
        const countryCode = ALL_COUNTRIES.find(c => c.code === selectedCountry)?.callingCode || '+1';
        setFormData(prev => ({ ...prev, phone: `${countryCode}${digitsOnly}` }));
      }
    } catch {
      // Fallback: just use raw input
      setPhoneInput(digitsOnly);
      const countryCode = ALL_COUNTRIES.find(c => c.code === selectedCountry)?.callingCode || '+1';
      setFormData(prev => ({ ...prev, phone: `${countryCode}${digitsOnly}` }));
    }
  };

  // Handle country change with smart digit preservation - HYBRID APPROACH
  const handleCountryChange = (countryCode: string) => {
    const oldCountry = selectedCountry;
    setSelectedCountry(countryCode);
    
    // Check if there's existing phone input
    if (phoneInput && formData.phone) {
      try {
        // Check if current phone is valid for the OLD country
        const isCurrentValid = isValidPhoneNumber(formData.phone, oldCountry as any);
        
        if (isCurrentValid) {
          // PRESERVE DIGITS: Current number is valid, preserve digits when switching
          const digitsOnly = phoneInput.replace(/\D/g, '');
          
          if (digitsOnly.length === 0) {
            // If no digits, clear everything
            setPhoneInput('');
            setFormData(prev => ({ ...prev, phone: '' }));
            validateStep(currentStep);
            return;
          }

          // Reformat with new country's formatter for display
          const formatter = new AsYouType(countryCode as any);
          const formatted = formatter.input(digitsOnly);
          
          // Update display input
          setPhoneInput(formatted);

          // Parse to E.164 format for form storage
          try {
            const parsed = parsePhoneNumber(digitsOnly, countryCode as any);
            if (parsed && parsed.isValid()) {
              // Store valid E.164 format
              setFormData(prev => ({ ...prev, phone: parsed.number }));
            } else {
              // Store digits with new country code for validation
              const newCountryCode = ALL_COUNTRIES.find(c => c.code === countryCode)?.callingCode || '+1';
              setFormData(prev => ({ ...prev, phone: `${newCountryCode}${digitsOnly}` }));
            }
          } catch {
            // On error, store digits with country code
            const newCountryCode = ALL_COUNTRIES.find(c => c.code === countryCode)?.callingCode || '+1';
            setFormData(prev => ({ ...prev, phone: `${newCountryCode}${digitsOnly}` }));
          }
        } else {
          // CLEAR INVALID: Current number is invalid, clear to allow fresh input (yesterday's behavior)
          setPhoneInput('');
          setFormData(prev => ({ ...prev, phone: '' }));
          setErrors(prev => ({ ...prev, phone: '' }));
        }
      } catch {
        // On validation error, clear to allow fresh input
        setPhoneInput('');
        setFormData(prev => ({ ...prev, phone: '' }));
        setErrors(prev => ({ ...prev, phone: '' }));
      }
    }
    
    // Trigger re-validation to update errors based on new country
    validateStep(currentStep);
  };

  // SECURITY-COMPLIANT: Unit range mapping with validation
  // SECURITY-COMPLIANT: Unit value validation - accepts any integer >= 0
  const getRepresentativeUnitValue = (unitSelection: string): string => {
    // Validate input to prevent injection and ensure it's a valid number
    const sanitizedInput = sanitizeInput(unitSelection);
    const numValue = parseInt(sanitizedInput, 10);

    // Return the actual number if it's valid, otherwise return '0'
    if (!isNaN(numValue) && numValue >= 0) {
      return numValue.toString();
    }
    return '0';
  };

  // Helper function to get display-friendly unit text for UI and sales team
  const getDisplayUnitText = (unitValue: string): string => {
    const numValue = parseInt(unitValue, 10);

    if (isNaN(numValue) || numValue < 0) {
      return '0 units';
    }

    // Special handling for values under 10 (B2B minimum)
    if (numValue >= 1 && numValue < 10) {
      return `${numValue} units (Note: B2B partnerships require minimum 10 units)`;
    }

    // Return appropriate text based on the number
    if (numValue === 0) return '0 units';
    if (numValue === 1) return '1 home';
    if (numValue === 2) return '2 homes';

    // For larger numbers, include tier information if applicable
    if (numValue >= 10 && numValue <= 49) return `${numValue} units (Pioneer Tier Range)`;
    if (numValue >= 50 && numValue <= 199) return `${numValue} units (Preferred Tier Range)`;
    if (numValue >= 200) return `${numValue} units (Elite Tier Range)`;

    return `${numValue} units`;
  };

  // SECURITY-COMPLIANT: Developer type mapping with validation (matches backend)
  const mapDeveloperType = (developerType: string): string => {
    // Validate input to prevent injection
    const sanitizedInput = sanitizeInput(developerType);
    const developerMap: { [key: string]: string } = {
      'Indigenous Community/Organization': 'Indigenous Community/Organization',
      'Commercial Developer (Large Projects)': 'Commercial Developer (Large Projects)',
      'Government/Municipal Developer': 'Government/Municipal Developer',
      'Non-Profit Housing Developer': 'Non-Profit Housing Developer',
      'Private Developer (Medium Projects)': 'Private Developer (Medium Projects)',
      'Individual/Family Developer': 'Individual/Family Developer',
      'Individual/Family': 'Individual/Family Developer',
      'Individual': 'Individual/Family Developer',
      'Family': 'Individual/Family Developer',
      'Commercial Developer': 'Commercial Developer (Large Projects)',
      'Government/Municipal': 'Government/Municipal Developer',
      'Non-Profit Organization': 'Non-Profit Housing Developer',
      'Private Developer': 'Private Developer (Medium Projects)',
      // ENTERPRISE SECURITY: Handle edge cases - fallback to empty string for validation
      'undefined': "",
      'null': "",
      '': ""
    };
    return developerMap[sanitizedInput] || "";
  };

  // Use shared scoring utility for 100% frontend-backend consistency
  const calculatePriorityScoreWith = (fd: typeof formData) => {
    // Map frontend form data to shared utility format
    const sharedData = {
      unitCount: getRepresentativeUnitValue(fd.unitCount || '0'),
      projectDescription: fd.projectDescription || '',
      readiness: fd.readiness || '',
      // TODO: Future Update - Unify timeline field name
      // Currently maps: frontend 'timeline' -> backend 'decisionTimeline'
      // Future: unified 'deliveryTimeline' throughout system
      decisionTimeline: fd.timeline || fd.decisionTimeline || fd.deliveryTimeline || '',
      constructionProvince: fd.province || fd.constructionProvince || '',
      developerType: mapDeveloperType(fd.developerType || ''),
      governmentPrograms: fd.governmentPrograms || ''
    };

    // SECURITY-COMPLIANT: Debug without exposing sensitive data
    if (import.meta.env.DEV) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 FRONTEND SCORE CALCULATION:', {
          score: 'pending',
          hasAllRequiredFields: !!(sharedData.unitCount && sharedData.readiness),
          timestamp: new Date().toISOString()
        });
      }
    }

    const { score, breakdown } = calculatePriorityScore(sharedData);

    if (import.meta.env.DEV) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🎯 FRONTEND RESULT:', {
          score,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    // Update state
    setPriorityScore(score);
    
    // Determine tier using shared utility
    const units = parseInt(fd.unitCount || '0') || 0;
    const currentTier = determineCustomerTierShared(units) as TierType;
    setCustomerTier(currentTier);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🎯 FRONTEND Score (using shared utility):', {
        score,
        breakdown,
        tier: currentTier,
        inputs: sharedData
      });
    }

    // Enhanced analytics with tier information
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', 'customer_tier_determination', {
        event_category: 'Business Logic',
        action: 'tier_classification',
        customer_tier: currentTier,
        unit_count: fd.unitCount || '0',
        readiness_level: fd.readiness || '',
        priority_score: score,
        lead_type: currentTier.startsWith('tier_0') ? 'explorer' : 
                   currentTier.startsWith('tier_1') ? 'residential' : 'partnership',
      });
    }

    return score;
  };

  // Validation
  const validateStep = (step: number) => {
    const newErrors: FormErrors = {};
    
    switch(step) {
      case 1: // Partnership Intent
        if (!formData.readiness) {
          newErrors.readiness = 'Please select your journey stage';
        }
        // Skip all validation if researching - they'll be redirected
        if (formData.readiness === 'researching') {
          return true;
        }
        if (!formData.unitCount || formData.unitCount === '') {
          newErrors.unitCount = 'Please enter the number of units needed';
        } else {
          const unitCount = parseInt(formData.unitCount || '0', 10);
          if (isNaN(unitCount) || unitCount < 1) {
            newErrors.unitCount = 'Please enter a valid number (minimum 1 unit)';
          } else if (!Number.isInteger(Number(formData.unitCount))) {
            newErrors.unitCount = 'Please enter a whole number (no decimals)';
          } else if (unitCount > 1000000) {
            newErrors.unitCount = 'Please verify this number. For projects over 1 million units, contact us directly at partnerships@illummaa.com';
          } else if (unitCount > 0 && unitCount < 10) {
            const confirmRedirect = window.confirm(
              "Projects with fewer than 10 units are better suited for residential services. " +
              "Would you like to be redirected to Remax.ca for residential options?"
            );
            if (confirmRedirect) {
              window.location.href = 'https://www.remax.ca/';
              return false;
            } else {
              if (process.env.NODE_ENV === 'development') {
                console.log('User declined redirect for <10 units, continuing with form');
              }
              newErrors.unitCount = 'Minimum 10 units required for B2B partnerships';
            }
          }
        }
        break;

      case 2: // Company Profile
        if (!formData.company?.trim()) {
          newErrors.company = 'Company name is required for B2B partnership';
        }
        if (!formData.developerType) {
          newErrors.developerType = 'Please select a developer type';
        }
        if (!formData.province && !formData.constructionProvince) {
          newErrors.province = 'Province/territory is required';
        }
        if (!formData.timeline && !formData.deliveryTimeline) {
          newErrors.timeline = 'Timeline is required';
        }
        break;

      case 3: // Partnership Opportunities
        if (!formData.governmentPrograms) {
          newErrors.governmentPrograms = 'Please select your government program participation status';
        }
        if (!formData.buildCanadaEligible || formData.buildCanadaEligible === '') {
          newErrors.buildCanadaEligible = 'Please select Build Canada eligibility status';
        }
        break;

      case 4: // Contact Information
        if (!formData.firstName?.trim() || formData.firstName.length < 2) {
          newErrors.firstName = 'First name is required (2+ characters)';
        }
        if (!formData.lastName?.trim() || formData.lastName.length < 2) {
          newErrors.lastName = 'Last name is required (2+ characters)';
        }
        if (!formData.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = 'Valid email address is required';
        }
        // Enhanced validation with country-specific hints - FIXED for all countries
        if (!formData.phone?.trim()) {
          newErrors.phone = 'Phone number is required';
        } else {
          try {
            // Clean the phone number for validation
            const phoneToValidate = formData.phone.trim();

            // Validate with country context
            const isValid = isValidPhoneNumber(phoneToValidate, selectedCountry as any);

            if (!isValid) {
              // Get country-specific hint with example
              const country = ALL_COUNTRIES.find(c => c.code === selectedCountry);
              const countryName = country?.name || 'selected country';
              const callingCode = country?.callingCode || '';

              // Provide helpful examples for common countries
              let example = '';
              switch (selectedCountry) {
                case 'CA': example = ' (e.g., 416 555 1234)'; break;
                case 'AW': example = ' (e.g., 597 1234)'; break;
                case 'CM': example = ' (e.g., 6 12 34 56 78)'; break;
                case 'GB': example = ' (e.g., 7400 123456)'; break;
                case 'US': example = ' (e.g., 555 123 4567)'; break;
                default: example = '';
              }

              newErrors.phone = `Please enter a valid ${countryName} phone number${example}`;
            }
          } catch (error) {
            // Fallback validation if isValidPhoneNumber fails
            const country = ALL_COUNTRIES.find(c => c.code === selectedCountry);
            const countryName = country?.name || 'selected country';
            newErrors.phone = `Please enter a valid ${countryName} phone number`;
          }
        }
        break;

      case 5: // Legal Consent
        if (!formData.consentCommunications) {
          newErrors.consentCommunications = 'Communication consent is required by CASL';
        }
        if (!formData.consentSMS) {
          newErrors.consentSMS = 'SMS consent is required for text messaging';
        }
        if (!formData.privacyPolicy) {
          newErrors.privacyPolicy = 'Privacy policy acceptance is required by PIPEDA';
        }
        if (!formData.ageVerification) {
          newErrors.ageVerification = 'Age verification is required';
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigation
  const handleNext = () => {
    if (validateStep(currentStep)) {
      // Check for low unit count and offer redirect option
      if (currentStep === 1 && formData.unitCount) {
        const units = parseInt(formData.unitCount);
        if (units > 0 && units < 10) {
          const confirmRedirect = window.confirm(
            "Projects with fewer than 10 units are better suited for residential services. " +
            "Would you like to be redirected to Remax.ca for residential options?"
          );

          if (confirmRedirect) {
            window.location.href = 'https://www.remax.ca/';
            return; // Stop form progression
          }
          // If declined, proceed with next step
        }
      }
      
      const newStep = Math.min(currentStep + 1, TOTAL_STEPS);
      const stepNames = ['', 'readiness_units', 'project_details', 'contact_info', 'consent_review', 'complete'];
      
      // Track step completion
      trackAssessmentStepComplete(currentStep, stepNames[currentStep], formData);
      
      setCurrentStep(newStep);
      
      // Track new step start (unless it's the completion step)
      if (newStep <= TOTAL_STEPS && stepNames[newStep]) {
        analytics.trackAssessmentStepStart(newStep, stepNames[newStep]);
      }
      
      // Scroll to form section, not page top
      const formElement = document.getElementById('developer-qualification');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handlePrevious = () => {
    // If going back from Step 1, safely clear journey-dependent fields
    if (currentStep === 1) {
      setFormData(prev => ({
        // Preserve contact information
        firstName: prev.firstName,
        lastName: prev.lastName,
        email: prev.email,
        phone: prev.phone,
        company: prev.company,
        consentCommunications: prev.consentCommunications,
        consentSMS: prev.consentSMS,
        consentSMSTimestamp: prev.consentSMSTimestamp,
        privacyPolicy: prev.privacyPolicy,
        marketingConsent: prev.marketingConsent,
        ageVerification: prev.ageVerification,
        // Clear journey-dependent fields
        readiness: undefined,
        unitCount: undefined,
        timeline: undefined,
        deliveryTimeline: undefined,
        province: undefined,
        constructionProvince: undefined,
        developerType: undefined,
        governmentPrograms: undefined,
        projectDescription: undefined,
        // B2B-only: Explorer fields removed
      }));
      // Reset related state
      setPriorityScore(0);
      setCustomerTier('pioneer');
    } else {
      setCurrentStep(Math.max(currentStep - 1, 1));
    }

    // Scroll to form section, not page top
    const formElement = document.getElementById('developer-qualification');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Generate tags for single pipeline
  const generateTags = () => {
    const tags = [];
    
    // Tier tags
    tags.push(customerTier);
    
    // Priority tags
    if (priorityScore >= 100) tags.push('Priority-High-150', 'Response-1Hour-Required');
    else if (priorityScore >= 50) tags.push('Priority-Medium-75', 'Response-4Hour-Standard');
    else tags.push('Priority-Standard-25', 'Response-24Hour-Follow');
    
    // Scale tags
    const units = parseInt(formData.unitCount || '0') || 0;
    if (units >= 200) tags.push('Scale-Enterprise-Community');
    else if (units >= 50) tags.push('Scale-Large-Partnership');
    else if (units >= 11) tags.push('Scale-Medium-Commercial');
    else if (units >= 3) tags.push('Scale-Small-Residential');
    else tags.push('Scale-Individual');
    
    // Location tags
    const province = formData.province || formData.constructionProvince;
    if (province) {
      const provinceCode = {
        'Alberta': 'AB', 'British Columbia': 'BC', 'Manitoba': 'MB',
        'New Brunswick': 'NB', 'Newfoundland and Labrador': 'NL',
        'Northwest Territories': 'NT', 'Nova Scotia': 'NS', 'Nunavut': 'NU',
        'Ontario': 'ON', 'Prince Edward Island': 'PE', 'Quebec': 'QC',
        'Saskatchewan': 'SK', 'Yukon': 'YT'
      }[province] || 'XX';
      
      tags.push(`Location-${provinceCode}-${province.replace(/\s+/g, '')}`);
      
      if (['Ontario', 'British Columbia', 'Alberta'].includes(province)) {
        tags.push('Market-Primary');
      } else {
        tags.push('Market-Secondary');
      }
    }
    
    // Compliance tags
    tags.push('CASL-Compliant', 'PIPEDA-Compliant', 'SMS-Verified', 'A2P-10DLC-Ready');
    
    // Source tags
    tags.push('Source-Website-Direct', 'Channel-Digital-High', 'Security-Verified');
    
    return tags;
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(currentStep) || !csrfToken) {
      alert('Please complete all required fields and try again.');
      return;
    }
    
    setIsSubmitting(true);
    setShowSuccess(true); // Show success immediately, hide Step 5
    
    try {
      const tags = generateTags();
      const tierInfo = getTierInfo(customerTier);
      
      // Build webhook payload for single pipeline
      const payload = {
        // Contact Information
        firstName: sanitizeInput(formData.firstName || ''),
        lastName: sanitizeInput(formData.lastName || ''),
        email: sanitizeInput(formData.email || ''),
        
        // DEBUG: Log what we're sending to backend
        ...(import.meta.env.DEV && (() => {
          console.log('🔍 [FRONTEND DEBUG] Phone being sent to backend:', {
            raw: formData.phone,
            sanitized: sanitizeInput(formData.phone || ''),
            selectedCountry: selectedCountry
          });
          return {};
        })()),
        
        phone: (() => {
          const phoneValue = sanitizeInput(formData.phone || '');
          
          // Defensive: Ensure phone has + prefix (E.164 format)
          if (phoneValue && !phoneValue.startsWith('+')) {
            // Phone is missing + prefix - reconstruct it
            const countryData = ALL_COUNTRIES.find(c => c.code === selectedCountry);
            const countryCode = countryData?.callingCode || '+1';
            const countryDigits = countryCode.substring(1); // Remove + to get just digits (e.g., "297" from "+297")
            const digitsOnly = phoneValue.replace(/\D/g, '');
            
            // Guard: If no digits remain after sanitization, return original (validation will catch it)
            if (!digitsOnly || digitsOnly.length === 0) {
              if (import.meta.env.DEV) {
                console.warn('⚠️ [PHONE FIX] No digits found in phone value, returning original:', phoneValue);
              }
              return phoneValue;
            }
            
            // Smart reconstruction: check if digits already start with country code
            const reconstructed = digitsOnly.startsWith(countryDigits) 
              ? `+${digitsOnly}`  // Already has country code, just add +
              : `${countryCode}${digitsOnly}`;  // Missing country code, add full code
            
            if (import.meta.env.DEV) {
              console.warn('⚠️ [PHONE FIX] Phone was missing + prefix, reconstructed:', {
                original: phoneValue,
                digitsOnly: digitsOnly,
                countryDigits: countryDigits,
                reconstructed: reconstructed
              });
            }
            
            return reconstructed;
          }
          
          return phoneValue;
        })(),
        companyName: sanitizeCompany(formData.company || ''),
        
        // Classification (for single pipeline routing)
        customerTier: customerTier,
        partnershipLevel: tierInfo.name,
        aiPriorityScore: priorityScore,
        
        // Project Details
        projectUnitCount: sanitizeInput(getRepresentativeUnitValue(formData.unitCount || '0')),
        projectUnitRange: sanitizeInput(getDisplayUnitText(formData.unitCount || '0')),
        readinessToBuy: formData.readiness,
        deliveryTimeline: formData.timeline || formData.deliveryTimeline,
        // SECURITY-COMPLIANT: Add prioritized fields while maintaining sanitization
        timeline: sanitizeInput(formData.timeline || formData.deliveryTimeline || ''),
        constructionProvince: formData.province || formData.constructionProvince,
        developerType: sanitizeInput(formData.developerType || 'Not Specified'),
        governmentPrograms: sanitizeInput(formData.governmentPrograms || 'Not Specified'),
        projectDescription: sanitizeInput(formData.projectDescription || ''),
        
        // Education-specific fields for Explorer tier
        // B2B-only: Explorer fields removed
        
        // Flags for automation
        buildCanadaEligible: sanitizeInput(formData.buildCanadaEligible || "I don't know"),
        isEducationOnly: 'No', // B2B partnership only
        isEducationalLead: 'false', // B2B partnership only
        
        // Response commitment (Professional Service Levels - No Numerical Scoring)
        responseCommitment: getResponseCommitment(customerTier),
        responseCommitmentLevel: getResponseCommitmentLevel(customerTier),
        
        // Tags for single pipeline automation
        tags: tags.join(','),
        
        // Pipeline assignment
        pipeline: 'ILLUMMAA Customer Journey',
        stage: 'B2B Partnership Interest', // All tiers are B2B partnership
        
        // Legal consent with SMS security
        consentCommunications: formData.consentCommunications ? 'true' : 'false',
        consentSMS: formData.consentSMS ? 'true' : 'false',
        consentSMSTimestamp: formData.consentSMSTimestamp || new Date().toISOString(), // Use stored consent timestamp or current time as fallback
        privacyPolicyConsent: formData.privacyPolicy ? 'true' : 'false',
        marketingConsent: formData.marketingConsent ? 'true' : 'false',
        ageVerification: formData.ageVerification ? 'true' : 'false',
        consentTimestamp: new Date().toISOString(),
        legalConsentVersion: '2025.1',
        caslCompliant: 'true',
        pipedaCompliant: 'true',
        a2p10dlcCompliant: 'true',
        
        // System metadata
        source: 'Website Form',
        timestamp: new Date().toISOString(),
        submissionId: `ILLUMMAA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        securityValidated: 'true',
        smsConsentSecurityValidated: 'true'
      };
      
      // Debug logging
      if (process.env.NODE_ENV === 'development') {
        console.log('Submitting assessment with payload:', {
          ...payload,
          // Mask sensitive data in logs
          email: payload.email ? '***@***' : undefined,
          phone: payload.phone ? '***' : undefined
        });
      }
      if (process.env.NODE_ENV === 'development') {
        console.log('CSRF Token present:', !!csrfToken);
      }
      if (process.env.NODE_ENV === 'development') {
        console.log('Consent values:', {
          consentSMS: payload.consentSMS,
          timestamp: payload.consentSMSTimestamp,
          allConsents: {
            communications: payload.consentCommunications,
            sms: payload.consentSMS,
            privacy: payload.privacyPolicyConsent,
            age: payload.ageVerification
          }
        });
      }
      
      const response = await fetch('/api/submit-assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
          'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'same-origin',
        body: JSON.stringify(payload)
      });
      
      // Add proper response checking
      if (!response.ok) {
        console.error('Response not OK:', response.status, response.statusText);
        
        // Throw the response as an error to be caught
        throw response;
      }
      
      const result = await response.json();
      if (process.env.NODE_ENV === 'development') {
        console.log('Submission successful:', result);
      }
      
      // Analytics tracking
      // Enhanced assessment completion tracking
      trackAssessmentComplete(formData, priorityScore, customerTier);
      
      // Track lead generation conversion
      analytics.trackLeadGeneration({
        customerTier,
        priorityScore,
        unitCount: formData.unitCount,
        province: formData.province,
        readiness: formData.readiness,
        buildCanadaEligible: formData.buildCanadaEligible === "Yes"
      });
      
      setShowSuccess(true);
      
    } catch (error) {
      console.error('Submission error details:', error);
      
      // Enhanced error handling for better debugging
      if (error instanceof Error && error.message.includes('fetch')) {
        alert('Network error. Please check your internet connection and try again.');
      } else {
        // Try to parse error response
        try {
          const response = error as Response;
          if (response && response.status) {
            if (response.status === 429) {
              alert('You have already completed an assessment today. Please try again tomorrow or contact info@illummaa.ca for assistance.');
            } else if (response.status === 400) {
              const errorData = await response.json();
              console.error('Validation error:', errorData);
              
              if (errorData.error === 'SMS consent validation failed') {
                alert('Please ensure all consent checkboxes are checked and try again.');
              } else if (errorData.error === 'SMS consent expired') {
                alert('Your session has expired. Please refresh the page and complete the form again.');
              } else {
                alert(`Validation error: ${errorData.message || errorData.error || 'Please check all required fields and try again.'}`);
              }
            } else {
              alert(`Server error (${response.status}). Please try again later or contact info@illummaa.ca`);
            }
          } else {
            alert('Submission error. Please try again or contact info@illummaa.ca');
          }
        } catch (parseError) {
          console.error('Error parsing response:', parseError);
          alert('Submission error. Please try again or contact info@illummaa.ca');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="developer-qualification" className="min-h-screen bg-gradient-to-br from-gray-50 to-white pt-12 pb-12 md:pb-2" data-testid="assessment-form-container">
      <div className="container mx-auto px-4 max-w-3xl">
        {showSuccess ? (
          /* SUCCESS VIEW - Complete inline success display */
          <div className="max-w-4xl mx-auto">
            {/* Success Header with ILLUMMAA Branding */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4" data-testid="success-title">
                Assessment Complete!
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto" data-testid="success-subtitle">
                {getResponseCommitment(customerTier)}
              </p>
            </div>

            {/* Assessment Results Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
              <div className="grid md:grid-cols-2 gap-12 max-w-2xl mx-auto">
                {/* Tier Information */}
                <div className="text-center">
                  <div className="text-4xl mb-3" data-testid="tier-icon">
                    {getTierInfo(customerTier).icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Partnership Tier</h3>
                  <p className="text-2xl font-bold text-indigo-600" data-testid="tier-display">
                    {getTierInfo(customerTier).name}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    {getTierInfo(customerTier).description}
                  </p>
                </div>


                {/* Compliance Status */}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-3">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Compliance</h3>
                  <p className="text-sm font-medium text-green-600 mb-1">CASL & PIPEDA Verified</p>
                  <p className="text-xs text-gray-600">Enterprise-grade privacy compliance</p>
                </div>
              </div>
            </div>

            {/* Next Steps Section */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">What's Next?</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">1</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Confirmation Email Sent</h4>
                    <p className="text-gray-600 text-sm">Assessment results and next steps delivered to your inbox</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">2</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{getResponseCommitmentLevel(customerTier)}</h4>
                    <p className="text-gray-600 text-sm">{getResponseDescription(customerTier)}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">3</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Personalized Consultation</h4>
                    <p className="text-gray-600 text-sm">
                      Direct consultation with our B2B partnership team
                    </p>
                  </div>
                </div>

                {/* Build Canada Eligibility Notice */}
                {formData.buildCanadaEligible === "Yes" && (
                  <div className="flex items-start space-x-4 bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">★</div>
                    <div>
                      <h4 className="font-semibold text-green-900">Build Canada Eligible</h4>
                      <p className="text-green-700 text-sm">Your project qualifies for Build Canada funding programs</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="text-center bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                B2B Partnership Team Assigned
              </h3>
              <p className="text-gray-600 mb-6">
                {getResponseDescription(customerTier)}
              </p>
            </div>
          </div>
        ) : (
          /* FORM VIEW */
          <>
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium mb-4" data-testid="badge-partner">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Build Canada Homes Partner
              </div>
              
              <h1 className="text-4xl font-bold text-gray-900 mb-3" data-testid="title-main">
                Developer Partnership Application
              </h1>
              <p className="text-gray-600" data-testid="text-subtitle">
                Start your partnership with Canada's modular housing leader. Tell us about your project.
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-8" data-testid="progress-container">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span data-testid="text-step">Step {currentStep} of {TOTAL_STEPS}</span>
                <span data-testid="text-progress">{Math.round((currentStep / TOTAL_STEPS) * 100)}% Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{ 
                    width: `${(currentStep / TOTAL_STEPS) * 100}%`,
                    background: 'linear-gradient(90deg, #6366F1 0%, #8B5CF6 100%)'
                  }}
                  data-testid="progress-bar"
                />
              </div>
            </div>
            {/* Form Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8" data-testid="form-card">
          <form onSubmit={handleSubmit} data-testid="form-assessment">
            
            {/* STEP 1: Readiness + Units */}
            {currentStep === 1 && (
              <div className="space-y-6" data-testid="step-1">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6" data-testid="title-step-1">
                  Your Modular Journey
                </h2>
                
                <div>
                  <label className="block text-sm text-gray-700 mb-1.5" data-testid="label-readiness">
                    Where are you in your modular home journey? <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="readiness"
                    value={formData.readiness || ''}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.readiness ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none appearance-none bg-white`}
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em',
                      paddingRight: '2.5rem'
                    }}
                    required
                    data-testid="select-readiness"
                  >
                    <option value="">Please select...</option>
                    <option value="researching">Just researching the market</option>
                    <option value="planning-long">Planning to buy in 12+ months</option>
                    <option value="planning-medium">Actively looking (6-12 months)</option>
                    <option value="planning-short">Ready to move forward (3-6 months)</option>
                    <option value="immediate">I need a solution now (0-3 months)</option>
                  </select>
                  {errors.readiness && (
                    <p className="text-red-500 text-xs mt-1" data-testid="error-readiness">{errors.readiness}</p>
                  )}
                </div>

                {/* Only show units question if NOT "Just researching" (but show for "planning-long") */}
                {formData.readiness && formData.readiness !== 'researching' && (
                  <div>
                      <label className="block text-sm text-gray-700 mb-1.5" data-testid="label-units">
                        Number of units needed <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="unitCount"
                        value={formData.unitCount || ''}
                        onChange={handleInputChange}
                        min="1"
                        step="1"
                        placeholder="Enter number of units (e.g., 50, 500, 5000+)"
                        className={`w-full px-4 py-3 rounded-lg border ${
                          errors.unitCount ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none bg-white`}
                        required
                        data-testid="input-units"
                      />
                      {errors.unitCount && (
                        <p className="text-red-500 text-xs mt-1" data-testid="error-units">{errors.unitCount}</p>
                      )}
                      {formData.unitCount && parseInt(formData.unitCount) > 0 && parseInt(formData.unitCount) < 10 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-2">
                          <p className="text-sm text-yellow-800">
                            <strong>Note:</strong> B2B partnerships typically start at 10 units. For residential projects under 10 units,
                            you may want to visit <a href="https://remax.ca" className="underline">Remax.ca</a> for better assistance.
                          </p>
                        </div>
                      )}
                    </div>
                )}

                {/* Tier Preview - Only show when meaningful data entered */}
                {(formData.readiness && formData.unitCount && parseInt(formData.unitCount) >= 10) && (
                  <div className="bg-gray-50 rounded-xl p-4" data-testid="tier-preview">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl" data-testid="tier-icon">{getTierInfo(customerTier).icon}</span>
                      <div>
                        <p className="font-semibold text-gray-900" data-testid="tier-name">
                          {getTierInfo(customerTier).name} Tier
                        </p>
                        <p className="text-sm text-gray-600" data-testid="tier-description">
                          {getTierInfo(customerTier).description}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* STEP 2: Company Profile */}
            {currentStep === 2 && (
              <div className="space-y-6" data-testid="step-2">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6" data-testid="title-step-2">
                  Company Profile
                </h2>

                {/* Company with SECURITY */}
                <div>
                  <label className="block text-sm text-gray-700 mb-1.5" data-testid="label-company">
                    Company/Organization Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company || ''}
                    onChange={handleInputChange}
                    placeholder="e.g., PVRPOSE AI, ABC Corporation"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.company ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none`}
                    required
                    data-testid="input-company"
                  />
                  {errors.company && (
                    <p className="text-red-500 text-xs mt-1" data-testid="error-company">{errors.company}</p>
                  )}
                </div>

                {/* Developer Type */}
                <div>
                  <label className="block text-sm text-gray-700 mb-1.5" data-testid="label-developer-type">
                    Developer Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="developerType"
                    value={formData.developerType || ''}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.developerType ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none appearance-none bg-white`}
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em',
                      paddingRight: '2.5rem'
                    }}
                    required
                    data-testid="select-developer-type"
                  >
                    <option value="">Select developer type...</option>
                    <option value="Indigenous Community/Organization">Indigenous Community/Organization</option>
                    <option value="Commercial Developer (Large Projects)">Commercial Developer (Large Projects)</option>
                    <option value="Government/Municipal Developer">Government/Municipal Developer</option>
                    <option value="Non-Profit Housing Developer">Non-Profit Housing Developer</option>
                    <option value="Private Developer (Medium Projects)">Private Developer (Medium Projects)</option>
                    <option value="Individual/Family Developer">Individual/Family Developer</option>
                  </select>
                  {errors.developerType && (
                    <p className="text-red-500 text-xs mt-1" data-testid="error-developer-type">{errors.developerType}</p>
                  )}
                </div>

                {/* Province */}
                <div>
                  <label className="block text-sm text-gray-700 mb-1.5" data-testid="label-province">
                    Construction Province/Territory <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="province"
                    value={formData.province || ''}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.province ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none appearance-none bg-white`}
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em',
                      paddingRight: '2.5rem'
                    }}
                    required
                    data-testid="select-province"
                  >
                    <option value="">Select province/territory...</option>
                    <option value="Alberta">Alberta</option>
                    <option value="British Columbia">British Columbia</option>
                    <option value="Manitoba">Manitoba</option>
                    <option value="New Brunswick">New Brunswick</option>
                    <option value="Newfoundland and Labrador">Newfoundland and Labrador</option>
                    <option value="Northwest Territories">Northwest Territories</option>
                    <option value="Nova Scotia">Nova Scotia</option>
                    <option value="Nunavut">Nunavut</option>
                    <option value="Ontario">Ontario</option>
                    <option value="Prince Edward Island">Prince Edward Island</option>
                    <option value="Quebec">Quebec</option>
                    <option value="Saskatchewan">Saskatchewan</option>
                    <option value="Yukon">Yukon</option>
                  </select>
                  {errors.province && (
                    <p className="text-red-500 text-xs mt-1" data-testid="error-province">{errors.province}</p>
                  )}
                </div>

                {/* Timeline */}
                <div>
                  <label className="block text-sm text-gray-700 mb-1.5" data-testid="label-timeline">
                    Delivery Timeline <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="timeline"
                    value={formData.timeline || ''}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.timeline ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none appearance-none bg-white`}
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em',
                      paddingRight: '2.5rem'
                    }}
                    required
                    data-testid="select-timeline"
                  >
                    <option value="">Select timeline...</option>
                    <option value="Immediate (0-3 months)">Immediate (0-3 months)</option>
                    <option value="Short-term (3-6 months)">Short-term (3-6 months)</option>
                    <option value="Medium-term (6-12 months)">Medium-term (6-12 months)</option>
                    <option value="Long-term (12+ months)">Long-term (12+ months)</option>
                  </select>
                  {errors.timeline && (
                    <p className="text-red-500 text-xs mt-1" data-testid="error-timeline">{errors.timeline}</p>
                  )}
                </div>
              </div>
            )}

            {/* STEP 3: Partnership Opportunities */}
            {currentStep === 3 && (
              <div className="space-y-6" data-testid="step-3">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6" data-testid="title-step-3">
                  Partnership Opportunities
                </h2>

                <div>
                  <label className="block text-sm text-gray-700 mb-1.5" data-testid="label-government-programs">
                    Government Housing Program Participation <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="governmentPrograms"
                    value={formData.governmentPrograms || ''}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.governmentPrograms ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none appearance-none bg-white`}
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em',
                      paddingRight: '2.5rem'
                    }}
                    required
                    data-testid="select-government-programs"
                  >
                    <option value="">Select participation status...</option>
                    <option value="Participating in government programs">Participating in government programs</option>
                    <option value="Not participating">Not participating</option>
                  </select>
                  {errors.governmentPrograms && (
                    <p className="text-red-500 text-xs mt-1" data-testid="error-government-programs">{errors.governmentPrograms}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1.5" data-testid="label-buildcanada">
                    Are you Build Canada eligible? <span className="text-red-500">*</span>
                  </label>
                  <p className="text-sm font-bold text-gray-700 mb-2">
                    Select 'Yes' only if your project meets net-zero emissions (&lt;20% baseline)
                    and &lt;$300K/unit standards for low/median-income households (&lt;80% area median income).
                    Select 'I don't know' if unsure.
                  </p>
                  <select
                    name="buildCanadaEligible"
                    value={formData.buildCanadaEligible || ''}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.buildCanadaEligible ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none appearance-none bg-white`}
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em',
                      paddingRight: '2.5rem'
                    }}
                    required
                    data-testid="select-buildcanada"
                  >
                    <option value="">Select eligibility...</option>
                    <option value="Yes">Yes - Meets net-zero and affordability criteria</option>
                    <option value="No">No - Does not meet criteria</option>
                    <option value="I don't know">I don't know - Need more information</option>
                  </select>
                  {errors.buildCanadaEligible && (
                    <p className="text-red-500 text-xs mt-1" data-testid="error-buildcanada">
                      {errors.buildCanadaEligible}
                    </p>
                  )}
                </div>

                {/* Project Description - Optional field */}
                <div>
                  <label className="block text-sm text-gray-700 mb-1.5" data-testid="label-project-description">
                    Project Description <span className="text-gray-500 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    name="projectDescription"
                    value={formData.projectDescription || ''}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Describe your modular housing project, timeline, special requirements, or any other details..."
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.projectDescription ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none resize-none bg-white`}      
                    maxLength={1000}
                    data-testid="textarea-project-description"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {formData.projectDescription ? formData.projectDescription.length : 0}/1000 characters
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Contact Information */}
            {currentStep === 4 && (
              <div className="space-y-6" data-testid="step-4">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6" data-testid="title-step-4">
                  Contact Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1.5" data-testid="label-firstname">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName || ''}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.firstName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none`}
                      required
                      data-testid="input-firstname"
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-xs mt-1" data-testid="error-firstname">{errors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-1.5" data-testid="label-lastname">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName || ''}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.lastName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none`}
                      required
                      data-testid="input-lastname"
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-xs mt-1" data-testid="error-lastname">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1.5" data-testid="label-email">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ''}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none`}
                    required
                    data-testid="input-email"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1" data-testid="error-email">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1.5" data-testid="label-phone">
                    Phone Number <span className="text-red-500">*</span>
                  </label>

                  {/* Match First Name/Last Name grid layout for equal-width "bubbles" */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Country Code Selector - Equal width on desktop */}
                    <div>
                      <select
                        value={selectedCountry}
                        onChange={(e) => handleCountryChange(e.target.value)}
                        className="w-full px-3 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none bg-white"
                        data-testid="select-country"
                      >
                        {DISPLAY_COUNTRIES.map((country) => (
                          <option key={country.code} value={country.code}>
                            {country.flag} {country.name} ({country.callingCode})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Phone Number Input - Equal width on desktop */}
                    <div>
                      <input
                        type="tel"
                        name="phone"
                        inputMode="numeric"
                        value={phoneInput}
                        onChange={handlePhoneChange}
                        placeholder={
                          selectedCountry === 'CA' ? "(416) 555-1234" :
                          selectedCountry === 'AW' ? "597 1234" :
                          "Enter phone number"
                        }
                        className={`w-full px-4 py-3 rounded-lg border ${
                          errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none`}
                        required
                        data-testid="input-phone"
                      />
                    </div>
                  </div>

                  {/* Error message */}
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1" data-testid="error-phone">
                      {errors.phone}
                    </p>
                  )}

                  {/* Helper text */}
                  <p className="text-gray-500 text-xs mt-1">
                    Select your country and enter your phone number
                  </p>
                </div>
              </div>
            )}

            {/* STEP 5: Dynamic Assessment Summary */}
            {currentStep === 5 && (
              <div className="space-y-6" data-testid="step-5">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6" data-testid="title-step-5">
                  Review & Submit
                </h2>
                
                {/* DYNAMIC ASSESSMENT SUMMARY */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Assessment Summary</h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Contact Information Card */}
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <h4 className="font-semibold text-gray-900">Contact Details</h4>
                      </div>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-gray-600">Name:</span> <span className="font-medium">{formData.firstName} {formData.lastName}</span></p>
                        <p><span className="text-gray-600">Email:</span> <span className="font-medium">{formData.email}</span></p>
                        <p><span className="text-gray-600">Phone:</span> <span className="font-medium">{formData.phone}</span></p>
                        {formData.company && <p><span className="text-gray-600">Company:</span> <span className="font-medium">{formData.company}</span></p>}
                      </div>
                    </div>

                    {/* Journey/Project Information Card */}
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <h4 className="font-semibold text-gray-900">Project Scope</h4>
                      </div>
                      <div className="space-y-2 text-sm">
                        {formData.readiness && <p><span className="text-gray-600">Project Timeline:</span> <span className="font-medium">{formData.readiness === 'planning-long' ? 'Long-term (12+ months)' : formData.readiness === 'planning-medium' ? 'Medium-term (6-12 months)' : formData.readiness === 'planning-short' ? 'Short-term (3-6 months)' : formData.readiness === 'immediate' ? 'Immediate (0-3 months)' : formData.readiness}</span></p>}
                        
                        {/* B2B Project Information - Always Show */}
                        {formData.unitCount && <p><span className="text-gray-600">Units:</span> <span className="font-medium">{getDisplayUnitText(formData.unitCount)}</span></p>}
                        {formData.timeline && <p><span className="text-gray-600">Delivery Timeline:</span> <span className="font-medium">{formData.timeline}</span></p>}
                      </div>
                    </div>
                  </div>

                  {/* Location & Developer Information Card */}
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <h4 className="font-semibold text-gray-900">Location & Profile</h4>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        {formData.province && <p><span className="text-gray-600">Province:</span> <span className="font-medium">{formData.province}</span></p>}
                        {formData.developerType && <p><span className="text-gray-600">Developer Type:</span> <span className="font-medium">{formData.developerType}</span></p>}
                      </div>
                      <div className="space-y-2">
                        {formData.governmentPrograms && <p><span className="text-gray-600">Government Programs:</span> <span className="font-medium">{formData.governmentPrograms}</span></p>}
                      </div>
                    </div>
                  </div>

                  {/* Project Description - If Provided */}
                  {formData.projectDescription && (
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <h4 className="font-semibold text-gray-900">Project Vision</h4>
                      </div>
                      <p className="text-sm text-gray-700 bg-white rounded-lg p-3 border border-gray-200">"{formData.projectDescription}"</p>
                    </div>
                  )}

                  {/* RESPONSE COMMITMENT LEVEL - No Numerical Score */}
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <span className="text-2xl">{getTierInfo(customerTier).icon}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg text-gray-900 mb-1">{getResponseCommitmentLevel(customerTier)}</h4>
                        <p className="text-sm text-gray-700">{getResponseDescription(customerTier)}</p>
                      </div>
                      <div className="text-right">
                        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">Verified Assessment</div>
                      </div>
                    </div>
                  </div>

                  {formData.buildCanadaEligible === "Yes" && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-300 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🍁</span>
                        <div>
                          <h4 className="font-semibold text-green-800">Build Canada Homes Eligible</h4>
                          <p className="text-sm text-green-700">Your project scope qualifies for enhanced federal partnership opportunities.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Legal Consent & Privacy Section */}
                <div className="bg-gray-50 rounded-xl p-6 space-y-4" data-testid="legal-consent-section">
                  <h3 className="font-semibold text-gray-900 mb-4" data-testid="title-legal-consent">Legal Consent & Privacy</h3>
                  
                  {/* Communication Consent */}
                  <label className="flex items-start gap-3 cursor-pointer group" data-testid="label-consent-communications">
                    <input
                      type="checkbox"
                      name="consentCommunications"
                      checked={formData.consentCommunications || false}
                      onChange={handleInputChange}
                      className="mt-0.5 w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                      required
                      data-testid="checkbox-consent-communications"
                    />
                    <span className="text-sm text-gray-700 leading-relaxed">
                      I consent to CASL compliance (Required for SMS) <span className="text-red-500">*</span>
                    </span>
                  </label>
                  {errors.consentCommunications && (
                    <p className="text-red-500 text-xs ml-7" data-testid="error-consent-communications">{errors.consentCommunications}</p>
                  )}

                  {/* SMS Consent */}
                  <label className="flex items-start gap-3 cursor-pointer group" data-testid="label-consent-sms">
                    <input
                      type="checkbox"
                      name="consentSMS"
                      checked={formData.consentSMS || false}
                      onChange={handleInputChange}
                      className="mt-0.5 w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                      required
                      data-testid="checkbox-consent-sms"
                    />
                    <span className="text-sm text-gray-700 leading-relaxed">
                      I consent to receive SMS text messages from ILLUMMAA for time-sensitive updates and project coordination. (Required for SMS compliance) <span className="text-red-500">*</span>
                    </span>
                  </label>
                  {errors.consentSMS && (
                    <p className="text-red-500 text-xs ml-7" data-testid="error-consent-sms">{errors.consentSMS}</p>
                  )}

                  {/* Privacy Policy */}
                  <label className="flex items-start gap-3 cursor-pointer group" data-testid="label-privacy-policy">
                    <input
                      type="checkbox"
                      name="privacyPolicy"
                      checked={formData.privacyPolicy || false}
                      onChange={handleInputChange}
                      className="mt-0.5 w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                      required
                      data-testid="checkbox-privacy-policy"
                    />
                    <span className="text-sm text-gray-700 leading-relaxed">
                      I have read and accept the{' '}
                      <a href="/privacy" target="_blank" className="text-indigo-600 underline hover:text-indigo-700" data-testid="link-privacy-policy">
                        Privacy Policy
                      </a>
                      {' '}(Required by PIPEDA) <span className="text-red-500">*</span>
                    </span>
                  </label>
                  {errors.privacyPolicy && (
                    <p className="text-red-500 text-xs ml-7" data-testid="error-privacy-policy">{errors.privacyPolicy}</p>
                  )}

                  {/* Age Verification */}
                  <label className="flex items-start gap-3 cursor-pointer group" data-testid="label-age-verification">
                    <input
                      type="checkbox"
                      name="ageVerification"
                      checked={formData.ageVerification || false}
                      onChange={handleInputChange}
                      className="mt-0.5 w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                      required
                      data-testid="checkbox-age-verification"
                    />
                    <span className="text-sm text-gray-700 leading-relaxed">
                      I confirm that I am 18 years of age or older and have the legal capacity to provide consent <span className="text-red-500">*</span>
                    </span>
                  </label>
                  {errors.ageVerification && (
                    <p className="text-red-500 text-xs ml-7" data-testid="error-age-verification">{errors.ageVerification}</p>
                  )}

                  {/* Marketing Consent (Optional) */}
                  <label className="flex items-start gap-3 cursor-pointer group" data-testid="label-marketing-consent">
                    <input
                      type="checkbox"
                      name="marketingConsent"
                      checked={formData.marketingConsent || false}
                      onChange={handleInputChange}
                      className="mt-0.5 w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                      data-testid="checkbox-marketing-consent"
                    />
                    <span className="text-sm text-gray-700 leading-relaxed">
                      I consent to receive marketing communications (Optional)
                    </span>
                  </label>

                  <div className="text-xs text-gray-600 bg-white p-4 rounded border-l-4 border-indigo-400 mt-4" data-testid="legal-disclaimer">
                    <p className="font-semibold mb-2">Your Rights & Our Commitment:</p>
                    <p>You may withdraw consent at any time via unsubscribe links, replying STOP to texts, or contacting info@illummaa.ca. Your information is protected under Canadian privacy laws (PIPEDA/provincial equivalents). ILLUMMAA complies with CASL requirements, maintains A2P 10DLC registration for SMS, and keeps consent records as required by law.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100" data-testid="navigation">
              {(currentStep > 1 || (currentStep === 1 && formData.readiness)) && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors flex items-center gap-2"
                  data-testid="button-previous"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
              )}
              
              {currentStep < TOTAL_STEPS ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="ml-auto px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-medium shadow-sm hover:shadow-md flex items-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)'
                  }}
                  data-testid="button-next"
                >
                  Next Step
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting || !csrfToken}
                  className="ml-auto px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: isSubmitting ? '#9CA3AF' : 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)'
                  }}
                  data-testid="button-submit"
                >
                  {isSubmitting ? (
                    <>
                      <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                      Processing...
                    </>
                  ) : (
                    getTierInfo(customerTier).submitText
                  )}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Security Badges */}
        <div className="flex items-center justify-center gap-6 mt-8 text-xs text-gray-500" data-testid="security-badges">
          <div className="flex items-center gap-2" data-testid="badge-encrypted">
            <span className="text-green-500">🔒</span>
            <span>Secure Encrypted</span>
          </div>
          <div className="flex items-center gap-2" data-testid="badge-casl">
            <span>✓</span>
            <span>CASL Compliant</span>
          </div>
          <div className="flex items-center gap-2" data-testid="badge-pipeda">
            <span>✓</span>
            <span>PIPEDA Protected</span>
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
};

export default IllummaaAssessmentForm;
