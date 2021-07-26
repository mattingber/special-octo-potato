export type UpdateEntityDTO = { entityId: string } & Partial<{
  firstName: string;
  entityType: string;
  lastName: string;
  personalNumber: string;
  identityCard: string;
  rank: string;
  akaUnit: string;
  clearance: number;
  sex: string;
  serviceType: string; 
  dischargeDate: Date;
  birthDate: Date;
  address: string; // value?
  phone: string[]; //value object
  mobilePhone: string[]; //value object
  goalUserId: string;
}>
