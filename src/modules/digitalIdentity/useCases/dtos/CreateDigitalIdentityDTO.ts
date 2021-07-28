export type CreateDigitalIdentityDTO = {
  uniqueId: string;
  type: string;
  source: string;
  mail: string;
  canConnectRole?: boolean;
}