export type IoTCertificateData = {
  endpoint: string;
  p12: string;
  p12Pass: string;
};

export type IoTCertificateResponse = {
  data: IoTCertificateData;
};
