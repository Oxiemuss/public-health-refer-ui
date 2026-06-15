import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { ReferData, ReferResponse } from '../interface/refer.interface';
import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root',
})

export class ReferService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;


  createRefer(referData: any, files: File[]): Observable<ReferResponse>{
    const formData = new FormData();

    Object.keys(referData).forEach((key) => {
      const value = referData[key];
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    // 2. วนลูปนำไฟล์แนบทั้งหมดใส่ในคีย์ชื่อ 'files'
    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append('files', file);
      });
    }

    // 3. ยิง HTTP POST ไปที่หลังบ้าน
    return this.http.post<ReferResponse>(`${this.API_URL}/refer/createrefer`, formData);
  }
}
