import { Component } from "@angular/core";

@Component({
  selector: "app-about-page",
  templateUrl: "./about-page.component.html",
  styleUrls: ["./about-page.component.css"],
})
export class AboutPageComponent {
  introduction = [
    {
      icon: "info",
      text: "Thành lập năm 2024, ElPearl Tourist là thành viên của Tập đoàn TMG Việt Nam với hơn 20 năm kinh nghiệm trong lĩnh vực Du lịch – Khách sạn.",
    },
    {
      icon: "flight_takeoff",
      text: " ElPearl Tourist tiên phong trong việc sáng tạo các sản phẩm du lịch tiện ích dành cho khách hàng nội địa.",
    },
    {
      icon: "hotel",
      text: "Hệ thống khoảng 2,500 khách sạn tại Việt Nam & hơn 30,000 khách sạn quốc tế.",
    },
    {
      icon: "star",
      text: "Liên tục tăng trưởng mạnh qua nhiều năm,  ElPearl Tourist hiện là OTA hàng đầu Việt Nam trong phân khúc cao cấp.",
    },
    {
      icon: "group",
      text: "Mục tiêu mang đến cho khách hàng “Trải nghiệm kỳ nghỉ tuyệt vời” và kỳ vọng trở thành nền tảng du lịch nghỉ dưỡng số 1 cho khách hàng Đông Nam Á trong 5 năm tới.",
    },
    {
      icon: "card_travel",
      text: "Dòng sản phẩm chính là Combo du lịch bao gồm phòng khách sạn, vé máy bay, đưa đón, ăn uống, khám phá,… chỉ trong 1 lần đặt.",
    },
    {
      icon: "flash_on",
      text: "Những dòng combo  ElPearl Tourist mang lại: combo tiết kiệm, voucher độc quyền, ưu đãi đặt sớm và flash sales.",
    },
    {
      icon: "lightbulb_outline",
      text: "Áp dụng công nghệ vào việc đọc hiểu nhu cầu của thị trường, nghiên cứu phát triển sản phẩm và gợi ý những sản phẩm và dịch vụ tốt nhất.",
    },
    {
      icon: "phone",
      text: "Khách hàng có thể đặt dịch vụ qua nhiều kênh: website, hotline, chat bot, app, Facebook và các mạng xã hội khác.",
    },
  ];

  contacts = [
    "Dịch vụ khách hàng, đặt phòng khách sạn: Hotline 1900 1870 – Email: ElPeael1902003@gmail.com",
    "Nhà cung cấp liên hệ – Email: ElPeael1902003@gmail.com",
    "Liên hệ Marketing – Email: ElPeael1902003@gmail.com",
    "Các liên hệ khác: 0936098687",
  ];
}
