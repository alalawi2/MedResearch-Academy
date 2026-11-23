import { requireOptionalNativeModule } from 'expo';
export type MeasurementStatus = {
  consent: 'not_asked' | 'granted' | 'declined';
  receiptAcknowledged: boolean;
  initialized: boolean;
  eligibleNewInstall: boolean;
};
export type MeasurementModule = {
  getStatus(): Promise<MeasurementStatus>;
  resume(): Promise<MeasurementStatus>;
  setConsent(granted: boolean): Promise<MeasurementStatus>;
};
export default requireOptionalNativeModule<MeasurementModule>('SuppClarityInstallMeasurement');
