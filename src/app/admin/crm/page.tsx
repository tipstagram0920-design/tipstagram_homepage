import { redirect } from "next/navigation";

// CRM 대시보드는 메인 대시보드(/admin)에 통합되었습니다.
export default function CrmRedirect() {
  redirect("/admin");
}
