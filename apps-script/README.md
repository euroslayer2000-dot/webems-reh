# FT EMS REH 2570 — Google Apps Script API

1. เปิด Google Sheet → **ส่วนขยาย → Apps Script**
2. ลบโค้ดเดิม แล้ววางโค้ดจาก `ft-ems.gs` ทั้งไฟล์
3. แก้ `TOKEN` เป็นสตริงสุ่มยาว ๆ (เช่น 32+ ตัวอักษร) และตรวจ `MONTH_SHEETS` / `SUMMARY_SHEET` ให้ตรงกับชื่อแท็บจริงทุกตัว
4. เลือกฟังก์ชัน `setupSheets` แล้วกด **เรียกใช้** (ครั้งแรกจะขอสิทธิ์ ให้อนุญาต) — จะเพิ่มแถวตัวชี้วัด 4 แถวใต้แถว TRAUMA ในชีตรายเดือน และเติมสูตรชีตสรุปรายการ 9–12 (รันซ้ำได้)
5. **Deploy → New deployment → ประเภท Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - กด Deploy แล้วคัดลอก **Web app URL** (ลงท้าย `/exec`)
6. ใส่ใน `.env` ของเว็บ แล้ว restart:
   ```
   FT_EMS_SCRIPT_URL=<Web app URL>
   FT_EMS_SCRIPT_TOKEN=<ค่าเดียวกับ TOKEN ในสคริปต์>
   ```
7. ถ้าแก้โค้ดสคริปต์ภายหลัง ต้อง **Deploy → Manage deployments → แก้ไข → New version** URL จึงใช้โค้ดใหม่

หมายเหตุ: "Anyone" แปลว่าใครมี URL ก็เรียกได้ แต่ทุกคำสั่งต้องมี `TOKEN` ถูกต้อง และเว็บเรียกจากฝั่งเซิร์ฟเวอร์เท่านั้น ห้ามใส่ TOKEN ใน client code / commit ลง git
