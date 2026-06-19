import { WebinarEditor } from "../WebinarEditor";
import { PRESET_STEPS } from "@/lib/crm/webinar-preset";

export default function NewWebinarPage() {
  return (
    <div>
      <h1 className="text-2xl font-black text-neutral-900 mb-6">새 웨비나 캠페인</h1>
      <WebinarEditor preset={PRESET_STEPS} />
    </div>
  );
}
