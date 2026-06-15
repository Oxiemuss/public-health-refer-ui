export interface ReferData {
  rid?: string;                 // UUID (ถ้าฝั่งหลังบ้านหรือ Supabase เป็นคนเจนให้)
  from_hcode: string;          // รหัส/ชื่อ รพ.สต. ต้นทาง
  to_hcode: string;            // รหัส/ชื่อ โรงพยาบาลปลายทาง
  refer_num: string;           // เลขที่หนังสือ
  refer_date: string;          // วันที่ส่งต่อ (YYYY-MM-DD)
  full_name: string;           // ชื่อ-สกุล ผู้ป่วย
  cid: string;                 // เลขบัตรประชาชน 13 หลัก
  gender: 'ชาย' | 'หญิง';
  aged: string;                // อายุ
  p_address: string;           // ที่อยู่ปัจจุบัน
  tel: string;                 // เบอร์โทรผู้ป่วย
  bene_type: string;           // สิทธิการรักษา
  complaint: string;           // อาการสำคัญ
  pre_ill: string;             // ประวัติปัจจุบัน
  past_ill?: string;           // ประวัติการเจ็บป่วยเดิม
  allergy?: string;            // ประวัติแพ้ยา/อาหาร
  vital_sign: string;          // ผลตรวจร่างกาย / สัญญาณชีพ
  initial_diag: string;        // การวินิจฉัยเบื้องต้น
  pre_treat: string;           // การรักษาเบื้องต้น
  res_treat: string;           // การตอบสนองต่อการรักษา
  reason_refer: string;        // เหตุผลในการส่งต่อ
  triage_level: 'ปกติ' | 'เร่งด่วน' | 'ฉุกเฉิน'; // ระดับความเร่งด่วน
  transport_type: string;      // วิธีการนำส่งต่อ
  transport_follow?: string;   // ผู้ติดตามผู้ป่วย
  provider_name: string;       // ชื่อเจ้าหน้าที่ผู้ลงนาม
  provider_position: string;   // ตำแหน่ง
  provider_tel: string;        // เบอร์โทรเจ้าหน้าที่
  status?: 'pending' | 'accepted' | 'rejected'; // สถานะใบส่งตัว
  created_at?: string;
  updated_at?: string;
}

// Interface สำหรับจัดการรูปแบบ Response ที่ส่งกลับมาจาก Node.js
export interface ReferResponse {
  success: boolean;
  message?: string;
}