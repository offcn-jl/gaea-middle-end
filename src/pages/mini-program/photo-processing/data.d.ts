// 数据类型 证件照
export type PhotoProcessing = {
  ID: number;
  CreatedAt: string;
  DeletedAt: date | null;
  LastUpdatedAt: string;
  Operational: boolean;
  Name: string; // 照片处理名称
  Project: string; // 项目
  CRMEventFormID: number; // CRM 活动表单 ID
  CRMEventFormSID: string; // CRM 活动表单 SID
  MillimeterWidth: number; // MM 毫米 宽度
  MillimeterHeight: number; // MM 毫米 高度
  PixelWidth: number; // PX 像素 宽度
  PixelHeight: number; // PX 像素 高度
  BackgroundColors: string; // 背景色列表
  Description?: string; // 备注
  Hot: boolean; // 是否热门
};
