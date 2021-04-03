// 配置的数据类型
export type Config = {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
  DisableDebug: boolean;
  CORSRuleServices: string;
  CORSRuleManages: string;
  CORSRuleEvents: string;
  OffcnSmsURL: string;
  OffcnSmsUserName: string;
  OffcnSmsPassword: string;
  OffcnSmsTjCode: string;
  OffcnMisURL: string;
  OffcnMisAppID: string;
  OffcnMisToken: string;
  OffcnMisCode: string;
  TencentCloudAPISecretID: string;
  TencentCloudAPISecretKey: string;
  TencentCloudSmsSdkAppId: string;
  ServicesAccessToken: string;
  RSAPublicKey: string;
  RSAPrivateKey: string;
};
