// 数据类型 短链接
export type ShortLink = {
  ID: number;
  CreatedAt: string;
  DeletedAt: date | null;
  LastUpdatedAt: string;
  IDBase62Encode: string;
  CustomID: string;
  URL: string;
  Operational: boolean;
};
