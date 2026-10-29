// Legal business details shown on policy pages, footer and invoices.
// ECTA s43 requires these to be published on the website. Update before go-live.
export const COMPANY = {
  tradingName: 'WHATPART',
  legalName: 'WHATPART (Pty) Ltd',
  registrationNumber: '', // CIPC number, e.g. 2024/123456/07
  vatNumber: '', // leave empty until VAT-registered: no VAT is charged or shown
  physicalAddress: 'Johannesburg, Gauteng, South Africa',
  phone: '',
  whatsapp: '',
  email: 'support@whatpart.africa',
  website: 'https://whatpart.africa',
  businessHours: 'Monday to Friday 08:00 to 17:00, Saturday 08:00 to 13:00 (excluding public holidays)',
  informationOfficer: '', // POPIA information officer name
  policiesUpdated: '21 October 2026',
};

export const VAT_RATE = 0.15;
export const isVatRegistered = () => COMPANY.vatNumber.trim().length > 0;
