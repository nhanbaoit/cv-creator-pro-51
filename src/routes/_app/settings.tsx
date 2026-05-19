import { createFileRoute } from "@tanstack/react-router";
import { Topbar } from "@/components/app/Topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useResumeStore, useActiveResume } from "@/lib/resume-store";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/_app/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const resume = useActiveResume();
  const { clearAll, importJSON } = useResumeStore();
  const [dark, setDark] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const exportJson = () => {
    if (!resume) return toast.error("Không có CV để export");
    const blob = new Blob([JSON.stringify(resume, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${resume.title}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Đã export JSON");
  };

  const onImport = async (f: File) => {
    const text = await f.text();
    if (useResumeStore.getState().importJSON(text)) toast.success("Đã import CV");
    else toast.error("File JSON không hợp lệ");
  };

  return (
    <>
      <Topbar title="Settings" subtitle="Tùy chỉnh tài khoản và ứng dụng" />
      <main className="p-6 md:p-8 max-w-3xl w-full mx-auto space-y-5">
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Hồ sơ</h3>
          <div className="flex items-center gap-4 mb-4">
            <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground grid place-items-center text-xl font-semibold">NB</div>
            <div>
              <div className="font-medium">Nguyễn Nhân Bảo</div>
              <div className="text-sm text-muted-foreground">nhanbao.0401@gmail.com</div>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label>Họ và tên</Label><Input defaultValue="Nguyễn Nhân Bảo" /></div>
            <div className="space-y-1.5"><Label>Email</Label><Input defaultValue="nhanbao.0401@gmail.com" /></div>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="font-semibold">Tùy chọn ứng dụng</h3>
          <div className="flex items-center justify-between">
            <div>
              <Label>Dark mode</Label>
              <p className="text-xs text-muted-foreground">Chuyển sang giao diện tối</p>
            </div>
            <Switch checked={dark} onCheckedChange={setDark} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Ngôn ngữ</Label>
              <p className="text-xs text-muted-foreground">Ngôn ngữ giao diện</p>
            </div>
            <span className="text-sm">Tiếng Việt</span>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="font-semibold">Dữ liệu</h3>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={exportJson}>Export resume JSON</Button>
            <Button variant="outline" onClick={() => fileRef.current?.click()}>Import resume JSON</Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && onImport(e.target.files[0])}
            />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Xóa tất cả dữ liệu</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xóa tất cả CV?</AlertDialogTitle>
                  <AlertDialogDescription>Toàn bộ CV và dữ liệu sẽ bị xóa khỏi trình duyệt.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                  <AlertDialogAction onClick={() => { clearAll(); toast.success("Đã xóa toàn bộ dữ liệu"); }}>Xóa hết</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </Card>
      </main>
    </>
  );
}
