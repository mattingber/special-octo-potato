export type CreateEntityDTO = {
  firstName: string;
  entityType: string;
  lastName?: string;
  personalNumber?: string;
  identityCard?: string;
  rank?: string;
  akaUnit?: string;
  clearance?: number;
  mail?: string;
  sex?: string;
  serviceType?: string; 
  dischargeDate?: Date;
  birthDate?: Date;
  jobTitle?: string;
  address?: string; // value?
  phone?: string[]; //value object
  mobilePhone?: string[]; //value object
  goalUserId?: string;
}

type CommonPerson = {
  firstName: string;
  lastName?: string;
  sex?: string;
  birthDate?: Date;
  phone?: string[]; //value object
  mobilePhone?: string[]; //value object
  address?: string; // value?
  clearance?: number;

}

export type CreateSoldierDTO = {
  firstName: string;
  lastName?: string;
  personalNumber?: string;
}
