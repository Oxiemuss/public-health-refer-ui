import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { ReferService } from '../../services/refer/refer.service';

// ชื่อ field ภาษาไทย ใช้แสดงผลตอนแจ้งเตือนว่ายังกรอกไม่ครบ
const FIELD_LABELS: Record<string, string> = {
  from_hcode: 'รพ.สต. ต้นทาง',
  to_hcode: 'โรงพยาบาลปลายทาง',
  refer_num: 'เลขที่หนังสือ',
  refer_date: 'วันที่ส่งต่อ (วัน/เดือน/ปี)',
  full_name: 'ชื่อ-สกุลผู้ป่วย',
  cid: 'เลขบัตรประจำตัวประชาชน',
  gender: 'เพศ',
  aged: 'อายุ',
  p_address: 'ที่อยู่ผู้ป่วย',
  tel: 'เบอร์โทรศัพท์ผู้ป่วย',
  bene_type: 'สิทธิการรักษา',
  complaint: 'อาการสำคัญ',
  pre_ill: 'ประวัติปัจจุบัน',
  vital_sign: 'สัญญาณชีพ',
  initial_diag: 'การวินิจฉัยเบื้องต้น',
  pre_treat: 'การรักษาที่ดำเนินการไปแล้ว',
  res_treat: 'การตอบสนองต่อการรักษา',
  reason_refer: 'เหตุผลในการส่งต่อ',
  triage_level: 'ระดับความเร่งด่วน',
  transport_type: 'วิธีการนำส่งต่อ',
  transport_follow: 'ผู้ติดตามผู้ป่วย',
  provider_name: 'ชื่อผู้ลงนามส่งต่อ',
  provider_position: 'ตำแหน่งผู้ลงนาม',
  provider_tel: 'เบอร์โทรผู้ลงนาม',
};

const SWAL_NAVY = '#1e3a8a';

@Component({
  selector: 'app-create-refer',
  templateUrl: './create-refer.component.html',
  imports: [CommonModule,ReactiveFormsModule],
  standalone: true
})
export class CreateReferComponent implements OnInit {
  referForm!: FormGroup;
  selectedFiles: File[] = []; // อาร์เรย์สำหรับเก็บไฟล์สแกนดิจิทัลที่เจ้าหน้าที่เลือก
  isSubmitting = false; // กันกดส่งซ้ำซ้อน

  // อ้างอิง Element ช่องกรอก วัน/เดือน/ปี ตรงส่วนหัวฟอร์มเพื่อใช้เคลียร์ค่า
  @ViewChild('dayInput') dayInput!: ElementRef<HTMLInputElement>;
  @ViewChild('monthSelect') monthSelect!: ElementRef<HTMLSelectElement>;
  @ViewChild('yearInput') yearInput!: ElementRef<HTMLInputElement>;

  constructor(
    private fb: FormBuilder,
    private referService: ReferService,
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.referForm = this.fb.group({
      from_hcode: ['08151', Validators.required],
      to_hcode: ['', Validators.required],
      refer_num: ['', [Validators.required, Validators.maxLength(20)]],
      refer_date: ['', Validators.required], // จะถูกมัดรวมค่าจากวัน/เดือน/ปี มาใส่ที่นี่
      full_name: ['', Validators.required],
      cid: [
        '',
        [
          Validators.required,
          Validators.minLength(13),
          Validators.maxLength(13),
          Validators.pattern('^[0-9]*$'),
        ],
      ],
      gender: ['', Validators.required],
      aged: ['', [Validators.required, Validators.maxLength(20)]],
      p_address: ['', Validators.required],
      tel: ['', [Validators.required, Validators.maxLength(20)]],
      bene_type: ['', Validators.required],
      complaint: ['', Validators.required],
      pre_ill: ['', Validators.required],
      past_ill: [''],
      allergy: [''],
      vital_sign: ['', Validators.required],
      initial_diag: ['', Validators.required],
      pre_treat: ['', Validators.required],
      res_treat: ['', Validators.required],
      reason_refer: ['', Validators.required],
      triage_level: ['', [Validators.required, Validators.maxLength(20)]],
      transport_type: ['', [Validators.required, Validators.maxLength(20)]],
      transport_follow: ['', Validators.required],
      provider_name: ['', Validators.required],
      provider_position: ['', Validators.required],
      provider_tel: ['', Validators.required],
      status: ['pending', Validators.required],
    });
  }

  /**
   * รวมค่าวัน/เดือน/ปี (จากช่องกรอกแยกในหัวฟอร์ม) เป็นรูปแบบ YYYY-MM-DD
   * แล้ว patch ลงใน control 'refer_date'
   */
  onDatePartChange(): void {
    const day = this.dayInput?.nativeElement.value?.trim() ?? '';
    const month = this.monthSelect?.nativeElement.value ?? '';
    const year = this.yearInput?.nativeElement.value?.trim() ?? '';

    // ต้องกรอกครบทั้ง 3 ช่อง และปีต้องครบ 4 หลัก (เช่น 2569)
    if (!day || !month || year.length !== 4) {
      // ถ้ากรอกไม่ครบ ให้เคลียร์ค่าใน refer_date เพื่อบังคับ validator required
      this.referForm.get('refer_date')?.setValue('');
      return;
    }

    const dayNum = parseInt(day, 10);
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);

    if (
      isNaN(dayNum) || dayNum < 1 || dayNum > 31 ||
      isNaN(monthNum) || monthNum < 1 || monthNum > 12 ||
      isNaN(yearNum)
    ) {
      this.referForm.get('refer_date')?.setValue('');
      return;
    }

    // ดักจับ: ถ้ากรอกมาเป็น พ.ศ. (ค่ามากกว่า 2500) ให้ลบ 543 เพื่อทำเป็น ค.ศ.
    // ถ้ากรอก ค.ศ. มา (ค่าน้อยกว่า 2500) ใช้ค่านั้นตรงๆ
    const adYear = yearNum > 2500 ? yearNum - 543 : yearNum;

    // มัดรวมเป็น YYYY-MM-DD พร้อมเติม 0 ข้างหน้ากรณีหลักเดียว
    const formattedDate = `${adYear}-${String(monthNum).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;

    this.referForm.get('refer_date')?.setValue(formattedDate);
  }

  /**
   * ดักจับไฟล์ที่เลือกและยัดใส่อาร์เรย์
   */
  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFiles.push(...Array.from(input.files));
      input.value = ''; // เคลียร์ค่า input เพื่อให้เลือกไฟล์ชื่อเดิมซ้ำได้
    }
  }

  /**
   * ลบไฟล์ออกจากคิวอัปโหลด
   */
  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  /**
   * หา field แรกที่ยังไม่ผ่าน validation แล้วคืนชื่อภาษาไทย
   * คืน null ถ้าฟอร์มผ่านทั้งหมด
   */
  private getFirstInvalidFieldLabel(): string | null {
    for (const key of Object.keys(this.referForm.controls)) {
      const control = this.referForm.get(key);
      if (control && control.invalid) {
        return FIELD_LABELS[key] ?? key;
      }
    }
    return null;
  }

  /**
   * ฟังก์ชันส่งข้อมูล (Submit)
   */
  onSubmit(): void {
    // 1. mark ทุก control ว่าถูกแตะแล้ว เพื่อให้ขึ้น error message / สีแดงใน UI
    this.referForm.markAllAsTouched();

    // 2. ดักกรณีฟอร์มไม่สมบูรณ์ พร้อมบอกชื่อ field ที่ขาด
    if (this.referForm.invalid) {
      const missingField = this.getFirstInvalidFieldLabel();
      Swal.fire({
        title: 'กรอกข้อมูลไม่ครบถ้วน!',
        text: missingField
          ? `กรุณาตรวจสอบช่อง "${missingField}" และข้อมูลที่จำเป็น (ดอกจัน) ให้ครบถ้วนก่อนส่งครับ`
          : 'กรุณาตรวจสอบและกรอกข้อมูลในช่องที่จำเป็น (ดอกจัน) ให้ครบครันก่อนส่งครับ',
        icon: 'warning',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: SWAL_NAVY,
      });
      return;
    }

    // 3. ป้องกันการกดส่งซ้ำ
    if (this.isSubmitting) {
      return;
    }

    // 4. แสดงตอกย้ำความมั่นใจก่อนยิงข้อมูลจริง
    Swal.fire({
      title: 'ยืนยันการส่งใบส่งตัว?',
      text: 'ระบบจะทำการบันทึกข้อมูลและอัปโหลดไฟล์เอกสารแนบเข้าสู่ระบบหลัก',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: SWAL_NAVY,
      cancelButtonColor: '#d33',
      confirmButtonText: 'ยืนยันส่งข้อมูล',
      cancelButtonText: 'ยกเลิก',
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        this.submitForm();
      }
    });
  }

  private submitForm(): void {
    this.isSubmitting = true;

    Swal.fire({
      title: 'กำลังส่งข้อมูล...',
      text: 'ระบบกำลังนำส่งข้อมูลและไฟล์เอกสารแนบ กรุณารอสักครู่',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    this.referService.createRefer(this.referForm.value, this.selectedFiles).subscribe({
      next: (res: { success: boolean; message?: string }) => {
        this.isSubmitting = false;
        if (res.success) {
          Swal.fire({
            title: 'สำเร็จเรียบร้อย!',
            text: 'บันทึกใบส่งตัวและอัปโหลดเอกสารดิจิทัลสำเร็จแล้วครับ',
            icon: 'success',
            confirmButtonColor: SWAL_NAVY,
            confirmButtonText: 'ตกลง',
          });
          this.clearFormAfterSuccess();
        } else {
          Swal.fire({
            title: 'เกิดข้อผิดพลาด!',
            text: res.message || 'หลังบ้านปฏิเสธการบันทึกข้อมูล',
            icon: 'error',
            confirmButtonColor: SWAL_NAVY,
          });
        }
      },
      error: (err: unknown) => {
        this.isSubmitting = false;
        console.error('API Error:', err);
        Swal.fire({
          title: 'ระบบขัดข้อง!',
          text: 'ไม่สามารถติดต่อเซิร์ฟเวอร์ได้ กรุณาเช็กเน็ตเวิร์กหรือ F12 Console ครับ',
          icon: 'error',
          confirmButtonColor: SWAL_NAVY,
        });
      },
    });
  }

  /**
   * ฟังก์ชันยกเลิกการกรอกฟอร์ม
   */
  onCancel(): void {
    Swal.fire({
      title: 'ยกเลิกการกรอกข้อมูล?',
      text: 'ข้อมูลทั้งหมดที่คุณพิมพ์และไฟล์ที่แนบไว้จะถูกล้างทิ้งทั้งหมด',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'ใช่, ล้างข้อมูลทั้งหมด',
      cancelButtonText: 'กลับไปกรอกข้อมูลต่อ',
    }).then((result) => {
      if (result.isConfirmed) {
        this.clearFormAfterSuccess();
        Swal.fire({
          title: 'ล้างฟอร์มสำเร็จ!',
          text: 'หน้าฟอร์มพร้อมสำหรับเริ่มกรอกเคสใหม่แล้วครับ',
          icon: 'info',
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  }

  private clearFormAfterSuccess(): void {
    this.referForm.reset({
      from_hcode: '08151',
      gender: '',
      bene_type: '',
      reason_refer: '',
      triage_level: '',
      transport_type: '',
      status: 'pending',
    });
    this.selectedFiles = []; // ล้างไฟล์แนบ

    // ล้างข้อความในช่อง วัน เดือน ปี บนหน้า HTML
    if (this.dayInput) this.dayInput.nativeElement.value = '';
    if (this.monthSelect) this.monthSelect.nativeElement.value = '';
    if (this.yearInput) this.yearInput.nativeElement.value = '';
  }

  onCustomBeneChange(event: Event): void {
    const customValue = (event.target as HTMLInputElement).value;
    if (customValue) {
      this.referForm.patchValue({ bene_type: customValue });
    }
  }

  onCustomReasonChange(event: Event): void {
    const customValue = (event.target as HTMLInputElement).value;
    if (customValue) {
      this.referForm.patchValue({ reason_refer: customValue });
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }
}